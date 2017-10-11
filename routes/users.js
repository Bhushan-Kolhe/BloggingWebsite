const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const fs = require('fs');

//Get Users Model
let User = require('../models/Users');

//Get Post model
let Post = require('../models/Posts');

// default options
router.use(fileUpload());

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
  const CoverPic = '../images/pexels-photo-227675.jpeg';
  const ProfilePic = '../images/default.jpg';
  const Followers = 0;
  const Following = 0;
  const Posts = 0;

  User.findOne({ Email: Email }, function (err, user) {
    if (err) return console.error(err);
    if (user) {
      res.render('signup', {
        error: 'Email is already registered.'
      });
    } else {
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
          Gender: Gender,
          CoverPic: CoverPic,
          ProfilePic: ProfilePic,
          Followers: Followers,
          Following: Following,
          Posts: Posts
        });
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(newUser.Password, salt, function (err, hash) {
            if(err){
              console.log(err);
            }
            newUser.Password = hash;
            newUser.save(function (err) {
              if (err) {
                console.log(err);
                return;
              } else {
                res.redirect('/');
              }
            });
          });
        });
      }
    }
  });
});

//New Post
router.post('/New-Post', function (req, res, next) {
  const Title = req.body.Title;
  const Content = req.body.Content;
  let Likes = 0;
  let NoOfComments = 0;
  let File;
  let Image;
  let newPost;
  let currentUser;
  let isFile = false;
  if (req.files.Image) {
    console.log(req.files);
    File = req.files.Image;
    Image = File.name;
    isFile = true;
  }
  req.checkBody('Title', 'Title is required').notEmpty();
  req.checkBody('Content', 'Content is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    res.render('profile', {
      errors: errors
    });
  } else {
    if (isFile) {
      if (fs.existsSync('./public/users/' + req.user._id + '/images')) {
        File.mv('./public/users/' + req.user._id + '/images/' + Image, function (err) {
          if (err)
            return res.status(500).send(err);
        });
      } else {
        fs.mkdirSync('./public/users/' + req.user._id, 0777);
        fs.mkdirSync('./public/users/' + req.user._id + '/images/', 0777);
        File.mv('./public/users/' + req.user._id + '/images/' + Image, function (err) {
          if (err)
            return res.status(500).send(err);
        });
      }

      newPost = new Post({
        Title: Title,
        Content: Content,
        Image: Image,
        UserId: req.user._id,
        Likes: Likes,
        NoOfComments: NoOfComments
      });
    } else {
      newPost = new Post({
        Title: Title,
        Content: Content,
        Image: 'no-image',
        UserId: req.user._id,
        Likes: Likes,
        NoOfComments: NoOfComments
      });
    }
    req.user.Posts = req.user.Posts + 1;
    req.user.save();
    newPost.save(function (err) {
      if(err){
        console.log(err);
        return;
      } else {
        res.redirect('/users/myPosts');
      }
    });
  }
});

//single post route
router.get('/post/:id', function (req, res) {
  const id = req.params.id;
  Post.findById(id, function (err, post) {
    if (req.user) {
      var Comments = post.Comments;
      var users;
      var i = 0;
      while (i < post.NoOfComments) {
        User.findById(Comments[i].UserId, function (err, user) {
          users = user;
          console.log('00');
        });
        i++;
      }
      console.log(users);
      res.render('post', {
        post: post,
        CurrentUser: req.user
      });
    } else {
      res.render('post', {
        post: post,
        CurrentUser: 0
      });
    }
  });
});

//single user route
router.get('/profile/:id', function (req, res) {
  const id = req.params.id;
  User.findById(id, function (err, user) {
    if (req.user) {
      var following = req.user.MyFollowing;
      var isfollowing = false;
      var i = 0;
      while (i < following.length ) {
        if (following[i] == id) {
          isfollowing = true;
          res.render('userProfile', {
            user: user,
            isfollowing : isfollowing
          });
          break;
        }
        i++;
      }

      if (i >= following.length ) {
        res.render('userProfile', {
          user: user,
          isfollowing : isfollowing
        });
      }
    } else {
      res.render('userProfile', {
        user: user
      });
    }
  });
});

//follow user
router.get('/follow/:id', function (req, res) {
  const id = req.params.id;
  User.findById(id, function (err, user) {
    if (req.user) {
      User.findByIdAndUpdate(
        req.user._id,
        { $push: { 'MyFollowing': id } },
        { safe: true, upsert: true, new : true },
        function (err, model) {
          user.Followers += 1;
          user.save();
          model.Following += 1;
          model.save();
          res.redirect('/users/profile/' + id);
        }
      );
    } else {
      res.redirect("/");
    }
  });
});

//unfollow user
router.get('/unfollow/:id', function (req, res) {
  const id = req.params.id;
  User.findById(id, function (err, user) {
    if (req.user) {
      User.findByIdAndUpdate(
        req.user._id,
        { $pull: { 'MyFollowing': id } },
        { safe: true, upsert: true, new : true },
        function (err, model) {
          user.Followers -= 1;
          user.save();
          model.Following -= 1;
          model.save();
          res.redirect('/users/profile/' + id);
        }
      );
    } else {
      res.redirect("/");
    }
  });
});


//new-profile-pic
router.post('/New-Profile-Pic', function (req, res) {
  let File;
  let Image;
  let isFile = false;

  if (req.files.Image) {
    File = req.files.Image;
    Image = File.name;
    isFile = true;
  }

  if (isFile) {
    if (fs.existsSync('./public/users/' + req.user._id + '/images')) {
      File.mv('./public/users/' + req.user._id + '/images/' + Image, function (err) {
        if (err)
          return res.status(500).send(err);
      });
    } else {
      fs.mkdirSync('./public/users/' + req.user._id, 0777);
      fs.mkdirSync('./public/users/' + req.user._id + '/images/', 0777);
      File.mv('./public/users/' + req.user._id + '/images/' + Image, function (err) {
        if (err)
          return res.status(500).send(err);
      });
    }
  }

  User.findOne({ Email: req.user.Email }, function (err, user) {
    if (err) return console.error(err);
    if (user) {
      user.ProfilePic = '../users/' + req.user._id + '/images/' + Image;
      user.save();
    }
  });
  res.redirect('/users/profile');
});

//new-cover-pic
router.post('/New-Cover-Pic', function (req, res) {
  let File;
  let Image;
  let isFile = false;

  if (req.files.Image) {
    File = req.files.Image;
    Image = File.name;
    isFile = true;
  }

  if (isFile) {
    if (fs.existsSync('./public/users/' + req.user._id + '/images')) {
      File.mv('./public/users/' + req.user._id + '/images/' + Image, function (err) {
        if (err)
          return res.status(500).send(err);
      });
    } else {
      fs.mkdirSync('./public/users/' + req.user._id, 0777);
      fs.mkdirSync('./public/users/' + req.user._id + '/images/', 0777);
      File.mv('./public/users/' + req.user._id + '/images/' + Image, function (err) {
        if (err)
          return res.status(500).send(err);
      });
    }
  }

  User.findOne({ Email: req.user.Email }, function (err, user) {
    if (err) return console.error(err);
    if (user) {
      user.CoverPic = '../users/' + req.user._id + '/images/' + Image;
      user.save();
    }
  });

  res.redirect('/users/profile');
});

//My-post route
router.get('/myPosts', function (req, res) {
  Post.find({ UserId: req.user._id }, function (err, posts) {
    if (err) console.log(err);
    if (posts != '') {
      res.render('my-posts', {
        Posts: posts
      });
    } else {
      res.render('my-posts');
    }
  });
});

//Post comment
router.post('/commentPost/:id', function (req, res, next) {
  const id = req.params.id;
  const commentContent = req.body.commentsContent;
  if (req.user) {
    Post.findByIdAndUpdate(
      id,
      { $push: { 'Comments': {
        UserId: req.user._id,
        CommentContent: commentContent
      } } },
      { safe: true, upsert: true, new : true },
      function (err, post) {
        post.NoOfComments += 1;
        post.save();
        res.redirect('/users/post/' + post._id);
      });
  } else {
    res.redirect('/');
  }
});

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
});

//Logout
router.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;
