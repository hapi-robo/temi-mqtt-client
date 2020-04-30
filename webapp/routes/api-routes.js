const router = require('express').Router();
const User = require('../models/user-model');

// @route   GET api/users
// @desc    Get all users
// @access  Public
// router.get('/users', (req, res) => {
//   User.findById(req.query.id)
//     .then(user => res.json(user.robots))
//     .catch(err => res.status(404).json({ success: false }))
// });

// @route   GET api/robots
// @desc    Get all robots
// @access  Public
router.get('/robots', (req, res) => {
  User.findById(req.query.id)
    .then(user => res.json(user.robots))
    .catch(err => res.status(404).json({ success: false }))
});

// @route   POST api/robots
// @desc    Add robot
// @access  Public
router.post('/robots', (req, res) => {
  // @TODO check parameters
  const newRobot = { 'name': req.body.name, 'serialNumber': req.body.serialNumber };
  User.find({ _id: req.query.id, 'robots.serialNumber': req.body.serialNumber })
    .then(user => {
      if (user === undefined || user.length === 0) {
        console.log('Adding robot')
        User.update({ _id: req.query.id }, { $push: { robots: newRobot } })
          .then(user => res.json(newRobot));
      } else {
        console.log('Robot already exists');
        res.json({ exists: true });
      }
    })
    .catch(err => res.status(404).json({ success: false }));
});

// @route   DELETE api/robots
// @desc    Delete robot
// @access  Public
router.delete('/robots', (req, res) => {
  // @TODO check parameters
  User.find({ _id: req.query.id, 'robots.serialNumber': req.query.serialNumber })
    .then(user => {
      if (user === undefined || user.length === 0) {
        console.log('Robot does not exist');
          res.json({ exists: false });
      } else {
        console.log('Robot exists');
          User.findByIdAndUpdate(req.query.id, { $pull: { 'robots': { serialNumber: req.query.serialNumber } } })
            .then(user => res.json({ success: true }))
            .catch(err => res.status(404).json(user.robots));
        }
      })
    .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
