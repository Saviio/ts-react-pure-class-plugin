# ts-react-pure-class-plugin

A TypeScript AST Transformer that transform class based stateless pure component to functional component.

## Example

from
```typescript
export default class extends React.PureComponent<{}> {

  render() {
    return <div />
  }

}
```

to
```javascript
import { memo as react_memo_1 } from "react";

function rewrited_pure_class_1(rewrited_props_2) {
    return React.createElement("div", null);
}

export default react_memo_1(rewrited_pure_class_1);
```

## How to use
```javascript
getCustomTransformers: () => ({
  before: [pureClsPlugin()],
})
```

## Notice
if you want to use this plugin, please make sure there're no components were described like following code, otherwise, the transformation will break your app.
```
class Foo extends React.PureComponent {

  render() {
    return <div />
  }

}

class Bar extends Foo {
  // bala bala
}
```
 In most situations, you can just mark Foo as abstract class to skip the optmization and solve the problem.


## Option
```typescript
pureClsPlugin(option?: Option)

interface Option {
  verbose?: boolean
  useMemo?: boolean
}
```

## Deopt
if transformer meets one of following conditions, optmization will be skipped.

- contain react component lifecycle
- contain state
- contain getter/setter
- contain decorator
- contain static property
- abstract class
- not a pure component
- a special comment directive

### Deopt directive
```typescript
/*@__DEOPT__*/
export class A1 extends React.PureComponent {
  render() {
    return <div>Foo</div>
  }
}
```

## Benifit
in my super naive tests, we can get about 25% ~ 30% performance improvement.

## License

Apache-2.0
