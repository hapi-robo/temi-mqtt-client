const router = require("express").Router();

const authCheck = require("../modules/auth");
const Temi = require("../modules/temi");
const mqttClient = require("../modules/mqtt-client");

const temi = new Temi(mqttClient);

// @route   POST command/goto
// @desc    Send device to location
// @access  OAuth
router.post("/goto", authCheck, (req, res) => {
  temi.goto(req.body.serial, req.body.waypoint);
  res.json({ success: true, waypoint: req.body.waypoint });
});

module.exports = router;
