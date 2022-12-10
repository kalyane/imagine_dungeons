const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const path = require('path');

var app = express();
var mysqlConnection = require('./database').databaseConnection;

//Configuring express server
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.use(session({
	secret: 'secret', // need to add a random key
	resave: true,
	saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));
app.use('/build/', express.static(path.join(__dirname, '/node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, '/node_modules/three/examples/jsm')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Establish the server connection
//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));

const games = require("./routes/games")
app.use("/games", games)
const assets = require("./routes/assets")
app.use("/assets", assets)

app.get('/', function(request, response, next) {
    response.render('home', {session: request.session});
});
app.get('/login', function(request, response, next) {
    //res.send("Home Router Test");
    response.render('login');
});

app.get('/signup', function(request, response, next) {
    //res.send("Home Router Test");
    response.render('signup');
});

app.post('/signup', (request, response) => {
    // Capture the input fields
	let first_name = request.body.first_name;
	let last_name = request.body.last_name;
    let email = request.body.email;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (first_name && last_name && email && password) {
		// check if there is a user with the same email
		mysqlConnection.query('SELECT * FROM users WHERE email = ?', [email], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If there is same email in database
			if (results.length > 0) {
                response.render('signup', { message: 'There is an existing account with this email!'})
			} 
            // insert a new user to database
            else {
                var sql = "INSERT INTO user (`first_name`,`last_name`, `email`, `password`) VALUES (?, ?, ?, ?);"
                mysqlConnection.query(sql, [first_name, last_name, email, password], (err, res, fields) => {
                    if (error) throw error;
                    else{
                        //response.send('New user added to database!');
                        // Redirect to home login
                        response.render('login', { message: 'User added. Enter Login details.'})
                    }
                })
			}			
		});
	} else {
        response.render('signup', { message: 'Please enter all fields!'})
	}

    
});


//Creating GET Router to fetch all the learner details from the MySQL Database
app.get('/users' , (request, response) => {
    mysqlConnection.query('SELECT * FROM users', (err, rows, fields) => {
    if (!err)
    response.send(rows);
    else
    console.log(err);
    })
    } );

//Router to GET specific learner detail from the MySQL database
app.get('/users/:id' , (request, response) => {
    mysqlConnection.query('SELECT * FROM users WHERE id_user = ?',[request.params.id], (err, rows, fields) => {
    if (!err)
    response.send(rows);
    else
    console.log(err);
    })
    } );

//Router to INSERT/POST a learner's detail
app.post('/insert/user', (request, response) => {
    let user = request.body;
    var sql = "INSERT INTO users (`first_name`,`last_name`, `email`, `password`) VALUES (?, ?, ?, ?);"
    mysqlConnection.query(sql, [user.first_name, user.last_name, user.email, user.password], (err, rows, fields) => {
        if (!err)
        response.send(rows);
        else
        console.log(err);
    })
});

// https://www.edureka.co/blog/node-js-mysql-tutorial/

app.post('/login', function(request, response) {
	// Capture the input fields
	let email = request.body.email;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (email && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		mysqlConnection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.email = email;
                request.session.first_name = results[0].first_name;
                request.session.last_name = results[0].last_name;
                request.session.id_user = results[0].id_user;
                sess = request.session;
				// Redirect to home page
				response.redirect('/games');
			} else {
                response.render('login', { message: 'Incorrect Email and/or Password!'})
			}			
		});
	} else {
        response.render('login', { message: 'Please enter Email and Password!'})
	}
});

app.get('/logout',(request, response) => {
    request.session.destroy();
    response.redirect('/');
});