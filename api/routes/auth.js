const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

let router = express.Router();

router
    .route("/")
    .get((req, res, next)=>{
        passport.authenticate('jwt', (err, user) => {
            res.render('home', {name: 'home', user: user});
        })(req, res, next);
    });

router
    .route("/login")
    .get((req, res)=>{
        res.render('login');
    }).post(async (req, res, next)=>{
        const { email, password } = req.body;

        if (email == "" || password == "") {
            return res.render('login', { message: {text: 'All fields are required', type:'error'} });
        }

        passport.authenticate('login', (err, objs) => {
            if (err) {
              return next(err);
            }
            if (!objs.user) {
                return res.render('login', { message: objs.message });
            }
            else{
                const body = { _id: objs.user._id, email: objs.user.email };
                const token = jwt.sign({ user: body }, 'TOP_SECRET');
                res.cookie("token", token, { maxAge: 1000 * 60 * 60, httpOnly: false, secure: true });
                return res.redirect("/games");
            }
        })(req, res, next);
    })

router
    .route("/signup")
    .post((req, res, next) =>{
        const { first_name, last_name, email, password } = req.body;

        if (email == "" || password == "" || first_name == "" || last_name == "") {
            return res.render('signup', { message: {text: 'All fields are required', type:'error'} });
        }

        passport.authenticate('signup', (err, objs) => {
            if (err) {
              return next(err);
            }
            if (!objs.user) {
                return res.render('signup', { message: objs.message });
            }
            else{
                return res.render('login', { message: objs.message });
            }
          })(req, res, next);
    })
    .get((req, res) => {
        res.render('signup');
    });
    
router
    .route("/logout")
    .get((req, res, next) => {
        res.clearCookie('token');
        res.redirect("/");
    });

router
    .route("/404")
    .get((req, res, next)=>{
        passport.authenticate('jwt', (err, user) => {
            res.render('404', {user: user, name: "404"});
        })(req, res, next);
    });

module.exports = router;


