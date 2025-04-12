/* eslint-disable no-console */
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const pipeAsync = require('simply-utils/dist/async/pipeAsync').default
const mime = require('mime-types')
const zlib = require('zlib')
const Stream = require('stream')

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

const isDir = pathname => fs.lstatSync(path.join(ROOT_DIR, pathname)).isDirectory()

const HTML_REGEXP = /\.html$/i
const isHTML = name => HTML_REGEXP.test(name)
const HTML_EXT_RETAIN_LIST = HTML_EXTENSION_RETAIN_WHITELIST.split(',')
const ROOT_DIR = STATIC_BUILD_DIRNAME

const readDirRecursive = dirname => fs.readdirSync(path.join(ROOT_DIR, dirname))
  .reduce((acc, eachPath) => {
    const jointPath = path.join(dirname, eachPath)
    if (isDir(jointPath))
      return [...acc, ...readDirRecursive(jointPath)]
    return [...acc, jointPath]
  }, [])

// Read build directory file/sub-directory names
const fileKeys = readDirRecursive('')

// Log files to upload
console.log(`[-] (${fileKeys.length}) Files to upload: `, JSON.stringify(fileKeys, null, 2))

const removePrevGeneratedFiles = async () => {
  const data = await s3.listObjectsV2({
    Bucket: AWS_S3_BUCKET_NAME,
    Prefix: '_next/',
  })
    .promise()
    .catch(err => {
      console.error('[X] List generated files error: ', err.message)
      throw err
    })

  if (data.KeyCount === 0 || data.Contents.length === 0) return

  await s3.deleteObjects({
    Bucket: AWS_S3_BUCKET_NAME,
    Delete: { Objects: data.Contents.map(({ Key }) => ({ Key })) },
  })
    .promise()
    .catch(err => {
      console.error('[X] Delete generated files error: ', err.message)
      throw err
    })
  console.log('[-] Deleted previously generated files.')
}

const uploadHandlers = fileKeys.map((Key, i, arr) => () => new Promise((resolve, reject) => {
  const filePath = path.join(ROOT_DIR, Key)
  const partNum = `${i + 1}/${arr.length}`

  const createUploadStream = () => {
    const shouldRemoveHTMLExtension = isHTML(Key) && !HTML_EXT_RETAIN_LIST.includes(Key)
    const ContentType = mime.lookup(Key) || undefined
    // Create a passthrough stream
    const writeStream = new Stream.PassThrough()
    // Call S3 to retrieve upload file to specified bucket
    s3.upload({
      Bucket: AWS_S3_BUCKET_NAME,
      // Remove .html extension
      Key: shouldRemoveHTMLExtension ? Key.replace(HTML_REGEXP, '') : Key,
      Body: writeStream,
      // ! Prevent S3 misinterprets it as 'application/octet-stream'
      ContentType,
      ContentEncoding: 'gzip',
    }, (err, data) => {
      if (err) {
        console.error(`[X] (${partNum}) S3 upload error: `, err.message)
        reject(err)
        return
      }
      // Done upload process
      console.log(`[-] (${partNum}) Upload Success (${ContentType}): `, data.Location)
      resolve()
    })
    return writeStream
  }

  // Create stream pipeline
  const pipeline = fs.createReadStream(filePath)
    .pipe(zlib.createGzip())
    .pipe(createUploadStream())

  pipeline.on('error', err => {
    console.error(`[X] (${partNum}) File stream error: `, err.message)
    reject(err)
  })
}))

const handleDone = () => {
  // Log done!
  console.log('Upload all files successfully!')
}

pipeAsync(
  // Remove generated files on S3
  removePrevGeneratedFiles,
  // Create filestream to read and upload each file
  ...uploadHandlers,
  // Last executor
  handleDone
)()