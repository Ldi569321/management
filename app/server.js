/* const mysql = require('mysql2');  // mysql 모듈 로드
const conn = mysql.createConnection({  // mysql 접속 설정
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '1234',
    database: 'schedulemanager'
});
 */
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const moment = require('moment');
const MemoryStore = require('memorystore')(session);
const ejs = require('ejs');
const app = express();

app.set('port', process.env.PORT || 3000);
app.use('/css', express.static(__dirname + '/static/css'));
app.use('/img', express.static(__dirname + '/static/img'));
app.use('/js', express.static(__dirname + '/static/js'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/static/views');
app.engine('html', require('ejs').renderFile);

const maxAge = 1000 * 60 * 30;

app.listen(3000, function () {
    console.log("Express서버가 포트:3000으로 라우팅 되었습니다. http://localhost:3000/start")
})

//세션     ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.use(session({
    secret: "asd^*&fas@%f##$fda!@s",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({ checkPeriod: maxAge }),
    cookie: { maxAge }
}))


app.get('/start', (req, res) => {
    res.render('start');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/loginConfirm', (req, res) => {
    const loginConfirmSql = `select (case when id='${req.body.id}' and password = '${req.body.password}' then 'yes' else 'no' end) as tf from account`;
    conn.query(loginConfirmSql, function (err, row) {
        if (row[0].tf == 'yes') {
            const loginInfoSql = `select id, username, email, password, phone from account where id='${req.body.id}' and password = '${req.body.password}'`;
            conn.query(loginInfoSql, function (err, info) {
                req.session.name = info[0].username;
                req.session.id = info[0].id;
                res.render('welcome', { name: info[0].username });
            })
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("아이디 또는 비밀번호를 확인해 주세요"); history.back(); </script>');
        }
    })
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/welcome', (req, res) => {
    res.render('welcome');
})

app.get('/duplicateCheck', (req, res) => {
    const dp = `select count(id) as tf from account where id = '${req.query.id}'`
    conn.query(dp, function (err, row) {
        if (err) throw err;
        console.log(row[0].tf)
        console.log(row)
        if (row[0].tf == 1) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("중복된 아이디입니다."); history.back(); </script>');
        } else if (row[0].tf == 0) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("중복되지 않은 아이디입니다."); history.back();</script>');
        }
    })
})

app.post('/registerConfirm', (req, res) => {
    const registerSql = `insert into account values ('${req.body.id}','${req.body.username}','${req.body.email}','${req.body.password}','${req.body.phone}')`
    conn.query(registerSql, function (err, row) {
        if (err) {
            throw res.render('start');
        } else {
            res.render('verfication')
        }
    })
})