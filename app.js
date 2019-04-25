// app.js

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');


mongoose.connect(configDB.url, { useNewUrlParser: true }); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // console stuff
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating
app.set('view engine', 'pug'); //also pug

app.use(session({ secret: 'lmao' })); // session secret, need it for whatever reason in session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static("public"));


require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port);
console.log('Server started on port: ' + port);