// Require our dependencies
var express = require('express'),
  exphbs = require('express-handlebars'),
  http = require('http'),
  twitter = require('twitter'),
  config = require('./config'),
  bodyParser = require('body-parser'),
  streamHandler = require('./utils/streamHandler');

// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8083;
var twit = new twitter(config.twitter);

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.post('/search', function (req, res) {
  twit.get('search/tweets', req.body, function (error, tweets, response) {
    return res.send(tweets);
  });
});

app.post('/tweet', function (req, res) {
  twit.post('statuses/update', req.body, function (error, tweet, response) {
    if (!error) {
      return res.send(tweet);
    }
  });
});

// Fire this bitch up (start our server)
var server = http.createServer(app).listen(port, function () {
  console.log('Express server listening on port ' + port);
});

// Initialize socket.io
var io = require('socket.io').listen(server);

// Set a stream listener for tweets matching tracking keywords
twit.stream('statuses/filter', { track: '#nowplaying' }, function (stream) {
  streamHandler(stream, io);
});
