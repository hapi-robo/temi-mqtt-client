const router = require('express').Router();

const Robot = require('../modules/robot');
const robotListAll = require('../modules/mqtt-message-parser');

// middleware to check if user is already logged in
const authCheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/login');
  } else {
    next();
  }
};

router.get('/', authCheck, (req, res) => {
  res.render('console', { user: req.user });
});


module.exports = router;