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

    // try{
    //     const InsertOrders = await req.db.query(
    //         'INSERT into values'
    //     )
    // }
    // catch(error){
    //     console.log(error);
    // }

    


    

})


// // 주문하기 전 로그인 체크는 나중에 해줍니다.
// router.post('/', (req, res) => {
//     logger.info(`Request received for URL: ${req.originalUrl}`);
//     const books = JSON.parse(req.body.books);
//     console.log(books);
//     res.render('order', { books });
// });




module.exports = router;
