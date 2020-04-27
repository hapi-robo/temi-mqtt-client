const router = require('express').Router();

// middleware to check if user is already logged in
const authCheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/login');
  } else {
    next();
  }
};

router.get('/', authCheck, (req, res) => {
  res.render('profile', { user: req.user });
});

module.exports = router;