# Caffe

Caffe is a framework for quickly creating web services in a functional way using NodeJS.  The Caffe toolkit is a collection of building blocks for quickly generating endpoints and middleware for your application.  Caffe is heavily inspired by popular libraries such as [ExpressJS](http://expressjs.com/), [KoaJS](http://koajs.com/) and [Echo (Go)](https://echo.labstack.com/).

## Getting Started

Install via `npm`:

```
npm install --save caffe
```

## Basic Example

Let's quickly create a REST service using a few of the main functions exposed by Caffe.  One of the most import methods you should know about is `brew()`.  The `brew()` function composes 1 or more Caffe middleware into a single HTTP request handler that is compatible with Node's `http` module.

> **Note:** The `.serve()` method is a shorthand for `http.createServer().listen()` that uses Caffe's built-in logging.

Ok, let's get the obligatory "Hello World" example out of the way.  Here we see the that we have used the `brew()` method in conjunction with `json()`.  The `json()` utility allows you to quickly send a JSON response body using either a static object literal or a function.

> **Note:** There are several other utilities for formatting response, including `text()`, `xml()` and `html()`.  All response utilities require that the status code be explicitly set.

```js
var caffe = require("caffe");

var app = caffe.brew([
  caffe.json(200, { message: "Hello World" }),
]);

caffe.serve(app, 4000);
```

## Advanced Example

Let's create basic todo app with a few other `caffe-*` libraries.

```js
var caffe     = require("caffe");
var mongo     = require("caffe-mongo");
var validate  = require("caffe-validate");

/**
 * List all of the todos in the database.
 */
var listTodos = caffe.GET("/todos", [
  validate.query(is => ({
    limit: is.number(50).min(1).max(150),
  })),
  mongo.exec("todos", (todos, ctx) => {
    return todos.find().limit(ctx.query.limit);
  }),
  caffe.json(200, (ctx) => ({ data: ctx.todos })),
]);

/**
 * Add a new todo to the database.
 */
var addTodo = caffe.POST("/todos", [
  validate.input(is => ({
    name: is.string().required().max(240),
  })),
  mongo.exec({ on: "todos", as: "newTodo" }, (todos, ctx) => {
    return todos.insert(ctx.input);
  }),
  caffe.json(201, (ctx) => ({ data: ctx.newTodo })),
]);

/**
 * Complete a todo that is in the database.
 */
var completeTodo = caffe.DEL("/todos/:todoId", [
  mongo.exec({ on: "todos", as: "delTodo" }, (todos, ctx) => {
    var id = mongo.id(ctx.params.todoId);
    return todos.remove({ _id: id }).limit(1);
  }),
  caffe.json(201, (ctx) => ({ data: ctx.delTodo }))
]);

/**
 * Create the HTTP handler for the requests.
 */
var app = caffe.brew([
  caffe.cors(),
  caffe.body(),
  mongo.connect("mongodb://localhost/caffe-example"),
  listTodos,
  addTodo,
  completeTodo,
]);

/**
 * Start the application.
 */
caffe.serve(app, 4000);
```



## Methods

#### `brew(middleware: Middleware[]) Function`

Create an HTTP handler using the given middleware function(s).  Generates the `Context` object for each request and automatically adds a default error handler.

```js
caffe.brew([
  middleware,
]);
```

#### `mix(middleware: Middleware[]) Middleware`

Combine multiple middleware functions into a single middleware function.  Each middleware function will be run in a series and the result will be returned back up.

```js
caffe.mix([
  middlewareOne,
  middlewareTwo,
]);
```

#### `serve(handler: Function, port: Number)`

Acts as an alias for `http.createServer(handler).listen(port)`.

```js
var app = caffe.brew([ ... ]);

caffe.serve(app, 5000);
```

#### `resolve(key: String, factory: Function) Middleware`

Add a factory function that will be invoked at the time of the request and the result will be attached to the context for future middleware to utilize.  Supports async operations via returned `Promise` values.

```js
caffe.resolve("config", function (ctx) {
  return { lang: "en" };
});
```
