var express = require('express');
var router = express.Router();

var logger = require('../logger');

router.get('/', async (req, res)=> {

    try
    {
        const ordersList = await req.db.query(
            'select * from orders where user_id = ?',
            [req.session.user_id]
        )
        console.log("ordersList : ", ordersList);
        res.render('orderinformation/orderinformation', {ordersList:ordersList});
    }
    catch(error){
        console.log(error);
    }
})



module.exports = router;