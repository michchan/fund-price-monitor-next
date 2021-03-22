/* eslint-disable no-console */
const fs = require('fs')
const camelCase = require('lodash/camelCase')
const upperFirst = require('lodash/upperFirst')

const PAGES_PATH = 'src/pages'
const LOCALE_DIRNAME = '[locale]'
const LOCALE_PAGES_PATH = `${PAGES_PATH}/${LOCALE_DIRNAME}`
const TEMPLATE_PATH = `${__dirname}/template.tsx`
const TEMPLATE_COMPONENT_NAME = 'NoLangFallbackPage'

const pascalCase = text => upperFirst(camelCase(text))

const isDir = name => !/(\.js|\.ts|\.tsx)$/.test(name)
const isDynamicDir = name => /^\[.+\]$/.test(name)

const generate = path => {
  // E.g. ['index.tsx', 'about.tsx']
  const pathnames = fs.readdirSync(path)
  /**
   * E.g.
   * [
   *   {
   *     filename: 'index.tsx'
   *     componentName: 'IndexNoLangFallbackPage'
   *   },
   *   {
   *     filename: 'about.tsx'
   *     componentName: 'AboutNoLangFallbackPage'
   *   }
   * ]
   */
  const pageFiles = pathnames
    .filter(pathname => {
      if (isDir(pathname)) {
        const fullPath = `${path}/${pathname}`
        console.log({ fullPath, pathname, dy: isDynamicDir(pathname) })
        const file = require(`${process.cwd()}/${fullPath}/index.tsx`)
        console.log({file})

        // generate(`${path}/${pathname}`)
        return false
      }
      return true
    })
    .map(filename => {
      const pascalCaseName = pascalCase(filename.split('.').shift())
      return {
        filename,
        componentName: `${pascalCaseName}${TEMPLATE_COMPONENT_NAME}`,
      }
    })

  const template = fs.readFileSync(TEMPLATE_PATH).toString()

  pageFiles.forEach(({ filename, componentName }) => {
    const content = template.replace(new RegExp(TEMPLATE_COMPONENT_NAME, 'g'), componentName)

    const writePath = `${path}/${filename}`
      .replace(LOCALE_DIRNAME, '')
      .replace(/\/+/g, '/')
    const writePathRelative = writePath.replace(PAGES_PATH, '').replace(/^\//, '')
    const writeDirPath = `${PAGES_PATH}/${writePathRelative
      .split('/')
      .slice(0, -1)
      .join('/')}`
      .replace(/\/$/, '')

    if (writeDirPath !== PAGES_PATH && !fs.existsSync(writeDirPath))
      fs.mkdirSync(writeDirPath, { recursive: true })

    fs.writeFileSync(writePath, content)
  })
}

generate(LOCALE_PAGES_PATH)