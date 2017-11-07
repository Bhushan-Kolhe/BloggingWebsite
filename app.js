const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');
const moment = require('moment');
const rn = require('random-number');

//Get Users Model
let User = require('./models/Users');

//Get Post model
let Post = require('./models/Posts');

//Get Feedback Model
let Feedback = require('./models/Feedback');

//Get Config Model
let Config = require('./models/Config');

//Connecting to db
mongoose.connect(config.database);
let db = mongoose.connection;
exports.db = db;

//Check connection
db.once('open', function () {
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

//Global config setup
ConfigSetup();
function ConfigSetup() {
  const Posts = 0;
  const Users = 0;
  Config.findOne({ Title: 'Global-Configuration' }, function (err, c) {
    if (err) return console.error(err);
    if (c) {
      return;
    } else {
      let newConfig = new Config({
        Title: 'Global-Configuration',
        Posts: Posts,
        Users: Users
      });
      newConfig.save(function (err) {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
  });
}

//Home Route
app.get('/', function (req, res) {
  if (req.user) {
    res.header('Cache-Control', 'no-cache');
    res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');
    res.redirect('/users/profile');
  }
  else{
    res.render('index');
  }
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
    space = false;
    for (i = 0; i < search.length; i++) {
      if (search[i] != ' ') {
        searchedFirstWord = searchedFirstWord + search[i];
      } else {
        break;
      }

    }
  }

  if (email) {
    email = false;
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

//Suprise Me route
app.get('/SupriseMe', function (req, res) {
  var gen = rn.generator({
      min:  0,
      max:  0,
      integer: true
    });
  Config.findOne({ Title: 'Global-Configuration' }, function (err, c) {
    const Posts = c.Posts;
    if (Posts > 0) {
      var PostNo = gen(1, Posts, true);
      Post.findOne({ PostNo: PostNo }, function (err, post) {
        if (err) return console.error(err);
        res.redirect('/users/post/' + post._id);
      });
    } else {
      res.redirect('/');
    }
  });
});

//adding momentjs to locals
app.locals.moment = require('moment');

//Start Server on port 3000
app.listen(3000, function () {
  console.log('ok ');
});

//Authentication function
function EA(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}


//Route Files
let users = require('./routes/users');
app.use('/users', users);
