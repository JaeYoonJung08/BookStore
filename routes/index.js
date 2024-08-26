var express = require('express');
var router = express.Router();

var logger = require('../logger'); // logger 파일을 가져옴

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.info(`Request received for URL: ${req.originalUrl}`);

  console.log("회원 상태 -> req.session.userName : ", req.session.userName, "req.session.user_id : " , req.session.user_id, "req.session.basket_id : ", req.session.basket_id);

  // res.render('index', { title: 'Express' });
  res.render('index');
});

module.exports = router;
