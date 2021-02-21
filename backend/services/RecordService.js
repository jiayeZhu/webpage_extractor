const { RecordModel, TaskModel } = require("../models")
const { emitter } = require('../bin/CrawlerManager')
const config = require('config')

const standaloneMode = config.get('standalone')

const createRecords = async (url, taskId, rules) => {
  let record = new RecordModel({ url, belongto: taskId })
  try {
    let { _id } = await record.save()
    if (standaloneMode) emitter.emit('RECORD_CREATED', { recordId: _id, url, rules })
    return _id
  } catch (error) {
    console.error(error.message)
    return Promise.reject()
  }
}

module.exports = { createRecords }