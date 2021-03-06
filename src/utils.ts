import * as ts from 'typescript'

const reactRE = /['"]react['"]/
const pureClsRE = /PureComponent/
const superRE = /super/
const deoptRE = /\/\*@__DEOPT__\*\//

export const isReactFile = (source: ts.SourceFile) => {
  return source.statements.findIndex((n) => isReactImport(n, source)) > -1
}

export const isReactImport = (node: ts.Node, source: ts.SourceFile) => {
  return ts.isImportDeclaration(node) &&
    reactRE.test(node.moduleSpecifier.getText(source))
}

export const isAbstractCls = (node: ts.ClassDeclaration) => {
  return node.modifiers && node.modifiers.findIndex(mod => mod.kind === ts.SyntaxKind.AbstractKeyword) > -1
}

export const isPureCls = (node: ts.ClassDeclaration) => {
  const clauses = node.heritageClauses
  return clauses && clauses.findIndex(c => pureClsRE.test(c.getText())) > -1
}

export const isDeoptCls = (node: ts.ClassDeclaration) => {
  return deoptRE.test(node.getFullText())
}

export const getClassModifier = (node: ts.ClassDeclaration): [boolean, boolean] => {
  if (!node.modifiers) {
    return [false, false]
  }

  const count = node.modifiers.length

  switch (count) {
    case 1: return [true, false]
    case 2: return [true, true]
    /* istanbul ignore next */
    default:
      return [false, false]
  }
}

export const containDeOptCase = (classDecl: ts.ClassDeclaration) => {
  if (containLifeCycleDecl(classDecl)) {
    return true
  }

  if (containDecorator(classDecl)) {
    return true
  }

  const [ extendsClause ] = classDecl.heritageClauses
  if (containStates(extendsClause)) {
    return true
  }

  let deopt: boolean = false
  const classVisitor: ts.Visitor = (node) => {
    // handle case: get/set
    if (ts.isGetAccessor(node) || ts.isSetAccessor(node)) {
      deopt = deopt || true
      return node
    }

    // handle case: static Property
    if (ts.isPropertyDeclaration(node) && node.modifiers) {
      const index = node.modifiers.findIndex(n => n.kind === ts.SyntaxKind.StaticKeyword)
      if (index > -1) {
        deopt = deopt || true
        return node
      }
    }

    // if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) && node.left.expression.kind === ts.SyntaxKind.ThisKeyword) {
    //   console.info(node.getText())
    //   deopt = deopt || true
    //   return node
    // }

    // handle case: this['foo']
    //              this[x]
    // if (ts.isElementAccessExpression(node) && node.argumentExpression) {
    //   deopt = deopt || true
    //   return node
    // }

    return node.forEachChild(classVisitor)
  }

  classVisitor(classDecl)

  classDecl.members.forEach((member) => {
    if (!ts.isConstructorDeclaration(member)) {
      const visitor: ts.Visitor = (propertyDecl) => {
        if (ts.isBinaryExpression(propertyDecl) &&
          ts.isPropertyAccessExpression(propertyDecl.left) &&
          propertyDecl.left.expression.kind === ts.SyntaxKind.ThisKeyword &&
          propertyDecl.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ) {
          deopt = deopt || true
          return propertyDecl
        }

        return propertyDecl.forEachChild(visitor)
      }

      visitor(member)
    }
  })

  return deopt
}

export const containDecorator = (node: ts.ClassDeclaration) => {
  const decos = node.decorators
  if (!decos) {
    return false
  }

  return node.decorators.length > 0
}

export const containStates = (node: ts.HeritageClause) => {
  // class Foo extends PureComponent<Props, States> : false
  // class Foo extends PureComponent<Props>: true

  let ret: boolean = false

  node.forEachChild((n) => {
    if (ts.isExpressionWithTypeArguments(n)) {
      const syntax = n.getChildAt(2)
      ret = ret || (syntax && syntax.getChildCount() > 1)
    }
  })

  return ret
}

export const KNOWN_LIFECYCLE = new Set([
  // static apis
  'getDerivedStateFromProps',
  'getSnapshotBeforeUpdate',

  // instance apis
  'shouldComponentUpdate',
  'componentDidMount',
  'componentDidUpdate',
  'componentDidCatch',
  'componentWillReceiveProps',
  'componentWillMount',
  'componentWillUpdate',
  'componentWillUnmount',

  // unsafe apis after 16.3
  'UNSAFE_componentWillMount',
  'UNSAFE_componentWillReceiveProps',
  'UNSAFE_componentWillUpdate',
])

export const containLifeCycleDecl = (node: ts.ClassDeclaration) => {
  // consider: PropertyDeclaration | MethodDeclaration
  let ret: boolean = false

  node.forEachChild((n) => {
    if (ts.isPropertyDeclaration(n) || ts.isMethodDeclaration(n)) {
      const decl = n.name.getText()
      ret = ret || KNOWN_LIFECYCLE.has(decl)
    }
  })

  return ret
}

export const createFunctionalComponent = (
  identifier: ts.Identifier,
  parameters: ts.ParameterDeclaration[] = [],
  statements: ts.Statement[] = [],
  render: ts.Statement[] = [],
  thisContext: ts.Identifier,
  ctxProperties: ts.ObjectLiteralElementLike[][] = []
) => {
  const stmnts = createInitlizer(statements, thisContext, ctxProperties)

  return ts.createFunctionDeclaration(
    undefined,
    undefined,
    undefined,
    identifier,
    undefined,
    parameters,
    undefined,
    ts.createBlock([
      ...stmnts,
      ...render
    ], true)
  )
}

export const createInitlizer = (
  statements: ts.Statement[] = [],
  ctx: ts.Identifier,
  properties: ts.ObjectLiteralElementLike[][]
) => {
  const baseInitlizer = ts.createObjectLiteral(properties[0], false)
  const variableDeclStmnt = ts.createVariableStatement(
    undefined,
    ts.createVariableDeclarationList(
      [
        ts.createVariableDeclaration(
          ctx,
          undefined,
          baseInitlizer
        )
      ],
      ts.NodeFlags.Let
    )
  )

  const objectAssignStmnt = properties[1].length && ts.createExpressionStatement(
    ts.createCall(
      ts.createPropertyAccess(
        ts.createIdentifier('Object'),
        ts.createIdentifier('assign')
      ),
      undefined,
      [
        ctx,
        ts.createObjectLiteral(properties[1], false)
      ]
    )
  )

  if (statements.length === 0) {
    if (objectAssignStmnt) {
      return [variableDeclStmnt, objectAssignStmnt]
    }
    return [variableDeclStmnt]
  }

  const ctor = ts.createUniqueName('ctor')

  const functionDeclStmnt = ts.createFunctionDeclaration(
    undefined,
    undefined,
    undefined,
    ctor,
    undefined,
    [],
    undefined,
    ts.createBlock(
      [...statements],
      true
    )
  )

  const expressionStmnt = ts.createExpressionStatement(
    ts.createCall(
      ts.createPropertyAccess(
        ctor,
        ts.createIdentifier('call')
      ),
      undefined,
      [ctx]
    )
  )

  if (objectAssignStmnt) {
    return [variableDeclStmnt, objectAssignStmnt, functionDeclStmnt, expressionStmnt]
  }
  return [variableDeclStmnt, functionDeclStmnt, expressionStmnt]
}

export const createMemoImportDecl = (): [ts.ImportDeclaration, ts.Identifier] => {
  const memoIdentifier = ts.createUniqueName('react_memo')
  return [
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(
            ts.createIdentifier('memo'),
            memoIdentifier
          )
        ])
      ),
      ts.createStringLiteral('react')
    ),
    memoIdentifier
  ]
}

export const createDefaultExportAssigment = (
  identifier: ts.Identifier,
  memo: ts.Identifier | undefined
) => {
  if (memo) {
    return ts.createExportAssignment(
      undefined,
      undefined,
      undefined,
      ts.createCall(memo, undefined, [
        identifier
      ])
    )
  }

  return ts.createExportAssignment(
    undefined,
    undefined,
    undefined,
    identifier
  )
}

export const createExportVariable = (
  identifier: ts.Identifier,
  prevIdentifier: ts.Identifier,
  memo: ts.Identifier | undefined
) => {
  if (memo) {
    return ts.createVariableStatement(
      [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.createVariableDeclarationList(
        [
          ts.createVariableDeclaration(
            prevIdentifier,
            undefined,
            ts.createCall(memo, undefined, [
              identifier
            ])
          )
        ],
        ts.NodeFlags.Const
      )
    )
  }

  return ts.createVariableStatement(
    [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.createVariableDeclarationList(
      [
        ts.createVariableDeclaration(
          prevIdentifier,
          undefined,
          identifier
        )
      ],
      ts.NodeFlags.Const
    )
  )
}

export const findFunctionBody = (node: ts.ConciseBody) => {
  if (!ts.isBlock(node)) {
    const localIdf = ts.createUniqueName('ret')
    const block = [
      ts.createVariableStatement(
        undefined,
        ts.createVariableDeclarationList(
          [
            ts.createVariableDeclaration(
              localIdf,
              undefined,
              node
            )
          ],
          ts.NodeFlags.Const
        )
      ),
      ts.createReturn(localIdf)
    ]
    return ts.createBlock(block).statements
  }
  return node.statements
}

export const createThisContextInitializer = (
  node: ts.ClassDeclaration,
  thisContext: ts.Identifier,
  propsIdentifier: ts.Identifier,
  transformContext: ts.TransformationContext,
) => {
  const nonFns: ts.PropertyAssignment[] = [
    ts.createPropertyAssignment(
      ts.createIdentifier('props'),
      propsIdentifier
    )
  ]

  const fns: ts.PropertyAssignment[] = []

  node.forEachChild((n) => {
    if (ts.isPropertyDeclaration(n)) {
      if (n.initializer) {
        if (ts.isArrowFunction(n.initializer)) {
          const isAsync = isAsyncFunction(n.initializer)
          const modifiers = isAsync
            ? [ts.createModifier(ts.SyntaxKind.AsyncKeyword)]
            : undefined

          const assignment = ts.createPropertyAssignment(
            n.name,
            createCall(
              n.name as ts.Identifier,
              n.initializer.parameters,
              ts.createNodeArray(
                findFunctionBody((n.initializer.body as ts.FunctionBody)).map((stmnt) =>
                  ts.visitNode(stmnt, propertyVistor(stmnt, propsIdentifier, thisContext, transformContext)))
              ),
              thisContext,
              modifiers
            )
          )
          fns.push(assignment)
        } else {
          const assignment = ts.createPropertyAssignment(
            n.name,
            n.initializer
          )
          nonFns.push(assignment)
        }
      }
    } else if (ts.isMethodDeclaration(n) && n.name.getText() !== 'render') {
      const isAsync = isAsyncFunction(n)
      const isGenerator = isGeneratorMethod(n)

      const assignment = ts.createPropertyAssignment(
        n.name as ts.Identifier,
        ts.createFunctionExpression(
          isAsync ? [ts.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
          isGenerator ? ts.createToken(ts.SyntaxKind.AsteriskToken) : undefined,
          n.name as ts.Identifier,
          undefined,
          n.parameters,
          undefined,
          ts.createBlock(n.body.statements.map((stmnt) =>
            ts.visitNode(stmnt, propertyVistor(stmnt, propsIdentifier, thisContext, transformContext)))
          , true)
        )
      )

      fns.push(assignment)
    }
  })

  return [nonFns, fns]
}

export const createCtor = (
  classDecl: ts.ClassDeclaration,
  propsIdentifier: ts.Identifier,
  transformContext: ts.TransformationContext
) => {
  const stmnts: ts.Statement[] = []
  classDecl.forEachChild(function visitor (node) {

    if (ts.isConstructorDeclaration(node)) {
      const hasPropsParameter = node.parameters.length > 0
      const ctorPropsIdentifier = hasPropsParameter && node.parameters[0].name.getText()

      stmnts.push(
        ...node.body.statements.filter((stmnt) => !superRE.test(stmnt.getText())).map((stmnt) => {
          if (!hasPropsParameter) {
            return stmnt
          }
          return ts.visitEachChild(stmnt, function ctorRewriter(n: ts.Node) {

            // handle case: this.a = props.a
            if (ts.isPropertyAccessExpression(n)) {
              if (n.expression.getText() === ctorPropsIdentifier) {
                return ts.updatePropertyAccess(n, propsIdentifier, n.name)
              }
            }

            // handle case: this.a = props['a']
            if (ts.isElementAccessExpression(n)) {
              if (n.expression.getText() === ctorPropsIdentifier) {
                return ts.updateElementAccess(n, propsIdentifier, n.argumentExpression)
              }
            }

            return ts.visitEachChild(n, ctorRewriter, transformContext)
          }, transformContext)
        })
      )
    }

    return node.forEachChild(visitor)
  })

  return stmnts
}

const propertyVistor = (
  target: ts.Node,
  propsIdentifier: ts.Identifier,
  thisContext: ts.Identifier,
  transformContext: ts.TransformationContext,
) => {
  const renderVistor: ts.Visitor = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node)) {
      // handle case: const { a, b, c } = this
      if (node.initializer && node.initializer.kind === ts.SyntaxKind.ThisKeyword) {
        return ts.updateVariableDeclaration(node, node.name, node.type, thisContext)
      }
    }

    if (ts.isPropertyAccessExpression(node)) {
      // handle case: const a = this.a
      if (node.expression.kind === ts.SyntaxKind.ThisKeyword && node.name.getText() !== 'props') {
        return ts.updatePropertyAccess(node, thisContext, node.name)
      }

      // handle case: const b = this.props.b
      if (ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.getText() === 'props' &&
        node.expression.expression &&
        node.expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
        (node.expression.expression as ts.Identifier).getText() === 'this'
      ) {
        return ts.createPropertyAccess(propsIdentifier, node.name)
      }

      // handle case: const { c } = this.props
      if (node.expression.kind === ts.SyntaxKind.ThisKeyword && node.name.getText() === 'props') {
        return propsIdentifier
      }
    }

    return ts.visitEachChild(node, renderVistor, transformContext)
  }

  return () => ts.visitEachChild(target, renderVistor, transformContext)
}

export const rewriteRenderFunction = (
  classDecl: ts.ClassDeclaration,
  thisContext: ts.Identifier,
  transformContext: ts.TransformationContext,
  propsIdentifier: ts.Identifier
) => {
  const stmnts: ts.Statement[] = []

  // const renderVistor: ts.Visitor = (node) => {
  //   if (ts.isPropertyAccessExpression(node)) {
  //     // handle case: const a = this.a
  //     if (node.expression.kind === ts.SyntaxKind.ThisKeyword && node.name.getText() !== 'props') {
  //       return ts.updatePropertyAccess(node, thisContext, node.name)
  //     }

  //     // handle case: const b = this.props.b
  //     if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.getText() === 'props') {
  //       return ts.createPropertyAccess(propsIdentifier, node.name)
  //     }

  //     // handle case: const {  c } = this.props
  //     if (node.expression.kind === ts.SyntaxKind.ThisKeyword && node.name.getText() === 'props') {
  //       return propsIdentifier
  //     }
  //   }
  //   return ts.visitEachChild(node, renderVistor, transformContext)
  // }

  classDecl.forEachChild((n) => {
    if (ts.isMethodDeclaration(n) && n.name.getText() === 'render') {
      stmnts.push(...n.body.statements.map(stmnt => {
        return ts.visitNode(stmnt, propertyVistor(stmnt, propsIdentifier, thisContext, transformContext))
      }))
    }
  })

  return stmnts
}

export const createParameterWithAnyType = (identifier: ts.Identifier) => {
  return ts.createParameter(
    undefined,
    undefined,
    undefined,
    identifier,
    undefined,
    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
    undefined
  )
}

export const createCall = (
  identifier: ts.Identifier,
  parameters: ts.NodeArray<ts.ParameterDeclaration>,
  stmnts: ts.NodeArray<ts.Statement>,
  thisContext: ts.Identifier,
  modifiers?: ts.Modifier[]
) => {
  return ts.createCall(
    ts.createPropertyAccess(
      ts.createParen(
        ts.createFunctionExpression(
          modifiers,
          undefined,
          identifier,
          undefined,
          parameters,
          undefined,
          ts.createBlock(stmnts, true)
        )
      ),
      ts.createIdentifier('bind')
    ),
    undefined,
    [thisContext]
  )
}

export const isAsyncFunction = (node: ts.MethodDeclaration | ts.ArrowFunction) => {
  if (!node.modifiers) {
    return false
  }
  return node.modifiers.some(m => m.kind === ts.SyntaxKind.AsyncKeyword)
}

export const isGeneratorMethod = (node: ts.MethodDeclaration) => {
  if (!node.asteriskToken) {
    return false
  }
  return node.asteriskToken.kind === ts.SyntaxKind.AsteriskToken
}
