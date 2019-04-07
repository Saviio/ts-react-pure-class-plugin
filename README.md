# ts-react-pure-class-plugin

A TypeScript AST Transformer that transform class based stateless pure component to functional component.

(still in development)

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

## Option
```typescript
pureClsPlugin(option?: Option)

interface Option {
  verbose?: boolean
  useMemo?: boolean
}
```

## Deopt
TBD

## Benifit
in my super naive tests, we can get about 25% ~ 30% performance improvement.

## License

Apache-2.0
