/* eslint-disable no-console */
const fs = require('fs')

const CACHE_PATHNAME = '.script_cache/noLangFallbackWritePaths.json'

function cleanEmptyFoldersRecursively (folder) {
  const fs = require('fs')
  const path = require('path')

  const isDir = fs.statSync(folder).isDirectory()
  if (!isDir)
    return

  let files = fs.readdirSync(folder)
  if (files.length > 0) {
    files.forEach(file => {
      const fullPath = path.join(folder, file)
      cleanEmptyFoldersRecursively(fullPath)
    })

    // Re-evaluate files; after deleting subfolder
    // We may have parent folder empty now
    files = fs.readdirSync(folder)
  }

  if (files.length === 0) {
    console.log('Removing empty folder: ', folder)
    fs.rmdirSync(folder)
  }
}

const { writePaths } = require(`${process.cwd()}/${CACHE_PATHNAME}`)
writePaths.forEach(path => {
  console.log('Removing: ', path)
  fs.rmSync(path, { recursive: true })
})

cleanEmptyFoldersRecursively('src')