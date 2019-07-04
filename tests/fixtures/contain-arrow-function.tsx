import * as React from 'react'

export class A1 extends React.PureComponent {
  a = () => {
    console.info('A')
  }
  render() {
    return <div onClick={ this.a }>Foo</div>
  }
}

export class A2 extends React.PureComponent {
  a = () => {
    console.info(this.a)
  }
  render() {
    return <div onClick={ this.a }>Foo</div>
  }
}
