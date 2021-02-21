const express = require('express')
const router = express.Router()
const TaskRouter = require('./TaskRouter')

/* ROOT Router index */

router.use('/task/', TaskRouter)


module.exports = router
