const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { String, ObjectId, Number, Boolean } = mongoose.Schema.Types;

const RecordSchema = new Schema({
  // title of the url
  title: { type: String },

  // webpage url
  url: {
    type: String,
    required: true
  },

  // webpage title
  title: {type: String},

  // extraction rules
  // rules: [Object],

  // extraction status
  status: {
    type: Number,
    enum: [0, 1, 2, 3, 4], //0:pending, 1:extracting, 2:succeeded, 3:internal error, 4:failed to parse rules
    required: true,
    default: 0
  },

  // extractor pid
  // pid: {type: Number},

  // record deleted or not
  deleted: {
    type: Boolean,
    default: false,
    required: true
  },

  // which task this record belongs to
  belongto: {
    type: ObjectId,
    ref: 'Task',
    required: true
  },

  // extraction result
  result: [Object]
}, {
  timestamps: true
})

module.exports = mongoose.model('Record', RecordSchema)