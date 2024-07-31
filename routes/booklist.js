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


//책 추가
router.post('/bookAdd', async (req, res) => {
    const {bookName, bookCount, bookPrice} = req.body;


    console.log(bookName, bookCount, bookPrice);
    
    try{
        
        const checkbook = await req.db.query(
            'select book_id, book_count from booklist where book_name = ?',
            [bookName]
        )
        console.log(checkbook);
        if (checkbook.length === 0) 
        {
            //책이 없으니 추가
            await req.db.query(
                'insert into booklist(book_name, book_count, book_price) values (?,?,?)',
                [bookName, parseInt(bookCount), parseInt(bookPrice)]
            )

            return res.send(
                `<script type="text/javascript">
                alert("책이 추가 되었습니다.");
                location.href='/';
                </script>`
            );

        }
        else 
        {
            //책이 있으면 Count 그만큼 추가해주기
            const sumCount = checkbook[0].book_count;
            var book_id = checkbook[0].book_id;
            
            var sum = parseInt(sumCount) + parseInt(bookCount);
            console.log("bookcCount : ", sum);



            const InsertSQL = await req.db.query(
                'update booklist set book_count = ? where book_id = ?',
                [sum, book_id]
            )

            return res.send(
                `<script type="text/javascript">
                alert("책이 수량이 추가 되었습니다.");
                location.href='/';
                </script>`
            );

        }

    }
    catch (error){
        console.log(error);   
    }
})



module.exports = router;
