var assert  = require("chai").assert;
var sinon   = require("sinon");
var { mix } = require("../");

function wait (ms) {
  if (!ms) ms = 1;
  return new Promise(accept => setTimeout(accept, ms));
}

describe("mix()", function () {

  var mw;

  beforeEach(function () {
    mw = sinon.spy((ctx, next) => next());
  });

  it("throws an error when an array is not provided", function () {
    var e;
    try {
      var test = mix("notanarray");
    } catch (err) {
      e = err;
    }
    assert.instanceOf(e, TypeError);
  });

  it("throws an error when an array composed only of middleware functions is not provided", function () {
    var e;
    try {
      var test = mix([mw, "not a func", mw]);
    } catch (err) {
      e = err;
    }
    assert.instanceOf(e, TypeError);
  });

  it("returns a function that returns a Promise when invoked", function () {
    var test = mix([]);

    assert.isFunction(test);
    assert.instanceOf(test({}), Promise);
  });

  it("works with an empty middleware array", function () {
    var test = mix([]);

    return test({});
  });

  it("returns a function that invokes its middleware even with no next() method provided", function () {
    var test = mix([mw]);

    return test({}).then(function () {
      assert.equal(mw.callCount, 1);
    });
  });

  it("returns a function that can be called more than once without modifying the originally provided array", function () {
    var test = mix([mw, mw]);

    return test({})
    .then(function () {
      assert.equal(mw.callCount, 2);
      return test({});
    })
    .then(function () {
      assert.equal(mw.callCount, 4);
      return test({});
    })
    .then(function () {
      assert.equal(mw.callCount, 6);
    });
  });

  it("returns a function that invokes the given next() method when the middleware stack is completed", function () {
    var next = sinon.spy(() => {})
    var test = mix([mw]);

    return test({}, next).then(function () {
      assert.equal(mw.callCount, 1);
      assert.equal(next.callCount, 1);
    });
  });

  it("returns a function that handle asynchronous operations via promises", function () {
    var waitMw = sinon.spy((ctx, next) => wait().then(next));
    var next = sinon.spy(() => {})
    var test = mix([waitMw, waitMw]);

    return test({}, next).then(function () {
      assert.equal(waitMw.callCount, 2);
      assert.equal(next.callCount, 1);
    });
  });

  it("can be mixed into other middleware as nested middlewares", function () {
    var test1 = sinon.spy(mix([mw]));
    var test2 = sinon.spy(mix([mw, mw]));
    var test3 = mix([mw, test1, test2]);

    return test3({}).then(function () {
      assert.equal(mw.callCount, 4);
      assert.equal(test1.callCount, 1);
      assert.equal(test2.callCount, 1);
    });
  });


  it("returns a function that handle errors thrown by given middleware", function () {
    var err   = new Error("Something failed");
    var _mw   = sinon.spy(() => { throw err; });
    var test  = mix([_mw, mw]);

    return test({})
      .then(function () {
        return Promise.reject(new Error(".then() should not have been invoked due to error!"));
      })
      .catch(function (_err) {
        assert.equal(_mw.callCount, 1);
        assert.equal(mw.callCount, 0);
        assert.equal(_err, err);
      });
  });

  it("returns a function that handles errors thrown by the given top level next() middleware", function () {
    var err   = new Error("Something failed");
    var _mw   = sinon.spy(() => { throw err; });
    var test  = mix([mw, mw]);

    return test({}, _mw)
      .then(function () {
        return Promise.reject(new Error(".then() should not have been invoked due to error!"));
      })
      .catch(function (_err) {
        assert.equal(mw.callCount, 2);
        assert.equal(_mw.callCount, 1);
        assert.equal(_err, err);
      });
  });

  it("returns a function that handles errors which are handled by Promise.reject()", function () {
    var err   = new Error("Something failed");
    var _mw   = sinon.spy(() => Promise.reject(err));
    var test  = mix([_mw, mw]);

    return test({})
      .then(function () {
        return Promise.reject(new Error(".then() should not have been invoked due to error!"));
      })
      .catch(function (_err) {
        assert.equal(_err, err);
        assert.equal(_mw.callCount, 1);
        assert.equal(mw.callCount, 0);
      });
  });

  it("returns a function that passes the context object to each middleware function", function () {
    var ctx = {};
    var _mw = sinon.spy(function (_ctx, next) {
      assert.equal(_ctx, ctx);
      return next();
    });
    var test = mix([_mw, _mw, _mw]);

    return test(ctx).then(function () {
      assert.equal(_mw.callCount, 3);
    });
  });

  it("throws an error if next() is invoked multiple times by the same middleware", function () {
    var dblNext = sinon.spy((ctx, next) => next().then(next));
    var test = mix([dblNext])

    return test({})
    .then(function () {
      return Promise.reject(new Error(".then() should not have been invoked due to error!"));
    })
    .catch(function (err) {
      assert.equal(dblNext.callCount, 1);
      assert.match(err.message, /more than once/);
    });
  });

});