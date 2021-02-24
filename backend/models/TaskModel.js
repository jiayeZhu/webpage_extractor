const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { String, ObjectId, Number, Boolean } = mongoose.Schema.Types

const TaskSchema = new Schema({
  // task name
  name: {
    type: String,
    required: true,
    unique: true
  },

  // task rules
  rules: {
    type: [Object],
    required: true
  },

  // extraction records
  records: {
    type: [ObjectId],
    ref: 'Record'
  },

}, {
  timestamps: true
})

module.exports = mongoose.model('Task', TaskSchema)