var express = require('express');
var router = express.Router();

var logger = require('../logger');

//책 조회
router.get('/', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    const books = await req.db.query('SELECT * FROM booklist;');
    console.log("현재 판매 중인 책 : ", books);
    res.render('booklist/booklist', { books: books});
});

//책 상세 페이지
router.get('/:book_number', async (req,res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    const booknumber = req.params.book_number;
    console.log(booknumber)
    try{
        const Read = await req.db.query(
            'select * from booklist where book_id = ?',
            [booknumber]
        );

        console.log(Read);
        res.render('booklist/bookdetail', {book : Read[0]});
    }
    catch (error){
        console.log(error);
    }

})

//책 추가
router.post('/bookAdd', async (req, res) => {
    const {bookName, bookCount, bookPrice} = req.body;
    try{   
        const checkbook = await req.db.query(
            'select book_id, book_count from booklist where book_name = ?',
            [bookName]
        )

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
                alert("책의 수량이 추가 되었습니다.");
                location.href='/';
                </script>`
            );
        }
    }
    catch (error){
        console.log(error);   
    }
})


//장바구니 추가
router.post('/basketAdd', async (req, res) => {

    logger.info(`Request received for URL: ${req.originalUrl}`);
    const { book_id, book_count } = req.body;
    var basketlistCheck = true;
    var basket_id;

    console.log("book_id : " ,book_id);
    //먼저 로그인이 되었는지 확인
    if (!req.session.userName)
    {
        return res.send(
            `<script type="text/javascript">
            alert("로그인을 먼저 진행해주세요.");
            location.href='/';
            </script>`)
    }
    else
    {
        try{
            //이제 책을 장바구니에 넣자
            await req.db.query(
                'insert into basketlist(basket_id, book_id, book_count) values(?,?,?)'
            ,[req.session.basket_id, book_id, book_count])

            return res.send(
                `<script type="text/javascript">
                alert("장바구니에 추가 되었습니다.");
                location.href='/booklist';
                </script>`)

        }
        catch(error){
            console.log(error);
            return res.send(
                `<script type="text/javascript">
                alert("장바구니 추가 중 오류가 발생했습니다.");
                location.href='/booklist';
                </script>`)
        }
    }
})



module.exports = router;
