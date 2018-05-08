module.exports = function (stream, io) {

  // When tweets get sent our way ...
  stream.on('data', function (data) {
    if (data['user'] !== undefined) {
      io.emit('tweet', data);
    }
  });

};
