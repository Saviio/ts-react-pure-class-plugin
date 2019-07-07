import * as ts from 'typescript'
import {
  isPureCls, isReactFile, getClassModifier, isAbstractCls, isDeoptCls,
  createThisContextInitializer, containDeOptCase,
  createMemoImportDecl, createFunctionalComponent,
  createExportVariable, createDefaultExportAssigment, createParameterWithAnyType,
  createCtor, rewriteRenderFunction
} from './utils'
import { collectVariableUsage, VariableUse } from 'tsutils'

export interface Option {
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
    let rewrited = false

    const visitor: ts.Visitor = (node) => {
      // not a class
      if (!ts.isClassDeclaration(node) || !isPureCls(node) || isAbstractCls(node) || isDeoptCls(node)) {
        return node
      }

      if (containDeOptCase(node)) {
        return node
      }

      const classIdentifierText = node.name.getText()
      const modifiedIdentifier = ts.createUniqueName(`rewrited_pure_class_${classIdentifierText}`)
      rewrited = true

      if (opts.verbose) {
        /* istanbul ignore next */
        console.info(`
          [Pure-Class-Plugin]: Rewriting ${classIdentifierText}
        `)
      }

      const propsIdentifier = ts.createUniqueName('rewrited_props')
      const thisContext = ts.createUniqueName('ctx')
      const initializer = createThisContextInitializer(node, thisContext, propsIdentifier, transformContext)
      const ctor = createCtor(node, propsIdentifier, transformContext)
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
      const refUses: [ts.Identifier, VariableUse[], ts.Identifier][] = []

      classSymbols.forEach((value, key) => {
        const [ prevIdentifier, modifiers ] = value
        const uses = collectVariableUsage(source).get(prevIdentifier).uses
        refUses.push([prevIdentifier, uses, key])

        const exportNode = modifiers[1]
          ? createDefaultExportAssigment(key, opts.useMemo ? memoIdentifier : undefined)
          : createExportVariable(key, prevIdentifier, opts.useMemo ? memoIdentifier : undefined)

        if (modifiers[0]) {
          exportsDecls.push(exportNode)
        } else if (!modifiers[0]) {
          let index = -1
          transformedNodes.forEach((stmnt, i) => {
            if (ts.isFunctionDeclaration(stmnt) && stmnt.name === key) {
              index = i
            }
          })
          const aliasStmnt = ts.createVariableStatement(
            undefined,
            ts.createVariableDeclarationList(
              [
                ts.createVariableDeclaration(
                  prevIdentifier,
                  undefined,
                  key
                )
              ],
              ts.NodeFlags.Const
            )
          )

          transformedNodes.splice(index + 1, 0, aliasStmnt)
        }
      })

      const memoDecl = (opts.useMemo && rewrited) ? [memoImportDecl] : []

      const transformedSource = ts.updateSourceFileNode(
        source,
        ts.setTextRange(
          ts.createNodeArray([
            ...memoDecl,
            ...transformedNodes,
            ...exportsDecls
          ]),
          source.statements,
        ),
      )

      // const refsVisitor = (n: ts.Node) => {
      //   if (ts.isIdentifier(n)) {
      //     const usedIndex = refUses.findIndex((use) => {
      //       return use[1].some(c => c.location.escapedText === n.escapedText)
      //     })

      //     if (usedIndex > -1) {
      //       return ts.updateIdentifier(refUses[usedIndex][2])
      //     }
      //   }
      //   return ts.visitEachChild(n, refsVisitor, transformContext)
      // }

      return transformedSource
    })
  }

  return transform
}
