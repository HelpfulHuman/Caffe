var ERR_MIDDLEWARE = "Bad Argument: Middleware must be an array of functions!";

/**
 * Composes an array of middleware into a single middleware function.
 *
 * @param  {Function[]} middleware
 * @return {Function}
 */
module.exports = function mix (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError(ERR_MIDDLEWARE);
  for (var i = 0; i < middleware.length; i++) {
    if (typeof middleware[i] !== "function") throw new TypeError(ERR_MIDDLEWARE);
  }

  return function (ctx, next) {
    var index = -1;
    var callNext = function (i) {
      // Fail if a middleware is calling next() more than once
      if (i <= index) return Promise.reject(new Error("Middleware should not invoke the given next() function more than once."));
      // Update the tracking index
      index = i;
      // Determine which middleware to invoke next
      var _next = (i < middleware.length ? middleware[i] : next);
      // If the next method is not a function, quit!
      if (!_next) return Promise.resolve();
      // Invoke the next middleware and capture any errors that are thrown
      try {
        return Promise.resolve(_next(ctx, function () {
          return callNext(i + 1);
        }));
      } catch (err) {
        return Promise.reject(err);
      }
    };
    return callNext(0);
  };
}