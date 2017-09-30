const mongoose = require('mongoose');

//User Schema
const FeedbackSchema = mongoose.Schema({
  Email: {
    type: String,
    required: true
  },
  Content: {
    type: String,
    required: true
  }
});

const User = module.exports = mongoose.model('Feedback', FeedbackSchema);
