var express = require('express');
var router = express.Router();

router.get('/', async (req, res) => {
    const checkcoupon = await req.db.query(
        'select * from coupon where user_id = ?'
        ,[req.session.user_id]
    )

    console.log(checkcoupon);

    res.render('coupon/coupon', {checkcoupon : checkcoupon});
})


module.exports = router;
