/**
 * Composes middleware (or an array of middleware) into a single HTTP
 * request handler function.
 */
module.exports = function brew (middleware) {
  middleware = (Array.isArray(middleware) ? mix(middleware) : middleware);
  return function (req, res) {
    var ctx = new Context(req, res);
    middleware(ctx).then(function () {

    });
  };
}