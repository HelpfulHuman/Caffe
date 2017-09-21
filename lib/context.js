/**
 * Represents the request and response for an HTTP request.
 *
 * @param  {http.Request} req
 * @param  {http.Response} res
 */
function Context (req, res) {
  this.request  = req;
  this.response = res;
}

/**
 * Tests the given key and makes sure that it could be safely set without
 * damaging the base functionality provided by Context and Caffe.  Throws
 * an error if the given key is "not safe" to set.
 *
 * @param  {String} key
 */
Context.assertSafeKey = function (key) {
  if (Context.prototype[key]) {
    throw new Error(`The provided key "${key} is not allowed as it is "protected" by the Context object.`);
  }
}

module.exports = Context;