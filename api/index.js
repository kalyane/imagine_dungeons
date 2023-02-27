const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// password - Rzrv3IkKpEKsQh8j
const dbURI = 'mongodb+srv://kalyane:Rzrv3IkKpEKsQh8j@cluster0.uoxqwvy.mongodb.net/?retryWrites=true&w=majority';

// creating express app
var app = express();

// configuring express server
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());

// defining public directories
app.use('/static', express.static(path.join(__dirname, '../public')));

mongoose.set('strictQuery', false);

// establish the server connection port
const port = process.env.PORT || 8080;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(port, () => console.log(`Listening on port ${port}..`)))
    .catch((err) => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// using the JWT authentication strategy
require('./routes/jwt_strategy');

// add routes to the application
// the private pages checks for authentication
const auth = require("./routes/auth")
app.use("/", auth);
const games = require("./routes/games");
app.use("/games", passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), games);
const agents = require("./routes/agents");
app.use("/agents", passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), agents);
const assets = require("./routes/assets");
app.use("/assets", passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), assets);

// if none of the previous routes match, then render 404 page
app.all('*', (req, res) => {
    res.redirect('/404')
})

module.exports = app;