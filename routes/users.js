const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Get Users Model
let User = require('../models/Users');

//Register form
router.get('/register', function (req, res) {
  res.render('signup');
});

//Register process
router.post('/register', function (req, res) {
  const FirstName = req.body.FirstName;
  const LastName = req.body.LastName;
  const Email = req.body.Email;
  const Password = req.body.Password;
  const Password2 = req.body.Password2;
  const Birthday = req.body.bday;
  const Gender = req.body.gender;

  req.checkBody('FirstName', 'First Name is required').notEmpty();
  req.checkBody('LastName', 'Last Name is required').notEmpty();
  req.checkBody('Email', 'Email is required').notEmpty();
  req.checkBody('Email', 'Email is not valid').isEmail();
  req.checkBody('Password', 'Password is required').notEmpty();
  req.checkBody('Password2', 'Passwords do not match').equals(req.body.Password);

  let errors = req.validationErrors();
  if (errors) {
    res.render('signup', {
      errors: errors
    });
  } else {
    let newUser = new User({
      FirstName: FirstName,
      LastName: LastName,
      Email: Email,
      Password: Password,
      BirthDate: Birthday,
      Gender: Gender
    });
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(newUser.Password, salt, function (err, hash) {
        if(err){
          console.log(err);
        }
        newUser.Password = hash;
        newUser.save(function (err) {
          if(err){
            console.log(err);
            return;
          } else {
            res.redirect('/');
          }
        });
      });
    });
  }
})

//Login process
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/users/profile',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

router.get('/profile', function (req, res) {
  res.render('profile');
})

module.exports = router;
