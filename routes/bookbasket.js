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
            // 장바구니에 책이 있는 경우
            if (bookbasketlist.length > 0) {
                req.session.basket_id = bookbasketlist[0].basket_id;

                // 장바구니에 담긴 모든 book_id를 배열로 만듦
                const bookIds = bookbasketlist.map(item => item.book_id);
                console.log(bookIds);
                // book_id에 해당하는 책 정보를 booklist 테이블에서 조회
                const books = await req.db.query(
                    'SELECT * FROM booklist WHERE book_id IN (?)',
                    [bookIds]
                );

                console.log("books : " , books);
                return res.render('basket/bookbasket', { books, bookbasketlist });
            }
            else 
            {
                return res.render('basket/bookbasket', { books: [], bookbasketlist: [] });
            }
        }
        catch(error)
        {
            console.log(error);
        }
    }
})


router.post('/order', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    const selectedBooks = req.body.selectedBooks;
    const all_price = req.body.all_price;

    console.log("selectedBooks : " , selectedBooks);
    console.log("all_price : " , all_price);

    //선택된 책이 없을 때
    if (!selectedBooks) {
        return res.send(
            `<script type="text/javascript">
            alert("주문할 책을 선택해주세요.");
            location.href='/bookbasket';
            </script>`);
    }
    const selectedBookList = Array.isArray(selectedBooks) ? selectedBooks.map(book => JSON.parse(book)) : [JSON.parse(selectedBooks)];

    try {
        //책 조회
        // const books = await req.db.query(
        //     'SELECT * FROM booklist WHERE book_id IN (?)',
        //     [selectedBookIds]
        // );
        //기본 배송지, 상세 배송지, 우편 번호
        const UserAddr = await req.db.query(
            'select * from addr where user_id = ?',
            [req.session.user_id]
        )
        //카드번호, 카드 종류, 카드 유효기간 
        const UserCard = await req.db.query(
            'select * from card wherer where user_id = ?',
            [req.session.user_id]
        )

        console.log("UserAddr : " , UserAddr)
        console.log("UserCard : " , UserCard)

        res.render('basket/orderpage', {all_price, UserAddr, UserCard, selectedBookList});
    } catch (error) {
        console.log(error);
        res.send(
            `<script type="text/javascript">
            alert("주문 처리 중 오류가 발생했습니다.");
            location.href='/';
            </script>`);
    }
});

router.post('/add', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    const {selectedBookList, totalPrice, selectedCard, selectedAddress} = req.body;
    console.log("totalPrice : ", totalPrice);
    console.log("selectedCard : ", selectedCard);
    console.log("selectedAddress : ", selectedAddress);
    console.log("selectedBookList : ", selectedBookList);

    try{
        const valueAddr = await req.db.query(
            'select basic_add, detail_add, postal_code from addr where addr_id = ?', 
            [selectedAddress]
        )

        const valueCard = await req.db.query(
            'select card_number, type_card, expriation_time from card where card_id = ?', 
            [selectedCard]
        )
        const { basic_add, detail_add, postal_code } = valueAddr[0];
        const { card_number, type_card, expriation_time } = valueCard[0];
        
        //order 테이블에 값 넣기
        const insertOrderQuery = `
        INSERT INTO orders (
            user_id, all_price, basic_add, detail_add, postal_code, card_number, type_card, expriation_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const result = await req.db.query(insertOrderQuery, [
            req.session.user_id, totalPrice, basic_add, detail_add, postal_code, card_number, type_card, expriation_time
        ]);
        console.log('Order inserted successfully ', result);
        const orders_id = result.insertId;
        
        //여기서 부터 orderlist
        const selectedBooks = JSON.parse(selectedBookList);
        for (const book of selectedBooks) {
            const insertOrderListQuery = `
                INSERT INTO orderlist (orders_id, book_id, orderlist_count)
                VALUES (?, ?, ?)
            `;
            await req.db.query(insertOrderListQuery, [orders_id, book.book_id, book.book_count]);
        }
        res.send(
            `<script type="text/javascript">
            alert("주문이 성공적으로 처리되었습니다.");
            location.href='/';
            </script>`
        );

    }
    catch(error){
        console.log(error);
        res.send(
            `<script type="text/javascript">
            alert("주문 처리 중 오류가 발생했습니다.");
            location.href='/';
            </script>`
        );
    }
})







module.exports = router;