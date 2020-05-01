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

router.get('/get_robots', authCheck, (req, res) => {
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

router.post('/add_robot', authCheck, (req, res) => {
	console.log(req.body.serialNumber)

	// const newRobot = { 'name': req.body.name, 'serialNumber': req.body.serialNumber };
 //  User.find({ _id: req.query.id, 'robots.serialNumber': req.body.serialNumber })
 //    .then(user => {
 //      if (user === undefined || user.length === 0) {
 //        console.log('Adding robot')
 //        User.update({ _id: req.query.id }, { $push: { robots: newRobot } })
 //          .then(user => res.json(newRobot));
 //      } else {
 //        console.log('Robot already exists');
 //        res.json({ exists: true });
 //      }
 //    })
 //    .catch(err => res.status(404).json({ success: false }));

	res.json(req.user.robots);
});

module.exports = router;