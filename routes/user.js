var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
  //check is the user is logged in 
  // if(req.session.loginStatus){  --- baniex commented out
    res.render('user', {
        firstname: "Emmanuel"   // firstname: req.session.loginStatus.firstname  --- baniex commented out
    })
  // }else{  --- baniex commented out
    // res.redirect("/login");  --- baniex commented out
  // }  --- baniex commented out


  
});

module.exports = router;