var express = require('express');
var router = express.Router();

var logger = require('../logger');

// 주문하기 전 로그인 체크는 나중에 해줍니다.
router.post('/', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    const selectedBooks = req.body.selectedBooks;
    const all_price = req.body.all_price;
    // const book_count = req.body.book_count;
    console.log("first : " , selectedBooks);
    // res.render('order');
    console.log("all_price : " , all_price);


    if (!selectedBooks) {
        return res.send(
            `<script type="text/javascript">
            alert("주문할 책을 선택해주세요.");
            location.href='/bookbasket';
            </script>`);
    }
    const selectedBookList = Array.isArray(selectedBooks) ? selectedBooks.map(book => JSON.parse(book)) : [JSON.parse(selectedBooks)];
    const selectedBookIds = selectedBookList.map(book => book.book_id);
    console.log("selectedBookIds :", selectedBookIds);
    console.log("selectedBookList :", selectedBookList);
    // const selectedBookIds = Array.isArray(selectedBooks) ? selectedBooks : [selectedBooks];
    console.log("selectedBookIds : " , selectedBookIds);
    try {
        //책 조회
        const books = await req.db.query(
            'SELECT * FROM booklist WHERE book_id IN (?)',
            [selectedBookIds]
        );

        
        // books.map(item => All_price += item.book_price)


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
        console.log("books : " , books);
        console.log("UserAddr : " , UserAddr)
        console.log("UserCard : " , UserCard)

  
        res.render('order', {books, all_price, UserAddr, UserCard, selectedBookList});
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
    const {selectedBookList, totalPrice, selectedCard, selectedAddress, books} = req.body;
    console.log("totalPrice : ", totalPrice);
    console.log("selectedCard : ", selectedCard);
    console.log("selectedAddress : ", selectedAddress);
    console.log("books : ", books);
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


        console.log(valueAddr);


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


// // 주문하기 전 로그인 체크는 나중에 해줍니다.
// router.post('/', (req, res) => {
//     logger.info(`Request received for URL: ${req.originalUrl}`);
//     const books = JSON.parse(req.body.books);
//     console.log(books);
//     res.render('order', { books });
// });




module.exports = router;
