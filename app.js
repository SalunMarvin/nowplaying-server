// Dependencies Requirement
var express = require('express');
var exphbs = require('express-handlebars');
var http = require('http');
var twitter = require('twitter');
var config = require('./config');
var bodyParser = require('body-parser');
var streamHandler = require('./websocket');

// New express application and execution port
var app = express();
var port = process.env.PORT || 8083;

// New Twitter instance
var Twitter = new twitter(config.twitter);

// Disable etag
app.disable('etag');

// Allow URLEncoded and JSON on Request Body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Allow CORS 
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// App Routes
app.post('/search', function (req, res) {
  Twitter.get('search/tweets', req.body, function (error, tweets, response) {
    return res.send(tweets);
  });
});

app.post('/tweet', function (req, res) {
  Twitter.post('statuses/update', req.body, function (error, tweet, response) {
    if (!error) {
      return res.send(tweet);
    }
  });
});

// Start Server
var server = http.createServer(app).listen(port, function () {
  console.log('Running application on port: ' + port);
});

// Socket.IO
var io = require('socket.io').listen(server);

// Websocket to follow Now Playing tracks
Twitter.stream('statuses/filter', { track: '#nowplaying' }, function (stream) {
  streamHandler(stream, io);
});
