import * as React from 'react'

export class A1 extends React.PureComponent {
  private a: number

  constructor(props: any) {
    super(props)
    this.a = props.a
  }

  render() {
    return <div>Foo</div>
  }
}

export class A2 extends React.PureComponent {
  private a: number

  constructor(props: any) {
    super(props)
    this.a = 2
  }

  render() {
    return <div>Foo</div>
  }
}
