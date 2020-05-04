const router = require('express').Router();
const User = require('../models/user-model');

// @route   GET api/devices
// @desc    Get all devices
// @access  Public
router.get('/devices', (req, res) => {
  User.findById(req.query.id)
    .then(user => res.json(user.devices))
    .catch(err => res.status(404).json({ 'success': false }));
});

// @route   POST api/devices
// @desc    Add device
// @access  Public
router.post('/devices', (req, res) => {
  const newDevice = { 'name': req.body.name, 'serialNumber': req.body.serialNumber };
  
  User.find({ _id: req.query.id, 'devices.serialNumber': req.body.serialNumber })
    .then(dev => {
      if (dev === undefined || dev.length === 0) {
        console.log('Adding device')
        User.updateOne({ _id: req.query.id }, { $push: { devices: newDevice } })
          .then(() => res.json({ 'success': true }))
          .catch(err => res.status(404).json({ 'success': false }));
      } else {
        console.log('Device already exists');
        res.json({ exists: true });
      }
    })
    .catch(err => res.status(404).json({ 'success': false }));
});

// @route   DELETE api/devices
// @desc    Delete device
// @access  Public
router.delete('/devices', (req, res) => {
  User.find({ _id: req.query.id, 'devices.serialNumber': req.query.serialNumber })
    .then(dev => {
      if (dev === undefined || dev.length === 0) {
        console.log('Device does not exist');
          res.json({ exists: false });
      } else {
        console.log('Device exists');
          User.findByIdAndUpdate(req.query.id, { $pull: { 'devices': { serialNumber: req.query.serialNumber } } })
            .then(() => res.json({ 'success': true }))
            .catch(err => res.status(404).json({ 'success': false }));
        }
      })
    .catch(err => res.status(404).json({ 'success': false }));
});

module.exports = router;
