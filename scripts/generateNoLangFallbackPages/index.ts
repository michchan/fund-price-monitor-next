/* eslint-disable no-console */
import * as fs from 'fs'
import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'

import getDynamicPaths from '../../src/config/getDynamicPaths'

const PAGES_PATH = 'src/pages'
const LOCALE_DIRNAME = '[locale]'
const LOCALE_PAGES_PATH = `${PAGES_PATH}/${LOCALE_DIRNAME}`
const TEMPLATE_PATH = `${__dirname}/template.tsx`
const TEMPLATE_COMPONENT_NAME = 'NoLangFallbackPage'

const CACHE_FILE = '.script_cache'
const CACHE_FILENAME = 'noLangFallbackWritePaths.json'

const pascalCase = (text: string) => upperFirst(camelCase(text))
const isDir = (name: string) => !/(\.js|\.ts|\.tsx)$/.test(name)
const hasDynamicPathSegments = (pathname: string) => /\[.+\]/.test(pathname)

const removeLocaleSegment = (pathname: string) => pathname
  .replace(LOCALE_DIRNAME, '')
  .replace(/\/+/g, '/')

const removePagesSegments = (pathname: string) => pathname
  .replace(PAGES_PATH, '')
  .replace(/\/+/g, '/')

const writePaths: string[] = []

const generate = async (path: string) => {
  const dynamicPaths = await getDynamicPaths()

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
        generate(`${path}/${pathname}`)
        return false
      }
      return true
    })
    .map(filename => {
      const pascalCaseName = pascalCase(filename.split('.').shift() || '')
      return {
        filename,
        componentName: /^\d/.test(pascalCaseName)
          // Handle component name cannot be started with number
          ? `${TEMPLATE_COMPONENT_NAME}${pascalCaseName}`
          : `${pascalCaseName}${TEMPLATE_COMPONENT_NAME}`,
      }
    })

  const template = fs.readFileSync(TEMPLATE_PATH).toString()

  pageFiles.forEach(({ filename, componentName }) => {
    const content = template.replace(new RegExp(TEMPLATE_COMPONENT_NAME, 'g'), componentName)

    const writeFile = (_path: string) => {
      const writePath = removeLocaleSegment(_path)
      const writePathRelative = writePath.replace(PAGES_PATH, '').replace(/^\//, '')
      const writeDirPath = `${PAGES_PATH}/${writePathRelative
        .split('/')
        .slice(0, -1)
        .join('/')}`
        .replace(/\/$/, '')

      if (writeDirPath !== PAGES_PATH && !fs.existsSync(writeDirPath))
        fs.mkdirSync(writeDirPath, { recursive: true })

      console.log('Generating TEMP file: ', writePath)
      fs.writeFileSync(writePath, content)
      writePaths.push(writePath)
    }

    const fullPath = `${path}/${filename}`
    if (hasDynamicPathSegments(removeLocaleSegment(fullPath))) {
      const relativePath = removePagesSegments(removeLocaleSegment(fullPath))
        .split('.')
        .shift()
        ?.replace(/^\//, '')

      dynamicPaths
        .reduce((acc, { path, variants }) => {
          if (relativePath === path.replace(/^\//, '')) {
            const paths = variants.map(variantPath => fullPath.replace(path, variantPath))
            return [...acc, ...paths]
          }
          return acc
        }, [] as string[])
        .forEach(path => writeFile(path))
      return
    }
    writeFile(fullPath)
  })
}

generate(LOCALE_PAGES_PATH)

// Cache writePaths
if (!fs.existsSync(CACHE_FILE))
  fs.mkdirSync(CACHE_FILE)

fs.writeFileSync(`${CACHE_FILE}/${CACHE_FILENAME}`, JSON.stringify({ writePaths }))