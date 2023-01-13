const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../dbmodels/User')

let router = express.Router();

router
    .route("/")
    .get((request, response)=>{
        response.render('home', {session: request.session});
    });

router
    .route("/login")
    .get((request, response)=>{
        response.render('login');
    })
    .post((request, response)=>{
        // capture the input fields
        let email = request.body.email;
        let password = request.body.password;

        // ensure the input fields exists and are not empty
        if (email && password) {
            // find user with the same email
            User.findOne({ email: email }, function(error, user) {
                if (error) throw error;
                if (user) {
                    // compare the password
                    bcrypt.compare(password, user.hash, function(error, result) {
                        if (result) {
                            // Authenticate the user and save info in the session
                            request.session.loggedin = true;
                            request.session.email = email;
                            request.session.first_name = user.first_name;
                            request.session.last_name = user.last_name;
                            request.session.id_user = user._id;
                            // Redirect to games page
                            response.redirect('/games');
                        } else {
                            response.render('login', { message: { text: 'Incorrect email or password.', type: 'error'}});
                        }
                    });
                } else {
                    response.render('login', { message: { text: 'Incorrect email or password.', type: 'error'}});
                }
            });
        } else {
            response.render('login', { message: { text: 'Please enter Email and Password!', type: 'error'}})
        }
    });

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
                    // Hash the plaintext password with bcryptjs
                    bcrypt.hash(password, 10, function(error, hash) {
                        if (error) throw error;
                        // create new user with mongoose
                        let newUser = new User({
                            first_name: first_name,
                            last_name: last_name,
                            email: email,
                            hash: hash
                        });
                        newUser.save(function (error, savedUser) {
                            if (error) throw error;
                            else{
                                // redirect to home login with success message
                                response.render('login', { message: { text: 'User added successfully!', type: 'success'}})
                            }
                        });
                    });
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
    .get((request, response) => {
        request.session.destroy();
        response.redirect('/');
    });

module.exports = router;


