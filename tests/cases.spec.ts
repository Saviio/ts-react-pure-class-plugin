import * as ts from 'typescript'
import * as fs from 'fs'
import { join } from 'path'
import { addSerializer } from 'jest-specific-snapshot'

import { transformer, Option } from '../src'

const printer = ts.createPrinter()
const baseDir = join(process.cwd(), 'tests', 'fixtures')
const fixtures = fs.readdirSync(baseDir)

const { config } = ts.parseConfigFileTextToJson(
  'tsconfig.json',
  fs.readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf-8'),
)

const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(
  config.compilerOptions,
  process.cwd(),
  'tsconfig.json',
)

addSerializer({
  test: (obj: any) => obj && obj.type === 'transform-baseline',
  print: (
    obj: any,
    _print: (object: any) => string,
    indent: (str: string) => string,
  ) =>
    `
File: ${obj.filename}
TypeScript before transform:

${indent(obj.content)}

      ↓ ↓ ↓ ↓ ↓ ↓

TypeScript after transform:

${indent(obj.transformed).replace(/    /g, '  ')}
`,
})

const __ONLY_FILES__: string[] = []
const __SKIP_FILES__: string[] = []

fixtures
  .filter((file) => file.endsWith('.tsx') || file.endsWith('.ts'))
  .filter(
    (file) =>
      !__ONLY_FILES__.length ||
      __ONLY_FILES__.some((only) => file.startsWith(only)),
  )
  .filter(
    (file) =>
      !__ONLY_FILES__.length ||
      __SKIP_FILES__.every((skip) => !file.startsWith(skip)),
  )
  .forEach((filename) => {
    const sourceCode = fs.readFileSync(join(baseDir, filename), 'utf-8')

    function transform(options: Option = { useMemo: false }) {
      const emotion = transformer(options)
      const sourceFile = ts.createSourceFile(
        join(baseDir, filename),
        sourceCode,
        ts.ScriptTarget.ESNext,
        true,
      )
      const [transformed] = ts.transform(
        sourceFile,
        [emotion],
        compilerOptions,
      ).transformed
      return {
        transformed: printer.printFile(transformed),
        source: printer.printFile(sourceFile),
        filename,
        type: 'transform-baseline',
        content: sourceCode,
      }
    }

    const pathToSnap = join(
      process.cwd(),
      'tests',
      '__snapshots__',
      `${filename}.shot`,
    )

    it(`should transform ${filename} without memo`, () => {
      const result = transform()
      expect(result).toMatchSpecificSnapshot(pathToSnap)
    })

    it(`should transform ${filename} with memo`, () => {
      const result = transform({ useMemo: true })
      expect(result).toMatchSpecificSnapshot(pathToSnap)
    })

  })
