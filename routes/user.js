var express = require('express');
var router = express.Router();

var logger = require('../logger');

/* GET users listing. */
router.get('/', function(req, res, next) {
  logger.info(`Request received for URL: ${req.originalUrl}`);
  // res.send('respond with a resource');
  res.render('login/user');
});

// 로그인
router.post('/signin', async (req, res) => {
  logger.info(`Request received for URL: ${req.originalUrl}`)
  const { userName, userPassword } = req.body;

  try {
    const login =  await req.db.query(
        'SELECT user_id from user WHERE name = ? AND password = ?',
        [userName, userPassword]
    );
    
    if (login.length === 0) // 유저 없음
    {
      console.log("잘못된 회원 : userName : ", userName, 'userPassword : ', userPassword);
        return res.send(
            `<script type="text/javascript">
            alert("아이디 또는 비밀번호가 올바르지 않습니다.");
            location.href='/user';
            </script>`
        );
    } 
    else  
    {

      req.session.userName = userName;
      req.session.user_id = login[0].user_id;

      //장바구니 만들기
      const checkBasket = await req.db.query(
        'select basket_id from bookbasket where user_id = ?',
        [req.session.user_id]
      );

      console.log("checkBasket : " ,checkBasket);
      
      //장바구니 만들기
      if (checkBasket.length === 0)
      {
          console.log(req.session.user_id);
          const InsertBasket = await req.db.query(
              'insert into bookbasket(user_id) values (?)',
              [req.session.user_id]
          );
          console.log(InsertBasket);

          req.session.bookbasket = InsertBasket.insertId;
      }
      //장바구니 있을 시 
      else 
      {
        req.session.basket_id = checkBasket[0].basket_id;
      }

      console.log("로그인 성공 -> req.session.userName : ", req.session.userName, "req.session.user_id : " , req.session.user_id, "req.session.basket_id : ", req.session.basket_id);

      return res.redirect('/');
    }

  } 
  catch (error) 
  {
      console.log(error);
      res.send(
          `<script type="text/javascript">
          alert("아이디 또는 비밀번호가 올바르지 않습니다."); 
          location.href='/user';
          </script>`
      );
  }
});

//회원가입 signup
router.post('/signup', async (req,res) => {
  logger.info(`Request received for URL: ${req.originalUrl}`)
  const { userName, userPassword } = req.body;


  try {
    const sigincheck = await req.db.query(
      'SELECT user_id from user where name = ?',
      [userName]
    )
    if (sigincheck.length !== 0)
    {
      console.log("이 사용자는 이미 있다 : " , userName);
      return res.send(
        `<script type="text/javascript">
        alert("이미 있는 사용자 입니다.");
        location.href='/user';
        </script>`
      )
    }

    await req.db.query(
      'INSERT INTO user(password, name) VALUES (?, ?)',
      [userPassword, userName]
    );
    console.log("이 사용자는 회원가입 성공 : " , userName);
    return res.send(
      `<script type="text/javascript">
      alert("회원가입이 되었습니다. 로그인을 해주세요.");
      location.href='/user';
      </script>`
    );
  } catch{
    res.send(
      `<script type="text/javascript">
      alert("데이터베이스 오류");
      location.href='/user';
      </script>`
    )
  }

})


// 세션 데이터 확인 예시
router.get('/profile', (req, res) => {
  if (req.session.userName) {
    res.send(`Hello, ${req.session.userName}`);
  } else {
    res.status(401).send('로그인 필요');
  }
});

// 세션 데이터 확인을 위한 임시 엔드포인트
router.get('/session-data', (req, res) => {
  res.json(req.session);
});



module.exports = router;


