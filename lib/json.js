var isFunc = require("lodash/isFunction");

/**
 * Respond with a JSON response body.
 *
 * @param  {Int} statusCode
 * @param  {Object|Function} result
 * @return {Function}
 */
module.exports = function json (status, result) {
  return function (ctx, next) {
    ctx.statusCode = status;
    ctx.headers["Content-Type"] = "application/json";
    ctx.body = JSON.stringify(isFunc(result) ? result(ctx) : result);
  };
}
