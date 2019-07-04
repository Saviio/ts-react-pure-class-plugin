import * as React from 'react'

export class A1 extends React.PureComponent {
  get property1() {
    return 1
  }

  render() {
    return <div>{ this.property1 }</div>
  }
}

export class A2 extends React.PureComponent {

  private v: number = 0
  set property1(v: number) {
    this.v = v
  }

  render() {
    return <div>{ this.property1 }</div>
  }
}
