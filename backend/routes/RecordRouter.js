const express = require('express')
const RecordRouter = express.Router()
const { TaskService, RecordService } = require('../services')
const { TaskModel, RecordModel } = require('../models')

RecordRouter.get('/:recordId', async (req,res)=>{
  let { recordId } = req.params
  try {
    let records = await RecordModel
      .findById(recordId, 'result belongto')
      .populate({ path: 'belongto', select: 'rules', model: 'Task' })
      .lean(true)
      .map(r=>({
        result: r.result,
        rules: r.belongto.rules
      }))
    return res.json(records)
  } catch (error) {
    console.error(error.message)
    return res.sendStatus(500)
  }
})

RecordRouter.delete('/:recordId', async (req, res) => {
  let { recordId } = req.params
  try {
    let record = await RecordModel.findById(recordId)
    let task = await TaskModel.findById(record.belongto)
    await task.records.pull(recordId)
    await record.remove()
    return res.sendStatus(200)
  } catch (error) {
    console.error(error.message)
    return res.sendStatus(500)
  }
})

module.exports = RecordRouter