const mongoose = require('mongoose');

//User Schema
const UserSchema = mongoose.Schema({
  FirstName: {
    type: String,
    required: true
  },
  LastName: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  BirthDate: {
    type: String,
    required: true
  },
  Gender: {
    type: Buffer,
    required: true
  },
  ProfilePic: {
    type: String,
    required: true
  },
  CoverPic: {
    type: String,
    required: true
  },
  Followers: {
    type: Number,
    required: true
  },
  Views: {
    type: Number,
    required: true
  },
  Following: {
    type: Number,
    required: true
  },
  UserNo: {
    type: Number,
    required: true
  },
  Posts: {
    type: Number,
    required: true
  },
  MyFollowers: {
    type: [String]
  },
  MyFollowing: {
    type: [String]
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
