var Context = require("./context");

/**
 * Attaches the result of the given function (promise) to the specified
 * key that can be accessed in following middleware.  Useful for attaching
 * DB instances or authenticated user info.
 *
 * @param  {string} key
 * @param  {Function} factory
 * @return {Function}
 */
function resolve (key, factory) {
  Context.assertSafeKey(key);
  return function (ctx, next) {
    return Promise
      .resolve(factory(ctx))
      .then(function (val) {
        ctx[key] = val;
        return next();
      });
  };
}