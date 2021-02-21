const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { String, ObjectId, Number, Boolean } = mongoose.Schema.Types;

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

  // record deleted or not
  deleted: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Task', TaskSchema)