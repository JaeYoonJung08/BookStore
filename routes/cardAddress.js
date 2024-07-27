var express = require('express');
var router = express.Router();

var logger = require('../logger');
const { route } = require('./user');


router.get('/', function(req, res) {
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
        res.render('cardAddr');    
    }
});


router.post('/create/card', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    const {cardNumber, cardtype,  cardExpriation} = req.body;

    console.log(cardNumber, cardtype,  cardExpriation);
    try {
        //inner join 시작점

        //카드가 있는 지 조회
        const cardCheck = await req.db.query(
            'select card_id from card where card_number = ?',
            [cardNumber]
        )
        console.log(cardCheck);

        if (cardCheck.length !== 0)
        {
            return res.send(
                `<script type="text/javascript">
                alert("이미 등록된 카드입니다.");
                location.href='/user';
                </script>`)
        }
        else
        {

        }
    }
    catch{

    }

});





module.exports = router;


