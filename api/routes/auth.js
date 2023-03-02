const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

let router = express.Router();

router
    .route("/")
    // show homepage
    .get((req, res, next)=>{
        passport.authenticate('jwt', (err, user) => {
            res.render('home', {name: 'home', user: user});
        })(req, res, next);
    });

router
    .route("/login")
    // show login page
    .get((req, res)=>{
        res.render('login');
    })
    // logs user in
    .post(async (req, res, next)=>{
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
                // generate secure token
                const token = jwt.sign({ user: body }, 'TOP_SECRET');
                // store token in a 24h cookie
                res.cookie("token", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: false, secure: true });
                return res.redirect("/games");
            }
        })(req, res, next);
    })

router
    .route("/signup")
    // show signup page
    .get((req, res) => {
        res.render('signup');
    })
    // creates a new user
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
    });
    
router
    .route("/logout")
    // logs user out
    .get((req, res, next) => {
        res.clearCookie('token');
        res.redirect("/");
    });

router
    .route("/404")
    // show 404 page
    .get((req, res, next)=>{
        passport.authenticate('jwt', (err, user) => {
            res.render('404', {user: user, name: "404"});
        })(req, res, next);
    });

router
    .route("/documentation")
    // show documentation page
    .get((req, res, next)=>{
        passport.authenticate('jwt', (err, user) => {
            res.render('documentation', {user: user, name: "documentation"});
        })(req, res, next);
    });

module.exports = router;


