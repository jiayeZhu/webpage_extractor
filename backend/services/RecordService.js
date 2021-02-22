const { RecordModel, TaskModel } = require("../models")
const MQService = require('./MQService')
const { emitter } = require('../bin/CrawlerManager')
const config = require('config')

let standaloneMode = config.get('standalone')
if(process.env.STANDALONE_MODE) {
  switch (process.env.STANDALONE_MODE){
    case 'true':
      standaloneMode = true
      break
    case 'false':
      standaloneMode = false
      break
  }
}

const createRecords = async (url, taskId, rules) => {
  let record = new RecordModel({ url, belongto: taskId })
  try {
    let { _id } = await record.save()
    if (standaloneMode) emitter.emit('RECORD_CREATED', { recordId: _id, url, rules })
    else await MQService.sendMSG({recordId: _id, url, rules})
    return _id
  } catch (error) {
    console.error(error.message)
    return Promise.reject()
  }
}

module.exports = { createRecords }