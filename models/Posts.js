const mongoose = require('mongoose');

//User Schema
const PostSchema = mongoose.Schema({
  Title: {
    type: String,
    required: true
  },
  Content: {
    type: String,
    required: true
  },
  Image: {
    type: String,
    required: true
  },
  UserId: {
    type: String,
    required: true
  }
});

const User = module.exports = mongoose.model('Post', PostSchema);
