const http = require('http'); // debug
const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socketio = require('socket.io');

const keys = require('./config/keys');
const passportSetup = require('./config/passport-setup');

// const apiRoutes = require('./routes/api-routes');
const authRoutes = require('./routes/auth-routes');
const commandRoutes = require('./routes/command-routes');
const consoleRoutes = require('./routes/console-routes');
const devicesRoutes = require('./routes/devices-routes');

const mqttClient = require('./modules/mqtt-client');
const Temi = require('./modules/temi');


// constants
const port = process.env.PORT || 5000;

// CA certificates
const ssl_options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.crt')),
};

// instantiate webapp
const app = express();

// setup template engine
app.set('view engine', 'ejs');

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

// initialize passport and cookie session
app.use(passport.initialize());
app.use(passport.session());

// body-parser middleware
app.use(bodyParser.json());

// connect to mongodb
mongoose
  .connect(keys.mongodb.dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.log(err));

// set up routes
// app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/command', commandRoutes);
app.use('/console', consoleRoutes);
app.use('/devices', devicesRoutes);

// create home route
app.get('/', (req, res) => {
  res.render('login', { user: req.user });
});

// create server and websocket connection
// const server = http.createServer(app);
const server = https.createServer(ssl_options, app);
const io = socketio(server);

// socket.io handlers
io.on('connection', socket => {
  const temi = new Temi(mqttClient);

  console.log('Socket.IO connection registered...'); 
  
  // disconnection event
  socket.on('disconnect', () => {
    console.log('Socket.IO connection de-registered...');
  });

  // gamepad event
  socket.on('gamepad', data => {
    const obj = JSON.parse(data);

    // parse and forward to MQTT
    if ('translate' in obj) {
      // temi.translate(..., data.translate);
    }

    if ('rotate' in obj) {
      // temi.rotate(..., data.rotate);
    }

    if ('tilt' in obj) {
      // temi.tilt(..., data.tilt);
    }
  });

  // keyboard event
  socket.on('keyboard', data => {
    console.log(data);

    // parse and forward to MQTT
    if ('rotate' in data) {
      temi.rotate(data.serial, data.rotate);
    }
    
    if ('translate' in data) {
      temi.translate(data.serial, data.translate);
    }

    if ('tilt' in data) {
      temi.tiltBy(data.serial, data.tilt);
    }
  });
});

// start server
server.listen(port, () => console.log(`Server is listening on port ${port}`));
