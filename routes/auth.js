const express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let router = express.Router();
var mysqlConnection = require('../database').databaseConnection;

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
            // get salt from the user with the same email
            mysqlConnection.query('SELECT * FROM users WHERE email = ?', [email], function(error, results, fields) {
                // if there is an issue with the query, output the error
                if (error) throw error;
                if (results.length > 0) {
                    const salt = results[0].salt;
                    bcrypt.compare(password, results[0].hash, function(err, res) {
                        if(res) {
                            // Authenticate the user and save info in the session
                            request.session.loggedin = true;
                            request.session.email = email;
                            request.session.first_name = results[0].first_name;
                            request.session.last_name = results[0].last_name;
                            request.session.id_user = results[0].id_user;
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
            mysqlConnection.query('SELECT * FROM users WHERE email = ?', [email], function(error, results, fields) {
                // if there is an issue with the query, output the error
                if (error) throw error;
                // if there is same email in database
                if (results.length > 0) {
                    // redirect to the signup page with an error message
                    // TODO: add danger, warning, success color messages
                    response.render('signup', { message: { text: 'There is an existing account with this email!', type: 'error'}})
                } 
                // insert a new user to database
                else {
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        // Hash the plaintext password with the generated salt
                        bcrypt.hash(password, salt, function(err, hash) {
                            // Store the hashed password and the salt in the database
                            var sql = "INSERT INTO users (`first_name`,`last_name`, `email`, `hash`, `salt`) VALUES (?, ?, ?, ?, ?);"
                            mysqlConnection.query(sql, [first_name, last_name, email, hash, salt], (err, res, fields) => {
                                if (err) throw err;
                                else{
                                    // redirect to home login with success message
                                    response.render('login', { message: { text: 'User added successfully!', type: 'success'}})
                                }
                            })
                        });
                    });
                }			
            });
        }
        // when fields are empty redirect with error message
        else {
            // TODO: add danger, warning, success color messages
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


