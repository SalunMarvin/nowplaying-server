module.exports = function (stream, io) {


  // Send New Tweet via Websocket to the frontend
  stream.on('data', function (data) {
    if (data['user'] !== undefined) {
      io.emit('tweet', data);
    }
  });

};
