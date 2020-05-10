const router = require("express").Router();

const authCheck = require("../modules/auth");

// @route   GET console/
// @desc    Render console page
// @access  OAuth
router.get("/", authCheck, (req, res) => {
  res.render("console", { user: req.user });
});

module.exports = router;
