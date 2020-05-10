const router = require("express").Router();
const passport = require("passport");

// auth login
router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// auth logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// auth with github
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["profile"]
  })
);

// callback route for github-oauth
// hand control to passport to use code to grab profile info
router.get(
  "/github/redirect",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/console");
  }
);

// auth with azure
router.get("/azure", passport.authenticate("azure_ad_oauth2"));

// callback route for azure-oauth
// hand control to passport to use code to grab profile info
router.get(
  "/azure/redirect",
  passport.authenticate("azure_ad_oauth2", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/console");
  }
);

module.exports = router;
