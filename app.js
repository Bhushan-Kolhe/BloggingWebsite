const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

//Get Feedback Model
let Feedback = require('./models/Feedback');

//Connecting to db
mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once('open',function () {
  console.log('Connected to MongoDb');
});

//Check for db errors
db.on('error', function (err) {
  console.log(err);
});

//Init app
const app = express();

//load view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
      var namespace = param.split('.'),
      root    = namespace.shift(),
      formParam = root;
      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }

      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
}));

//Passport config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// parse application/json
app.use(bodyParser.json());

//Home Route
app.get('/', function (req, res) {
  res.render('index');
});

//Feedback route
app.post('/feedback', function (req, res) {
  const Email = req.body.feedbackEmail;
  const Content = req.body.feedbackContent;

  req.checkBody('feedbackContent', 'Content is required').notEmpty();
  req.checkBody('feedbackEmail', 'Email is required').notEmpty();
  req.checkBody('feedbackEmail', 'Email is not valid').isEmail();

  let errors = req.validationErrors();

  if (errors) {
    res.render('index', {
      feedbackErrors: errors
    });
  } else {
    let newFeedback = new Feedback({
      Email: Email,
      Content: Content
    });
    newFeedback.save(function (err) {
      if (err) {
        console.log(err);
        return;
      } else {
        res.redirect('/');
      }
    });
  }
});


//Start Server on port 3000
app.listen(3000, function () {
  console.log('ok ');
});

//Route Files
let users = require('./routes/users');
app.use('/users', users);
