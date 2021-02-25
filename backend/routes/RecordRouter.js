const express = require('express')
const RecordRouter = express.Router()
const { TaskService, RecordService } = require('../services')
const { TaskModel, RecordModel } = require('../models')

/**
 * @api {get} /record/:recordId Get detail infomation about a record
 * @apiName GetRecordDetail
 * @apiGroup  Record
 * 
 * @apiParam {String} recordId The MongoDB ObjectID of the record you want to fetch detail info
 * 
 * @apiSuccess {Object[]} -       
 * @apiSuccess {Object[]}   -.result The result object array of one record
 * @apiSuccess {Object[]}   -.rules The rule object array of one record
 * 
 */
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

/**
 * @api {delete} /record/:recordId delete a record
 * @apiName DeleteRecord
 * @apiGroup  Record
 * 
 * @apiParam {String} recordId The MongoDB ObjectID of the record you want to delete
 * 
 * @apiSuccessExample Success-Response:
 *   HTTP/1.1 200 OK
 */
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