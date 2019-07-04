import * as React from 'react'

export class A1 extends React.PureComponent<any> {
  a: number = 0
  constructor() {
    super({})
    this.a = 1
  }

  render() {
    return <div>Foo</div>
  }
}
