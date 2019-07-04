import * as React from 'react'

function Foo(c: any) {
  return c
}

@Foo
export class A1 extends React.PureComponent<{ message: string }> {
  render() {
    return <div>{ this.props.message }</div>
  }
}
