/* eslint-disable no-console */
const fs = require('fs')

const PAGES_PATH = 'src/pages'
const LOCALE_DIRNAME = '[locale]'
const LOCALE_PAGES_PATH = `${PAGES_PATH}/${LOCALE_DIRNAME}`

const isDir = name => !/(\.js|\.ts|\.tsx)$/.test(name)

const remove = path => {
  // E.g. ['index.tsx', 'about.tsx']
  const pathnames = fs.readdirSync(path)

  pathnames.forEach(pathname => {
    const unlinkPath = `${path.replace(LOCALE_DIRNAME, '')}/${pathname}`.replace(/\/+/g, '/')

    if (isDir(pathname)) {
      remove(`${path}/${pathname}`)
      return
    }
    fs.unlinkSync(unlinkPath)
  })
}

remove(LOCALE_PAGES_PATH)