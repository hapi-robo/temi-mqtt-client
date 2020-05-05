const router = require('express').Router();

const User = require('../models/user-model');
const deviceListAll = require('../modules/mqtt-message-parser');


// constants
const SERIAL_NUMBER_LENGTH = 11;


// middleware to check if user is already logged in
const authCheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/login');
  } else {
    next();
  }
};

// render device page
router.get('/', authCheck, (req, res) => {
  res.render('devices', { user: req.user });
});

//-------------------------------------------------------
// Device Routes

// @route   GET devices/get
// @desc    Get all devices
// @access  OAuth
router.get('/get', authCheck, (req, res) => {
  // get devices from our database
  User.findById(req.user.id)
    .then(user => res.json(user.devices))
    .catch(err => res.status(404).json({ 'success': false }));
});

// @route   POST devices/add
// @desc    Add device
// @access  OAuth
router.post('/add', authCheck, (req, res) => {
  // check parameters
	if (req.body.serialNumber.length !== SERIAL_NUMBER_LENGTH) {
    res.json({ 'success': false});
  }

  // construct new device
  const newDevice = { 'name': req.body.name, 'serialNumber': req.body.serialNumber };

  // find and add new device
  User.find({ _id: req.user.id, 'devices.serialNumber': req.body.serialNumber })
    .then(dev => {
      if (dev === undefined || dev.length === 0) {
        console.log(`Adding device: ${req.body.serialNumber}`);
        User.updateOne({ _id: req.user.id }, { $push: { devices: newDevice } })
          // .then(() => res.json({ 'success': true, 'exists': false }))
          .then(() => {
            User.findById(req.user.id)
              .then(user => res.json(user.devices))
              .catch(err => res.status(404).json({ 'success': false }));
          })
          .catch(err => res.status(404).json({ 'success': false }));
      } else {
        console.log(`Device already exists...`);
        res.json({ 'success': true, 'exists': true });
      }
    })
    .catch(err => res.status(404).json({ 'success': false }));
});

// @route   DELETE devices/delete
// @desc    Delete device
// @access  OAuth
router.delete('/delete', authCheck, (req, res) => {
  // check parameters
  if (req.query.serialNumber.length !== SERIAL_NUMBER_LENGTH) {
    res.json({ 'success': false});
  }

  // find and remove device
  User.find({ _id: req.user.id, 'devices.serialNumber': req.query.serialNumber })
    .then(dev => {
      if (dev === undefined || dev.length === 0) {
        console.log(`Device does not exist...`);
        res.json({ 'success': true, 'exists': false });
      } else {
        console.log(`Deleting device: ${req.query.serialNumber}`);
        User.findByIdAndUpdate(req.user.id, { $pull: { 'devices': { serialNumber: req.query.serialNumber } } })
          // .then(() => res.json({ 'success': true, 'exists': true }))
          .then(() => {
            User.findById(req.user.id)
              .then(user => res.json(user.devices))
              .catch(err => res.status(404).json({ 'success': false }));
          })
          .catch(err => res.status(404).json(user.devices));
        }
      })
    .catch(err => res.status(404).json({ 'success': false }));
});

//-------------------------------------------------------
// Device Location Routes

// @route   GET devices/get
// @desc    Get all locations
// @access  OAuth
router.get('/location/get', authCheck, (req, res) => {
  console.log('Get locations');
  console.log(req.query.serialNumber);

  // get device from memory
  res.json({ 'success': false })
});

// @route   POST devices/add
// @desc    Add device
// @access  OAuth
router.post('/location/add', authCheck, (req, res) => {
  console.log('Add location');
  console.log(req.query.serialNumber);

  // get device from memory
  res.json({ 'success': false })
});

// @route   DELETE devices/delete
// @desc    Delete device
// @access  OAuth
router.delete('/location/delete', authCheck, (req, res) => {
  console.log('Delete locations');
  console.log(req.query.serialNumber);

  // get device from memory
  res.json({ 'success': false })
});

module.exports = router;