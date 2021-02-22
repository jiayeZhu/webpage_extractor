const express = require('express')
const TaskRouter = express.Router()
const { TaskService, RecordService } = require('../services')
const { TaskModel } = require('../models')
const config = require('config')
const { body, validationResult } = require('express-validator')

// create new extraction task
TaskRouter.post(
  '/',
  body('name').isString().notEmpty(),
  body('rules').isArray({ min: 1 }),
  body('urls').isArray({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    let { name, rules, urls } = req.body
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

module.exports = TaskRouter