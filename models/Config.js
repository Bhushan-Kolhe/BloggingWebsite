const mongoose = require('mongoose');

//User Schema
const ConfigSchema = mongoose.Schema({
  Title: {
    type: String,
    required: true
  },
  Posts: {
    type: Number,
    required: true
  },
  Users: {
    type: Number,
    required: true
  }
});

const User = module.exports = mongoose.model('Config', ConfigSchema);
