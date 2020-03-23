/**
 * Main backend NodeJS file.
 *
 * Starts an HTTP server.
 *
 * Reference:
 *  https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/skeleton_website
 *
 */

// required libraries
const express = require("express");
const path = require("path");

// instantiate webapp
const app = express();
const port = 8080;

/*
 * Setup webapp
 */
// setup template engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// mobile route
app.get("/mobile", function(req, res) {
  res.render("mobile", {});
});

// desktop route
app.get("/", function(req, res) {
  res.render("index", {
    title: " Connect"
  });
});

// catch 404 and forward to the error handler
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// catch errors handler and render error page
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") == "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

/*
 * Start listening on the port
 */
app.listen(port, err => {
  if (err) {
    return console.log(`Something bad happened ${err}`);
  }

  console.log(`Server is listening on localhost:${port}`);
});
