import * as ts from 'typescript'
import {
  isPureCls, isReactFile, getClassModifier, isAbstractCls,
  createThisContextInitializer, containDeOptCase,
  createMemoImportDecl, createFunctionalComponent,
  createExportVariable, createDefaultExportAssigment, createParameterWithAnyType,
  createCtor, rewriteRenderFunction
} from './utils'

interface Option {
  verbose?: boolean
  useMemo?: boolean
}

const defaultOpts: Option = {
  verbose: false,
  useMemo: true
}

export default function createTransformer(userOpts: Option = {}) {
  const opts = Object.assign({}, defaultOpts, userOpts)

  const transform: ts.TransformerFactory<ts.SourceFile> = (transformContext) => {
    const classSymbols: Map<ts.Identifier, [ts.Identifier, [boolean, boolean]]> = new Map()

    const visitor: ts.Visitor = (node) => {

      // not a class
      if (!ts.isClassDeclaration(node) || !isPureCls(node) || isAbstractCls(node)) {
        return node
      }

      if (containDeOptCase(node)) {
        return node
      }

      const classIdentifierText = node.name.getText()
      const modifiedIdentifier = ts.createUniqueName(`rewrited_pure_class_${classIdentifierText}`)

      if (opts.verbose) {
        console.info(`
          [Pure-Class-Plugin]: Rewriting ${classIdentifierText}
        `)
      }

      const thisContext = ts.createUniqueName('ctx')
      const initializer = createThisContextInitializer(node)
      const ctor = createCtor(node)
      const propsIdentifier = ts.createUniqueName('rewrited_props')
      const parameter = createParameterWithAnyType(propsIdentifier)
      const renderFunction = rewriteRenderFunction(node, thisContext, transformContext, parameter.name as ts.Identifier)

      classSymbols.set(modifiedIdentifier, [node.name, getClassModifier(node)])
      const rewritedNode = createFunctionalComponent(
        modifiedIdentifier,
        [parameter],
        ctor,
        renderFunction,
        thisContext,
        initializer
      )

      return rewritedNode
    }

    return (node) => ts.visitNode(node, (source: ts.SourceFile) => {
      if (!isReactFile(source)) {
        return source
      }

      const transformedNodes = source.statements.map(n => ts.visitNode(n, visitor))
      const [ memoImportDecl, memoIdentifier ] = createMemoImportDecl()
      const exportsDecls: (ts.ExportAssignment | ts.VariableStatement)[] = []

      classSymbols.forEach((value, key) => {
        const [ prevIdentifier, modifiers ] = value

        const exportNode = modifiers[1]
          ? createDefaultExportAssigment(key, opts.useMemo ? memoIdentifier : undefined)
          : createExportVariable(key, prevIdentifier, opts.useMemo ? memoIdentifier : undefined)

        exportsDecls.push(exportNode)
      })

      return ts.updateSourceFileNode(
        source,
        ts.setTextRange(
          ts.createNodeArray([
            ...(opts.useMemo ? [memoImportDecl] : []),
            ...transformedNodes,
            ...exportsDecls
          ]),
          source.statements,
        ),
      )
    })
  }

  return transform
}
