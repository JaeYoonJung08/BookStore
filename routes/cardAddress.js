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
        res.render('cardAddr/cardAddr');    
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

router.post('/create/addr', async (req, res) => {
    const {userbasicAdd, userdetailAdd, userPostal} = req.body;


    console.log(userbasicAdd, userdetailAdd, userPostal);
    //우편번호를 통해 조회
    try{
        const checkAddr = await req.db.query(
            'select postal_code from addr inner join user on user.user_id = addr.user_id where user.user_id = ? and addr.postal_code = ?',
            [req.session.user_id, userPostal]
        )
        console.log(checkAddr);
        if (checkAddr.length !== 0)
        {
            return res.send(
                `<script type="text/javascript">
                alert("이미 등록된 주소입니다.");
                location.href='/cardAddr';
                </script>`)
        }
        else
        {
            //DB에 등록된 게 없으니 저장
            const InserAddr = await req.db.query(
                'insert into addr(user_id, basic_add, detail_add, postal_code) values (?, ?, ?, ?)',
                [req.session.user_id, userbasicAdd, userdetailAdd, userPostal]
            )

            return res.send(
                `<script type="text/javascript">
                alert("주소가 등록되었습니다");
                location.href='/cardAddr';
                </script>`) 
        }
    }
    catch (error){
        console.log(error);
        return res.send(
            `<script type="text/javascript">
            alert("주소를 올바르게 작성해주세요");
            location.href='/cardAddr';
            </script>`) 
    }
});

router.get('/select/all', async (req, res) => {
    logger.info(`Request received for URL: ${req.originalUrl}`);
    try
    {
        //카드 주소 조회 
        const card = await req.db.query(
            'select * from card where user_id = ?',
            [req.session.user_id]
        )
        const addr = await req.db.query(
            'select * from addr where user_id = ?',
            [req.session.user_id]
        )
        res.render('cardAddr/cardAddr_select', {card:card, addr:addr});

    }
    catch (error)
    {
        console.log(error);
        return res.send(
            `<script type="text/javascript">
            alert("데이터베이스 오류입니다.");
            location.href='/cardAddr';
            </script>`) 
    }
 

    

})





module.exports = router;


