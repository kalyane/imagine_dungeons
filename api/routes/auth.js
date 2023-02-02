const express = require('express');
const passport = require('passport');

let router = express.Router();

const User = require('../../dbmodels/User.js'); // User Model 

passport.use(User.createStrategy());

// To use with sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router
    .route("/")
    .get((request, response)=>{
        response.render('home', {session: request.session});
    });

router
    .route("/login")
    .get((request, response)=>{
        response.render('login');
    }).post((request, response)=>{
        let email = request.body.email;
        let password = request.body.password;

        // ensure the input fields exists and are not empty
        if (email && password) {
            passport.authenticate("local",
            (err, user, options) => {
                if (user) {
                // If the user exists log him in:
                request.login(user, (error)=>{
                    if (error) {
                        response.send(error);
                    } else {
                        response.redirect('/games');
                    };
                });
                } else {
                    response.render('login', { message: { text: 'Incorrect email or password.', type: 'error'}});
                };
            })(request, response)
        } else {
            response.render('login', { message: { text: 'Please enter Email and Password!', type: 'error'}})
        }
    })

router
    .route("/signup")
    .get((request, response)=>{
        response.render('signup');
    })
    .post((request, response) => {
        // capture the input fields
        let first_name = request.body.first_name;
        let last_name = request.body.last_name;
        let email = request.body.email;
        let password = request.body.password;

        // ensure the input fields exists and are not empty
        if (first_name && last_name && email && password) {
            // check if there is a user with the same email
            User.findOne({ email: email }, function(error, user) {
                if (error) throw error;
                if (user) {
                    // redirect to the signup page with an error message
                    response.render('signup', { message: { text: 'There is an existing account with this email!', type: 'error'}})
                } else {
                    let newUser = new User({
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        password: password
                    });
                    User.register(newUser, password, function(err,user){
                        if(err){console.log(err); response.redirect("/signup")}
                        else{
                            passport.authenticate("local")(request,response,function(){
                                // redirect to home login with success message
                                response.render('login', { message: { text: 'User added successfully!', type: 'success'}})
                            })
                        }
                    })
                }
            });
        }
        // when fields are empty redirect with error message
        else {
            response.render('signup', { message: { text: 'Please enter all fields!', type: 'error'}})
        }
    });

router
    .route("/logout")
    .get((request, response, next) => {
        request.logout(function(err) {
            if (err) { return next(err); }
            response.redirect('/');
        });
    });

module.exports = router;


