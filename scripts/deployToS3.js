/* eslint-disable no-console */
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const pipeAsync = require('simply-utils/dist/async/pipeAsync').default

const {
  AWS_DEFAULT_REGION,
  AWS_S3_BUCKET_NAME,
  STATIC_BUILD_DIRNAME,
  HTML_EXTENSION_RETAIN_WHITELIST = '',
} = process.env
// Log environment variables
console.log('[-] Environment variables: ', JSON.stringify({
  AWS_DEFAULT_REGION,
  AWS_S3_BUCKET_NAME,
  STATIC_BUILD_DIRNAME,
  HTML_EXTENSION_RETAIN_WHITELIST,
}, null, 2))

// Set the region
AWS.config.update({ region: AWS_DEFAULT_REGION })

const s3 = new AWS.S3()

const isDir = name => !/\..+$/.test(name)

const HTML_REGEXP = /\.html$/i
const isHTML = name => HTML_REGEXP.test(name)
const HTML_EXT_RETAIN_LIST = HTML_EXTENSION_RETAIN_WHITELIST.split(',')
const ROOT_DIR = STATIC_BUILD_DIRNAME

const readDirRecursive = dirname => fs.readdirSync(path.join(ROOT_DIR, dirname))
  .reduce((acc, eachPath) => {
    const jointPath = path.join(dirname, eachPath)
    if (isDir(eachPath))
      return [...acc, ...readDirRecursive(jointPath)]
    return [...acc, jointPath]
  }, [])

// Read build directory file/sub-directory names
const fileKeys = readDirRecursive('')

// Log files to upload
console.log(`[-] (${fileKeys.length}) Files to upload: `, JSON.stringify(fileKeys, null, 2))

pipeAsync(
  // Create filestream to read and upload each file
  ...fileKeys.map((Key, i, arr) => () => new Promise((resolve, reject) => {
    const filePath = path.join(ROOT_DIR, Key)
    const partNum = `${i + 1}/${arr.length}`
    const fileStream = fs.createReadStream(filePath)

    // Catch error
    fileStream.on('error', err => {
      console.error(`[X] (${partNum}) File stream error: `, err.message)
      reject(err)
    })

    const shouldRemoveHTMLExtension = isHTML(Key) && !HTML_EXT_RETAIN_LIST.includes(Key)
    // Call S3 to retrieve upload file to specified bucket
    s3.upload({
      Bucket: AWS_S3_BUCKET_NAME,
      // Remove .html extension
      Key: shouldRemoveHTMLExtension ? Key.replace(HTML_REGEXP, '') : Key,
      Body: fileStream,
      ...isHTML(Key) ? { ContentType: 'text/html' } : {},
    }, (err, data) => {
      if (err) {
        console.error(`[X] (${partNum}) S3 upload error: `, err.message)
        reject(err)
        return
      }
      // Done upload process
      console.log(`[-] (${partNum}) Upload Success: `, data.Location)
      resolve()
    })
  })),
  // Last executor
  () => {
    // Log done!
    console.log('Upload all files successfully!')
  }
)()