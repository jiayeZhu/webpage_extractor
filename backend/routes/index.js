const express = require('express')
const router = express.Router()
const TaskRouter = require('./TaskRouter')
const RecordRouter = require('./RecordRouter')
/* ROOT Router index */

router.use('/task/', TaskRouter)
router.use('/record/', RecordRouter)

module.exports = router
