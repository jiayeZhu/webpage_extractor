const express = require('express')
const TaskRouter = express.Router()
const { TaskService, RecordService } = require('../services')
const { TaskModel, RecordModel } = require('../models')
const { body, validationResult } = require('express-validator')

const VALID_RULES = ['COUNT_TAGS', 'RETRIEVE_HEADER', 'RETRIEVE_FOOTER', 'RETRIEVE_BY_ID', 'RETRIEVE_BY_CLASS', 'RETRIEVE_BY_SELECTOR']
const PAGE_SIZE = 10

// create new extraction task
TaskRouter.post(
  '/',
  body('name').isString().notEmpty(),
  body('rules').isArray({ min: 1 }),
  body('urls').isArray({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    let { name, rules, urls } = req.body

    // filter rules, only keep those valid rules. if no rule left after filtering, return error
    rules = rules.filter(r => VALID_RULES.includes(Object.keys(r)[0]))
    if (rules.length === 0) return res.status(400).json({ errors: "no valid rule detected" })

    try {
      let _id = await TaskService.createTask({ name, rules, urls })
      let promises = []
      urls.forEach(url => {
        promises.push(RecordService.createRecords(url, _id, rules))
      })
      let recordIds = await Promise.all(promises)
      await TaskModel.findByIdAndUpdate(_id, { records: recordIds })
      return res.status(201).json({ _id })
    } catch (error) {
      return res.sendStatus(500)
    }

  })

TaskRouter.get('/', async (req, res) => {
  let page = parseInt(req.query.page)
  if (isNaN(page) || page < 1) page = 1
  try {
    let totalCount = await TaskModel.count()
    let tasks = await TaskModel
      .find({}, 'rules records _id name createdAt')
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .sort({ 'createdAt': -1 })
      .populate({ path: 'records', select: 'status url _id', model: 'Record' })
      .lean(true)
    tasks = tasks.map(t => {
      t.urls = t.records.map(r => r.url)
      t.progress = t.records.length === 0 ? 100 : t.records.filter(r => r.status !== 0).length / t.records.length * 100
      return t
    })
    return res.json({ tasks, totalCount })
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
})

TaskRouter.delete('/:id', async (req, res) => {
  let { id } = req.params
  try {
    let task = await TaskModel.findById(id)
    let ids = task.records.map(r => r._id)
    let promises = []
    ids.forEach(async id => {
      try {
        let p = RecordModel.findByIdAndRemove(id)
        promises.push(p)
        await p
      } catch (error) {
        console.error(`Failed to delete record:${id} with errir:${error.message}`)
      }
    })
    let results = await Promise.allSettled(promises)
    await task.remove()
    return res.sendStatus(200)
  } catch (error) {
    console.error(error.message)
    return res.sendStatus(500)
  }
})

TaskRouter.get('/:taskId/record', async(req,res)=>{
  let page = parseInt(req.query.page)
  if (isNaN(page) || page < 1) page = 1
  let { taskId } = req.params
  try {
    let totalCount = await RecordModel.count({belongto:taskId})
    let records = await RecordModel
      .find({belongto:taskId},'status url _id title')
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .sort({ 'createdAt': 1 })
      .lean(true)
    return res.json({ records, totalCount })
  } catch (error) {
    console.error(error.message)
    return res.sendStatus(500)
  }
})

module.exports = TaskRouter