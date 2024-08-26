var express = require('express');
var router = express.Router();

var logger = require('../logger');

router.get('/', async (req, res)=> {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    if (!req.session.user_id){
        return res.send(
            `<script type="text/javascript">
            alert("로그인을 먼저 진행해주세요.");
            location.href='/';
            </script>`)
    }
    try
    {
        const ordersList = await req.db.query(
            'select * from orders where user_id = ?',
            [req.session.user_id]
        )
        console.log("ordersList : ", ordersList);
        res.render('order/orderinformation', {ordersList:ordersList});
    }
    catch(error){
        console.log(error);
    }
})

router.get('/:orders_id', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    const {orders_id } = req.params;
    console.log("orders_id : " , orders_id);

    try {
        const checkorderlist = await req.db.query(
            'select * from orderlist inner join booklist on orderlist.book_id = booklist.book_id where orderlist.orders_id = ?'
        ,[orders_id])
        console.log("checkorderlist : ", checkorderlist)
        res.render('order/orderdetail', {checkorderlist: checkorderlist});
    }
    catch(error){
        console.log(error);
    }    
})



module.exports = router;