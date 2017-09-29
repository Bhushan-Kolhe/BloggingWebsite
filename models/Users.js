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
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
