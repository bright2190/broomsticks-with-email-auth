var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  if(req.session.loginStatus && req.session.loginStatus.is_user_logged_in){
    res.redirect("/user");
  }else{
    res.render('register')
  }

  
});

module.exports = router;