var express = require('express');
var router = express.Router();

//bring in the middleware


/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
  //check if this user is logged in already

  if(req.session.loginStatus && req.session.loginStatus.is_user_logged_in){
    res.redirect("/user");
  }else{
    res.render('login')
  }

  
});

module.exports = router;