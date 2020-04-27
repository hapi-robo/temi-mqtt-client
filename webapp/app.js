/**
 * Main backend NodeJS file.
 *
 */
const express = require("express");
const path = require("path");
const cookieSession = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');

const passportSetup = require('./config/passport-setup');
const keys = require('./config/keys');

const authRoutes = require('./routes/auth-routes');
const consoleRoutes = require('./routes/console-routes');

// constants
const port = 8080;

// instantiate webapp
const app = express();

// setup template engine
app.set("view engine", "ejs");

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

// initialize passport and cookie session
app.use(passport.initialize());
app.use(passport.session());

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, {useNewUrlParser: true, useUnifiedTopology: true});

// set up routes
app.use('/auth', authRoutes);
app.use('/console', consoleRoutes);

// create home route
app.get("/", (req, res) => {
  res.render('home', { user: req.user });
});

// start listening on the port
app.listen(port, err => {
  if (err) {
    return console.log(`Something bad happened ${err}`);
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
