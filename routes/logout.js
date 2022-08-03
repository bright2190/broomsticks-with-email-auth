var express = require('express');
var router = express.Router();
const { authConfig } = require("../engine/config");


/* GET users listing. */
router.get('/', function(req, res, next) {


  //logout the user
  res.send("Logs out the user ");
 
});

module.exports = router;