const CrawlerService = require('../services/CrawlerService')
const { RecordModel, TaskModel } = require('../models')
const { EventEmitter } = require('events')
const Validator = require('validatorjs')

const emitter = new EventEmitter()

const start = () => {
  emitter.on('RECORD_CREATED', async ({ recordId, url, rules }) => {
    // console.log({ recordId, url, rules })
    let crawlerResult = new Array(rules.length)
    let promises = []
    rules.forEach(async (rule, idx) => {
      let p = new Promise(async (resolve, reject)=>{
        let parseResult = ruleParser(rule)
        if(parseResult === false) {
          // modify status to USER ERROR
          try {
            await RecordModel.findByIdAndUpdate(recordId,{status: 4}) //4 means failed to parse rules
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
    await Promise.all(promises)
    // update results to db
    try {
      await RecordModel.findByIdAndUpdate(recordId,{status: 2, result:crawlerResult})
    } catch (error) {
      console.error(`failed to update results of record: ${recordId} with error: ${error.message}`)
    }
  })
  console.log('Standalone mode. Crawler Manager start listening on event RECORD_CREATED')
}

const stop = () => {
  emitter.removeListener('RECORD_CREATED')
  console.log('Crawler Manager stop listening')
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
      if(typeof ruleOption === 'object' && ['tag','id','class'].includes(ruleOption['by'])) by = ruleOption['by']
      return [CrawlerService.retrieveHeader, by]
    case 'RETRIEVE_FOOTER':
      var by = 'tag'
      if(typeof ruleOption === 'object' && ['tag','id','class'].includes(ruleOption['by'])) by = ruleOption['by']
      return [CrawlerService.retrieveFooter, by]
    case 'RETRIEVE_BY_ID':
      var validation = new Validator({ruleOption},{'ruleOption.*':'string'})
      if (validation.fails()) return false
      return [CrawlerService.retrieveById, ruleOption]
    case 'RETRIEVE_BY_CLASS':
      var validation = new Validator({ruleOption},{'ruleOption.*':'string'})
      if (validation.fails()) return false
      return [CrawlerService.retrieveByClass, ruleOption]
    case 'RETRIEVE_BY_SELECTOR':
      var validation = new Validator({ruleOption},{'ruleOption.*':'string'})
      if (validation.fails()) return false
      return [CrawlerService.retrieveBySelector, ruleOption]
  }
}

module.exports = { stop, start, emitter }