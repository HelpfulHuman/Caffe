var Context = require("./context");

/**
 * Inject a value as is to the context object using the given key.
 *
 * @param  {String} key
 * @param  {Any} value
 * @return {Function}
 */
module.exports = function inject (key, value) {
  Context.assertSafeKey(key);
  return function (ctx, next) {
    ctx[key] = value;
    return next();
  };
}