//Imprting modules
const express = require('express')
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const db = require('mongoose')
const method = require('method-override');


const passport_init = require('./auth');
const user_db = require('./models/user_model');
const ques_db = require('./models/questions');
const logs = require('./models/logs');


db.connect('mongodb+srv://core:core@suprise-event.r86we.mongodb.net/event?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})

passport_init(passport)


//routing
const app = express();
app.listen(process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(method('_method'))



app.get('/', checkLogout, function (req, res) {
    res.render('home');
});


app.post('/login', checkLogout, passport.authenticate('local',{
    successRedirect: '/play',
    failureRedirect: '/',
    failureFlash: true,
}));


app.delete('/logout', function(req,res){
    req.logOut();
    res.redirect('/');
});


app.get('/leaderboard', function (req, res) {
    user_db.find({leaderboard: true}, (error, result)=>{
        res.render('leaderboard', {user: req.user, ranks: result});
    }).sort({score:-1})
});


app.get('/play', checkLogin, function (req, res) {
    ques_db.find({}, (err, result)=>{
        let dis = []
        logs.find({user: req.user.username, status: ['correct', 'pending']}, (e, r)=>{
            r.map((ques) => {
                dis.push(ques.question)
                dis.push(ques.ans.replace(/ /g, ""))
            })
            res.render('play', {ques: result, user: req.user, dis: dis.join(' ')})
        })
    })
});

app.post('/play/:ques_no', checkLogin, function(req, res){
    ques_db.findOne({number: req.params.ques_no}, (err, result)=>{
        if (result.manual === 'no'){
            if (result.answer === req.body.answer){
                user_db.updateOne({username: req.user.username}, {score: req.user.score + result.score}, (e,r)=>{
                    console.log('correct answer')
                })
                var status = 'correct'
            }
            else{ 
                var status = 'incorrect' 
            }
        }
        else{
            var status = 'pending'
        }

        if (req.body.answer.length > 0){
            const log = new logs({
                _id: new db.Types.ObjectId(),
                user: req.user.username,
                question: result.number,
                ans: req.body.answer,
                status: status,
            })
            log.save()
        }

        res.redirect('/play#'+req.params.ques_no+'d')
    })
})


app.get('/logs/:user', function(req, res){
    logs.find({user: req.params.user}, (err, result)=>{
        if (req.user !== undefined){
            if (req.user.admin){
                res.render('user_logs', {logs: result})
            }
            else{
                res.redirect('/')
            }
        }
        else{
            res.redirect('/')
        }
    })
})

app.get('/ques/:ques', function(req, res){
    logs.find({question: req.params.ques}, (err, result)=>{
        if (req.user !== undefined){
            if (req.user.admin){
                res.render('user_logs', {logs: result})
            }
            else{
                res.redirect('/')
            }
        }
        else{
            res.redirect('/')
        }
    })
})



//Middleware functions
function checkLogin(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
};

function checkLogout(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/play')
    }
    next()
}
