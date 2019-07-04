import * as React from 'react'

export class A1 extends React.PureComponent {
  a() {
    console.info('A')
  }

  render() {
    return <div onClick={ this.a }>Foo</div>
  }
}

export class A2 extends React.PureComponent {
  a() {
    console.info(this.a)
  }

  render() {
    return <div onClick={ this.a }>Foo</div>
  }
}

export class A3 extends React.PureComponent<any> {
  a() {
    console.info(this.props.a)
  }

  render() {
    return <div onClick={ this.a }>Foo</div>
  }
}

export class A4 extends React.PureComponent<any> {
  private b: number | null = null
  a() {
    this.b = this.props.a
  }

  render() {
    return <div onClick={ this.a }>Foo</div>
  }
}
