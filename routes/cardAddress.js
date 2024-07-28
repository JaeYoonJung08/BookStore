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
        //카드가 있는 지 조회
        const cardCheck = await req.db.query(
            'select card.card_id, card.user_id from card inner join user on user.user_id = card.user_id where user.name = ? and card.card_number = ?',
            [req.session.userName, cardNumber]
        )

        console.log(cardCheck);
        console.log(cardCheck.user_id)
        if (cardCheck.length !== 0)
        {
            return res.send(
                `<script type="text/javascript">
                alert("이미 등록된 카드입니다.");
                location.href='/cardAddr';
                </script>`)
        }
        else
        {
            const InsertCard = await req.db.query(
                'INSERT INTO card(user_id, expriation_time, type_card, card_number) VALUES (? , ? , ? , ?)',
                [req.session.user_id, cardExpriation, cardtype, cardNumber]
            )
            return res.send(
                `<script type="text/javascript">
                alert("카드가 등록되었습니다.");
                location.href='/cardAddr';
                </script>`)
        }
    }
    catch(error){
        console.log(error)

    }

});





module.exports = router;


