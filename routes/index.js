var express = require('express');
// const { auth, requiresAuth } = require("express-openid-connect");
var router = express.Router();
//const { authConfig } = require("../engine/config");

//server.use(auth(authConfig));






/* GET home page. */
router.get('/', function(req, res, next) {
  
  //check if this user is authenticated
  // console.log(req.session);
  // req.session.authId = true;

  //console.log(req.session)

  res.render('index', 
  { 
    
    title: 'Broomsticks',
    loginStatus: {}
});
});

module.exports = router;