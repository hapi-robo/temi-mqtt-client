const router = require("express").Router();

const User = require("../models/user-model");
const authCheck = require("../modules/auth");
const deviceListAll = require("../modules/mqtt-message-parser");

// constants
const SERIAL_LENGTH = 11; // temi's serial number is 11-digits long

// @route   GET console/
// @desc    Render device page
// @access  OAuth
router.get("/", authCheck, (req, res) => {
  res.render("devices", { user: req.user });
});

//-------------------------------------------------------
// Device Routes

// @route   GET devices/get
// @desc    Get all devices
// @access  OAuth
router.get("/get", authCheck, (req, res) => {
  User.findById(req.user.id)
    .then(user => res.json(user.devices))
    .catch(err => res.status(404).json({ err }));
});

// @route   POST devices/add
// @desc    Add device
// @access  OAuth
router.post("/add", authCheck, (req, res) => {
  // check parameters
  if (req.body.serial.length !== SERIAL_LENGTH) {
    res.status(404).json({ err: "Invalid serial number" });
  }

  // construct new device
  const newDevice = {
    name: req.body.name,
    serial: req.body.serial
  };

  // find and add new device
  User.find({ _id: req.user.id, "devices.serial": req.body.serial })
    .then(user => {
      if (user === undefined || user.length === 0) {
        console.log(`Adding device: ${req.body.serial}`);
        User.updateOne({ _id: req.user.id }, { $push: { devices: newDevice } })
          .then(() => {
            User.findById(req.user.id)
              .then(updatedUser => res.json(updatedUser.devices))
              .catch(err => res.status(404).json({ err }));
          })
          .catch(err => res.status(404).json({ err }));
      } else {
        console.log(`Device already exists...`);
        res.json({ exists: true });
      }
    })
    .catch(err => res.status(404).json({ err }));
});

// @route   DELETE devices/delete
// @desc    Delete device
// @access  OAuth
router.delete("/delete", authCheck, (req, res) => {
  // check parameters
  if (req.query.serial.length !== SERIAL_LENGTH) {
    res.status(404).json({ err: "Invalid serial number" });
  }

  // find and remove device
  User.find({
    _id: req.user.id,
    "devices.serial": req.query.serial
  })
    .then(user => {
      if (user === undefined || user.length === 0) {
        console.log("Device does not exist...");
        res.json({ exists: false });
      } else {
        console.log(`Deleting device: ${req.query.serial}`);
        User.findByIdAndUpdate(req.user.id, {
          $pull: { devices: { serial: req.query.serial } }
        })
          .then(() => {
            User.findById(req.user.id)
              .then(updatedUser => res.json(updatedUser.devices))
              .catch(err => res.status(404).json({ err }));
          })
          .catch(err => res.status(404).json(err));
      }
    })
    .catch(err => res.status(404).json({ err }));
});

//-------------------------------------------------------
// Device Real-Time Information
// @TODO Use websockets

// @route   GET devices/info
// @desc    Get device information
// @access  OAuth
router.get("/info", authCheck, (req, res) => {
  console.log("Get device real-time information");  
  const device = deviceListAll.find(dev => dev.serial === req.query.serial);
  
  if (typeof device === "undefined") {
    res.json({ success: false });
  } else {
    res.json(device);
  }
});

module.exports = router;
