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

//-------------------------------------------------------

// @TODO Cannot use req.user.robots because this will change...
router.get('/robot/get', authCheck, (req, res) => {
  // collect serial numbers
  let serialNumberList = [];
  req.user.robots.forEach(robot => {
    serialNumberList.push(robot.serialNumber);
  });
  console.log(serialNumberList);

  // collect robots
  let robotListUser = [];
  serialNumberList.forEach(serialNumber => {
    const robot = robotListAll.find(robot => robot.serialNumber === serialNumber);
    
    if (robot === undefined) {
      robotListUser.push(new Robot(serialNumber, { 'state': 'Offline' }));      
    } else {
      robotListUser.push(robot);
    }
  });
  // console.log(robotListUser);

  res.json(robotListUser);
});

router.post('/robot/add', authCheck, (req, res) => {
	console.log(req.body.serialNumber)
	res.json(req.user.robots);
});

router.post('/robot/remove', authCheck, (req, res) => {
  console.log(req.body.serialNumber)
  res.json(req.user.robots);
});

module.exports = router;