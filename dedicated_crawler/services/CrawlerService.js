const cheerio = require('cheerio')
const axios = require('axios').default

const countTags = async (url) => {
  const result = {}
  try {
    let response = await axios.get(url)
    const $ = cheerio.load(response.data)
    $('*').each((i, e) => {
      if (!result[e.tagName]) result[e.tagName] = 1
      else result[e.tagName]++
    })
  } catch (error) {
    console.error(`Failed to count_tags from url: ${url}`)
    return Promise.reject(error)
  }
  return result
}

const retrieveByTagName = async (url, tagNames) => {
  const result = {}
  try {
    let response = await axios.get(url)
    const $ = cheerio.load(response.data)
    tagNames.forEach(tagName => {
      const subResult = []
      $(`${tagName}`).each((i, e) => {
        subResult.push(turn2innerText($(e).text()))
      })
      result[tagName] = subResult
    })
  } catch (error) {
    console.error(`Failed to retrieve_by_tagname from url: ${url} with tag names: ${tagNames}`)
    return Promise.reject(error)
  }
  return result
}

const retrieveHeader = async (url, by = 'tag') => {
  try {
    switch (by) {
      case 'tag':
        return (await retrieveByTagName(url, ['header']))['header']
      case 'id':
        return (await retrieveById(url, ['header']))['header']
      case 'class':
        return (await retrieveByClass(url, ['header']))['header']
    }
  } catch (error) {
    console.error(`Failed to retrieve_header from url: ${url} with selecting by: ${by}`)
    return Promise.reject(error)
  }
}

const retrieveFooter = async (url, by = 'tag') => {
  try {
    switch (by) {
      case 'tag':
        return (await retrieveByTagName(url, ['footer']))['footer']
      case 'id':
        return (await retrieveById(url, ['footer']))['footer']
      case 'class':
        return (await retrieveByClass(url, ['footer']))['footer']
    }
  } catch (error) {
    console.error(`Failed to retrieve_footer from url: ${url} with selecting by: ${by}`)
    return Promise.reject(error)
  }
}

const retrieveById = async (url, ids) => {
  const result = {}
  try {
    let response = await axios.get(url)
    const $ = cheerio.load(response.data)
    ids.forEach(id => {
      let content = turn2innerText($(`#${id}`).first().text()) // to make it behave like document.getElementById, only take the first match
      result[id] = content
    });
  } catch (error) {
    console.error(`Failed to retrieve_by_id from url: ${url} with ids: ${ids}`)
    return Promise.reject(error)
  }
  return result
}

const retrieveByClass = async (url, classes) => {
  const result = {}
  try {
    let response = await axios.get(url)
    const $ = cheerio.load(response.data)
    classes.forEach(cls => {
      const subResult = []
      $(`.${cls}`).each((i, e) => {
        subResult.push(turn2innerText($(e).text()))
      })
      result[cls] = subResult
    })
  } catch (error) {
    console.error(`Failed to retrieve_by_class from url: ${url} with classes: ${classes}`)
    return Promise.reject(error)
  }
  return result
}

const retrieveBySelector = async (url, selectors) => {
  const result = {}
  try {
    let response = await axios.get(url)
    const $ = cheerio.load(response.data)
    selectors.forEach(selector => {
      const subResult = []
      $(`${selector}`).each((i, e) => {
        subResult.push(turn2innerText($(e).text()))
      })
      result[selector] = subResult
    })
  } catch (error) {
    console.error(`Failed to retrieve_by_selector from url: ${url} with selectors: ${selectors}`)
    return Promise.reject(error)
  }
  return result
}

const turn2innerText = (cheerioText) => {
  return cheerioText.split('\n').map(e => e.trim()).filter(e => e.length > 0).join('\n')
}


module.exports = { countTags, retrieveByTagName, retrieveHeader, retrieveFooter, retrieveById, retrieveByClass, retrieveBySelector }

/* Test cases */
// const main = async _ => {
//   var results = await retrieveById('https://www.brightedge.com/',['block-block-45','block-block-32'])
//   console.log(results)
//   var results = await countTags('https://www.brightedge.com/')
//   console.log(results)
//   var results = await retrieveByTagName('https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map',['div','p'])
//   console.log(results)
//   var results = await retrieveByClass('https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent', ['title', 'page-content-container'])
//   console.log(results)
//   var results = await retrieveBySelector('https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent', ['h2', '.page-content-container','#nav-footer'])
//   console.log(results)
// }
// main()
/* Test cases */