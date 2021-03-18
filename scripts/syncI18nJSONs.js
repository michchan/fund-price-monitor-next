/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-params */
/* eslint-disable max-len */
/* eslint-disable no-console */
/**
 * Execute script: node scripts/syncI18nJSONs.js
 *
 * Script to synchronize i18n locales JSONs of all languages based on core language.
 *
 * Applicable for app that uses i18next with the following structure:
 *
 * /locale
 *  /en
 *   dashboard.json (filename as namespace of i18next)
 *   products.json
 *  /zh-HK
 *   dashboard.json
 *   products.json
 *
 * @argument:
 *  - "-r": Replacement of values with key pairs.
 *      Pass key matchers to replace new value with custom values. (<namespace>:<old key>->(<namespace>?):<new key> pair)
 *      Pairs are separated by a space character.
 *      It is useful when there are some structural changes.
 *
 *      e.g. node scripts/syncI18nJSONs.js -r article:edit.title->title article:section.body.title->section.title
 *       (two pairs:
 *         articles:edit.title->title, (same namespace)
 *         articles:section.body.title->products:section.title (different namespace)
 *
 * Sync Rules:
 *
 * - File level:
 * 1. If there are outstanding files (namespaces) from based language folder,
 *   copy them to the compared language folder, and replace all values with empty string.
 *
 * 2. If there are outstanding files (namespaces) from compared language folder, remove them.
 *
 * - Key level:
 *
 * 1. When the based JSON has an i18n key while the compared JSON doesn't,
 *   add the i18n key with empty string value to the compared JSON.
 *
 * 2. When the compared JSON has an i18n key while the based JSON doesn't,
 *   remove the i18n key from the compared JSON.
 *
 * 3. When the nested structure of the based JSON changed,
 *   apply that to the compared JSON.
 *   Values are applied to the updated compared JSON according to the argument which
 *   indicates what previous key should be used.
 *
 */
const fs = require('fs')
const _ = require('lodash')

/** ==================================== Definitions ================================== */

/** These must match the folder names under src/locale/data */
const LOCALES_PATH = 'public/locales'
const BASED_LNG = 'en'
const BASED_PATH = `${LOCALES_PATH}/${BASED_LNG}`
const MATCHER_SEPARATOR = '->'

// Key matchers from argument '-r'
const matchers = []
// <The key to match value from (string)> : <The value matched (string)>. E.g. articles:list.title:title (Map list.title to title in articles.json)
const matchedBuffer = {}

/**
 **
 * Find a value with key
 */
const findValueWithKey = (content, key) => key.split('.').reduce((acc, key) => {
  if (typeof acc !== 'string' && acc) return acc[key]

  return acc || ''
}, content)

/**
 * Recursive function to empty all value of the locale JSON
 */
const clearAllValues = content => _.mapValues(content, value => {
  if (typeof value === 'string') return ''
  return clearAllValues(value)
})

/**
 * Compare objects if they have got the same set of keys and structure
 */
const structureHasNoChange = (based, compared) => {
  const basedCleared = clearAllValues(based)
  const comparedCleared = clearAllValues(compared)

  return _.isEqual(basedCleared, comparedCleared)
}

/**
 * Merge each value pair
 */
const mergeValuePair = (key, basedValue, comparedObj, callback, mergedKey) => {
  // Derive compared value
  const comparedValue
    = comparedObj[key]
    // Fallback value
    || (() => typeof basedValue === 'string'
      ? ''
      : {}
    )()

  // Replace the string value
  if (typeof basedValue === 'string') return comparedValue

  // Recurse if it is object or array
  return callback(basedValue, comparedValue, mergedKey || key)
}

/**
 * Recursive function to map new value for the locale JSON
 */
const mergeValues = (basedObj, comparedObj) => (
  // Handle object case
  _.mapValues(basedObj, (basedValue, key) => mergeValuePair(key, basedValue, comparedObj, mergeValues))
)

/**
 * Recursive function to map new value with custom matcher
 */
const mergeValuesWithMatchers = (basedObj, _comparedObj, namespace) => {
  const recur = (basedObj, comparedObj, prevKey = '') => {
    const mergeValuePairWithKey = (key, basedValue, comparedObj, callback) => {
      const mergedKey = prevKey ? `${prevKey}.${key}` : key

      const mergedValue = mergeValuePair(key, basedValue, comparedObj, callback, mergedKey)

      // Replace with custom value
      const keyWithNs = `${namespace}:${mergedKey}`
      const matchedValue = matchedBuffer[keyWithNs]

      if (matchedValue) {
        console.log('------ matchedValue', matchedValue, '----key ', keyWithNs)

        if (typeof matchedValue === 'object') {
          return {
            ...typeof mergedValue === 'object' ? mergedValue : {},
            ...matchedValue,
          }
        }

        return matchedValue
      }

      return mergedValue
    }

    // Handle object case
    return _.mapValues(basedObj, (basedValue, key) => mergeValuePairWithKey(key, basedValue, comparedObj, recur))
  }

  return recur(basedObj, _comparedObj)
}

/**
 * Loop each language folder except the based/core langauge
 *
 * @param {function} callback The callback function that accept the following arguments:
 * - filenames (string[]): the list of filenames
 * - lng (string): the language code of the current iteration
 * - lngPath (string): the file path of the language of the current iteration
 */
const loopOtherLocales = callback => {
  // Loop through each language folder
  localesDir.forEach(folderName => {
    // Do nothing if it is not a folder (of a language)
    if (/[^\\]*\.(\w+)$/.test(folderName)) return

    const lng = folderName

    // Do nothing if it is based language
    if (lng === BASED_LNG) return

    // Read filenames in the language folder
    const lngPath = `${LOCALES_PATH}/${lng}`
    const filenames = fs.readdirSync(`${LOCALES_PATH}/${lng}`)
      // Filter with only .json files
      .filter(filename => /\.json$/i.test(filename))

    callback(filenames, lng, lngPath)
  })
}

/**
 * Find and store matcher values to the matchedBuffer
 *
 * @param {*} lngPath The file path of the language
 * @param {*} oldNs The old namespace to read
 * @param {*} newNs The new namespace to assign as part of matchedBuffer key
 * @param {*} oldKey The old key to search from the file
 * @param {*} newKey The new key to assign as part of matchedBuffer key
 */
const findAndStoreMatcherValues = (lngPath, oldNs, newNs, oldKey, newKey) => {
  const filePath = `${lngPath}/${oldNs}.json`
  const file = fs.readFileSync(filePath)
  const obj = JSON.parse(file)

  matchedBuffer[`${newNs}:${newKey}`] = findValueWithKey(obj, oldKey)
}

/** ==================================== Extract arguments ================================== */

// Parse arguments
process.argv.forEach((val, index) => {
  if (val === '-r') {
    if (process.argv.length - 1 === index) throw new Error('Wrong usage of argument "-r". Please check the documentation.')

    const matcherPairs = process.argv.slice(index + 1)
    matchers.push(...matcherPairs)
  }
})

/** ==================================== Executions ================================== */

/** -------------- Get based language constraints -------------- */

// Get all filenames of namespaces from based langauges (e.g. ['generic.json', 'article.json'])
const basedFilenames = fs.readdirSync(BASED_PATH)
  // Filter with only .json files
  .filter(filename => /\.json$/i.test(filename))

// Get and store all JSONs as object of based language
const basedJSONs = basedFilenames.reduce((buffer, filename) => {
  const jsonStr = fs.readFileSync(`${BASED_PATH}/${filename}`)
  return {
    ...buffer,
    // E.g. 'generic.json': { ... }
    [filename]: JSON.parse(jsonStr),
  }
}, {})

/** -------------- Manipulate other langauges -------------- */

// Read src/locale/data folder
const localesDir = fs.readdirSync(LOCALES_PATH)

// Loop through each language folder (except based langauge)
loopOtherLocales((filenames, lng, lngPath) => {
  // Store matcher values to matched buffer
  matchers.forEach(matcher => {
    const splitted = matcher.split(MATCHER_SEPARATOR)

    if (splitted.length === 3) {
      const [ns, oldKey, newKey] = splitted

      findAndStoreMatcherValues(lngPath, ns, ns, oldKey, newKey)
      return
    }
    if (splitted.length === 4) {
      const [oldNs, oldKey, newNs, newKey] = splitted

      findAndStoreMatcherValues(lngPath, oldNs, newNs, oldKey, newKey)
      return
    }

    throw new Error(`Matcher should be of length 3 or 4: ${matcher}`)
  })

  // Loop through each file in the language folder
  filenames.forEach(filename => {
    /** ---------- Remove file if it does not exist in based language folder ----------- */

    if (!basedFilenames.includes(filename)) {
      fs.unlink(`${lngPath}/${filename}`, err => {
        if (err) throw err
        console.log(`Removed ${filename} of ${lng}, as it does not exist in based language ${BASED_LNG}.`)
      })
      return
    }

    /** ---------- Merge locales keys ----------- */

    // Get the based JSON object
    const basedObj = basedJSONs[filename]
    const destFilePath = `${lngPath}/${filename}`

    // Read the compared JSON file
    const comparedFile = fs.readFileSync(destFilePath)
    const comparedObj = JSON.parse(comparedFile)

    // Break if based and compared JSON files are equal.
    if (structureHasNoChange(basedObj, comparedObj)) {
      // Console.log('"' + filename + '"' + ' of ' + lng + ' checked without changes.')
      return
    }

    // Merge changes
    const mergedObj = mergeValues(basedObj, comparedObj)

    // Get namespace from filename
    const [namespace] = filename.split('.')

    // Replace with custom matchers
    const matchedObj = mergeValuesWithMatchers(mergedObj, comparedObj, namespace)

    // Update the file
    fs.writeFileSync(destFilePath, JSON.stringify(matchedObj, null, 2))

    // Log update file message
    console.log(`---- Updated file "${filename}" of ${lng}`)
  })

  /** ---------- Add file if it exists in based langauge folder but not exist in this language --------- */

  basedFilenames.forEach(filename => {
    if (!filenames.includes(filename)) {
      /** Copy file from based language folder to folder of this language */

      // Define file paths
      const basedFilePath = `${BASED_PATH}/${filename}`
      const destFilePath = `${lngPath}/${filename}`

      // Copy file
      fs.copyFileSync(basedFilePath, destFilePath)

      /** Empty all values for that new file */

      // Get the based JSON
      const basedObj = basedJSONs[filename]
      // Replace all end-values with empty string
      const emptiedObj = clearAllValues(basedObj)

      // Update the file
      fs.writeFileSync(destFilePath, JSON.stringify(emptiedObj, null, 4))

      // Log copied file message
      console.log(`Copied file "${filename}`, `${Number('" from ') + basedFilePath} to ${destFilePath}`)
    }
  })
})