const { RecordModel } = require("./models")
const mongoose = require('mongoose')
const CrawlerService = require('./services/CrawlerService')
const amqp = require('amqplib')
const config = require('config')
const Validator = require('validatorjs')

console.log(process.env)
const mq_host = process.env.MQ_HOST || config.get('RabbitMQ').host
const mq_port = process.env.MQ_PORT || config.get('RabbitMQ').port
const queueName = process.env.MQ_QUEUE_NAME || config.get('RabbitMQ').queueName
// const { host, port, queueName } = config.get('RabbitMQ')

const connect = async () => {
  try {
    const db_host = process.env.DB_HOST || config.get('DB').host
    const db_port = process.env.DB_PORT || config.get('DB').port
    const dbName = process.env.DB_NAME || config.get('DB').dbName
    // const { host, port, dbName } = config.get('DB')
    console.log("==== connecting to DB ====")
    await mongoose.connect(`mongodb://${db_host}:${db_port}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    console.log("===== DB connected. =====")
  } catch (error) {
    console.error("===== Failed to connect to DB =====")
    console.error(error.message)
    console.error("===== shutting down =====")
    process.exit()
  }



  let connection = await amqp.connect(`amqp://${mq_host}:${mq_port}`)
  let channel = await connection.createChannel()
  await channel.assertQueue(queueName, { durable: true })
  console.log('Cluster mode. Worker connected to the MQ.')
  return { connection, channel }
}
const handleMSG = async ({ recordId, url, rules }) => {
  try {
    await RecordModel.findByIdAndUpdate(recordId, { status: 1 })
  } catch (error) {
    RecordModel.findByIdAndUpdate(recordId, { status: 3 }).catch(err => {
      console.error(`failed to set status of record: ${recordId} to 3 with error: ${err.message}`)
    })
    return false
  }
  // console.log({ recordId, url, rules })
  let crawlerResult = new Array(rules.length)
  let promises = []
  promises.push(new Promise(async (resolve, reject) => {
    let title = (await CrawlerService.retrieveBySelector(url, ['head>title']))['head>title'][0]
    try {
      await RecordModel.findByIdAndUpdate(recordId, { title })
      resolve()
    } catch (error) {
      RecordModel.findByIdAndUpdate(recordId, { status:3 }).catch(console.error) // 3 means internal error
      // console.error(`failed to modify record: ${recordId} title to ${title}. with error: ${error.message}`)
      reject(new Error(`failed to modify record: ${recordId} title to ${title}. with error: ${error.message}`))
    }
    
  }))
  rules.forEach(async (rule, idx) => {
    let p = new Promise(async (resolve, reject) => {
      let parseResult = ruleParser(rule)
      if (parseResult === false) {
        // modify status to USER ERROR
        try {
          await RecordModel.findByIdAndUpdate(recordId, { status: 4 }) //4 means failed to parse rules
        } catch (error) {
          console.error(`failed to modify record: ${recordId} status to 4. with error: ${error.message}`)
        }
        resolve()
      } else {
        let [crawlerFn, option] = parseResult
        if (option !== undefined) crawlerResult[idx] = await crawlerFn(url, option)
        else crawlerResult[idx] = await crawlerFn(url)
        resolve()
      }
    })
    promises.push(p)
  })

  try {
    // update results to db
    await Promise.all(promises)
    await RecordModel.findByIdAndUpdate(recordId, { status: 2, result: crawlerResult })
    return true
  } catch (error) {
    console.error(`failed to update results of record: ${recordId} with error: ${error.message}`)
    RecordModel.findByIdAndUpdate(recordId, { status: 3 }).catch(err => {
      console.error(`failed to set status of record: ${recordId} to 3 with error: ${err.message}`)
    })
    return false
  }
}

/**
 * Only support rule in this format: {RULE_TYPE:RULE_OPTION}
 * 
 * Acceptable RULE_TYPEs are: ['COUNT_TAGS','RETRIEVE_HEADER','RETRIEVE_FOOTER','RETRIEVE_BY_ID','RETRIEVE_BY_CLASS','RETRIEVE_BY_SELECTOR']
 * 
 * RULE_OPTION is ignored when RULE_TYPE is 'COUNT_TAGS'
 * 
 * RULE_OPTION should be {by:METHOD} when RULE_TYPE isin ['RETRIEVE_HEADER','RETRIEVE_FOOTER'] while METHOD isin ['tag','id','class']
 * 
 * @param {*} rule 
 */
const ruleParser = (rule) => {
  if (typeof rule !== 'object' || Object.entries(rule).length !== 1) return false
  let [ruleType, ruleOption] = Object.entries(rule)[0]
  switch (ruleType) {
    case 'COUNT_TAGS':
      return [CrawlerService.countTags, undefined]
    case 'RETRIEVE_HEADER':
      var by = 'tag'
      if (typeof ruleOption === 'object' && ['tag', 'id', 'class'].includes(ruleOption['by'])) by = ruleOption['by']
      return [CrawlerService.retrieveHeader, by]
    case 'RETRIEVE_FOOTER':
      var by = 'tag'
      if (typeof ruleOption === 'object' && ['tag', 'id', 'class'].includes(ruleOption['by'])) by = ruleOption['by']
      return [CrawlerService.retrieveFooter, by]
    case 'RETRIEVE_BY_ID':
      var validation = new Validator({ ruleOption }, { 'ruleOption.*': 'string' })
      if (validation.fails()) return false
      return [CrawlerService.retrieveById, ruleOption]
    case 'RETRIEVE_BY_CLASS':
      var validation = new Validator({ ruleOption }, { 'ruleOption.*': 'string' })
      if (validation.fails()) return false
      return [CrawlerService.retrieveByClass, ruleOption]
    case 'RETRIEVE_BY_SELECTOR':
      var validation = new Validator({ ruleOption }, { 'ruleOption.*': 'string' })
      if (validation.fails()) return false
      return [CrawlerService.retrieveBySelector, ruleOption]
  }
}

const main = async () => {
  let { connection, channel } = await connect()
  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      try {
        let { recordId, url, rules } = JSON.parse(msg.content.toString())
        let success = await handleMSG({ recordId, url, rules })
        if (success) channel.ack(msg)
        else channel.nack(msg)
      } catch (error) {
        console.error(error)
      }
    }
  }).catch(console.error)

}

main()