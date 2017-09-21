var http = require("http");

/**
 * Start listening using a built app instance.
 *
 * @param  {Function} handler
 * @param  {Number} port
 * @return {http.Server}
 */
module.exports = function serve (handler, port) {
  var server = http.createServer(handler);
  server.listen(port, function () {
    // TODO: Something a bit fancier here
    console.log("App is now serving on port " + server.address().port);
  });
  return server;
}