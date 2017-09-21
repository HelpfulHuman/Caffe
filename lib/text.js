var isFunc = require("lodash/isFunction");

/**
 * Respond with a standard plain text response body.
 *
 * @param  {Int} statusCode
 * @param  {String|Function} result
 * @return {Function}
 */
module.exports = function text (status, result) {
  return function (ctx, next) {
    ctx.statusCode = status;
    ctx.headers["Content-Type"] = "text/plain";
    ctx.body = (isFunc(result) ? result(ctx) : result);
  };
}