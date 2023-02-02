const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const path = require('path');

const mongoose = require('mongoose');

// password - Rzrv3IkKpEKsQh8j
const dbURI = 'mongodb+srv://kalyane:Rzrv3IkKpEKsQh8j@cluster0.uoxqwvy.mongodb.net/?retryWrites=true&w=majority'

// creating express app
var app = express();

// configuring express server
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

// creating user session
app.use(session({
	secret: 'secret', // TODO: add unique and random secret key
	resave: true,
	saveUninitialized: true
}));

// defining public directories
app.use(express.static(__dirname + '/public'));
app.use('/build/', express.static(path.join(__dirname, '/node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, '/node_modules/three/examples/jsm')));

// establish the server connection port
const port = process.env.PORT || 8080;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(port, () => console.log(`Listening on port ${port}..`)))
    .catch((err) => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// importing and using routing files
const auth = require("./routes/auth")
app.use("/", auth)
const games = require("./routes/games")
app.use("/games", games)
const assets = require("./routes/assets")
app.use("/assets", assets)

app.use(function (req, res) {
    res.render('error');
});