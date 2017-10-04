const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

//Get Users Model
let User = require('./models/Users');

//Get Post model
let Post = require('./models/Posts');

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

//search route
app.post('/search', function (req, res) {
  const search = req.body.Search;
  var i = 0;
  let searchedFirstWord = '';
  let searchedUsers = 'asd';
  let searchedPosts;
  let space = false;
  let email = false;
  for (i = 0; i < search.length; i++) {
    if (search[i] == ' ') space = true;
    if (search[i] == '@') email = true;
  }
  if (space) {
    for (i = 0; i < search.length; i++) {
      if (search[i] != ' ') {
        searchedFirstWord = searchedFirstWord + search[i];
      } else {
        break;
      }

    }
  }

  if (email) {
    User.find({ Email: search }, function (err, user) {
      if (err) {
        console.log(err);
      }

      if (user != '') {
        res.render('search', {
          users: user,
          errPost: 'No posts Found',
        });
      } else {
        return;

        //res.render('search', { err: 'No user Found' });
      }
    });
  }

  User.find({ FirstName: search }, function (err, users) {
    if (err) {
      console.log(err);
    }

    if (users != '') {
      res.render('search', {
        users: users,
        errPost: 'No posts Found',
      });
    } else {
      return;
    }
  });

  User.find({ FirstName: searchedFirstWord }, function (err, users) {
    if (err) {
      console.log(err);
    }

    if (users != '') {
      res.render('search', {
        users: users,
        errPost: 'No posts Found',
      });
    } else {
      return;
    }
  });

  User.find({ LastName: search }, function (err, users) {
    if (err) {
      console.log(err);
    }

    if (users != '') {
      res.render('search', {
        users: users,
        errPost: 'No posts Found',
      });
    } else {
      return;
    }
  });

  Post.find({ Title: search }, function (err, Posts) {
    if (err) {
      console.log(err);
    }

    if (Posts != '') {
      res.render('search', {
        Posts: Posts,
        errUser: 'No users Found',
      });
    } else {
      res.render('search', {
        errPost: 'No posts Found',
        errUser: 'No users Found',
      });
    }
  });
});


//Start Server on port 3000
app.listen(3000, function () {
  console.log('ok ');
});

//Route Files
let users = require('./routes/users');
app.use('/users', users);
