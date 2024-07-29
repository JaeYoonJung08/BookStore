var express = require('express');
var router = express.Router();

var logger = require('../logger');


//책 조회
router.get('/', async (req, res) => {
    const books = await req.db.query('SELECT * FROM booklist;');
    console.log(books);
    let sess = "1";
    console.log('sess:', sess);

    res.render('booklist', { books: books, sess: sess });
});




module.exports = router;
