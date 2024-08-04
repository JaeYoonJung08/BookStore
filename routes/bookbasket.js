var express = require('express');
var router = express.Router();

var logger = require('../logger');


//로그인를 먼저 해야 장바구니 사용 가능
router.get('/', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    // res.send('respond with a resource');
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
        try
        {
            const bookbasketlist = await req.db.query(
                'select * from basketlist where basket_id = (select basket_id from bookbasket where user_id = ?)',
                [req.session.user_id]
            )    
            console.log(bookbasketlist);
            // 장바구니에 책이 있는 경우
            if (bookbasketlist.length > 0) {
                // 장바구니에 담긴 모든 book_id를 배열로 만듦
                const bookIds = bookbasketlist.map(item => item.book_id);
                console.log(bookIds);
                // book_id에 해당하는 책 정보를 booklist 테이블에서 조회
                const books = await req.db.query(
                    'SELECT * FROM booklist WHERE book_id IN (?)',
                    [bookIds]
                );

                console.log(books);
                return res.render('bookbasket', { books, bookbasketlist });
            }
            else 
            {
                return res.render('bookbasket', { books: [], bookbasketlist: [] });
            }

            // return res.render('bookbasket');
        }
        catch(error)
        {
            console.log(error);

        }

    }
})








module.exports = router;