import * as React from 'react'

export class A1 extends React.PureComponent {

  componentDidMount() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A2 extends React.PureComponent {

  componentDidCatch() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A3 extends React.PureComponent {

  componentDidUpdate() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A4 extends React.PureComponent {

  componentWillMount() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A5 extends React.PureComponent {

  componentWillUpdate() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A6 extends React.PureComponent {

  componentWillUnmount() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A7 extends React.PureComponent {

  componentWillReceiveProps() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A8 extends React.PureComponent {

  UNSAFE_componentWillMount() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A9 extends React.PureComponent {

  UNSAFE_componentWillReceiveProps() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A10 extends React.PureComponent {

  UNSAFE_componentWillUpdate() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}

export class A11 extends React.PureComponent {

  UNSAFE_componentWillUpdate() {
    console.info('A')
  }

  UNSAFE_componentWillReceiveProps() {
    console.info('A')
  }

  UNSAFE_componentWillMount() {
    console.info('A')
  }

  componentWillReceiveProps() {
    console.info('A')
  }

  componentWillUnmount() {
    console.info('A')
  }

  componentWillUpdate() {
    console.info('A')
  }

  componentWillMount() {
    console.info('A')
  }

  componentDidUpdate() {
    console.info('A')
  }

  componentDidCatch() {
    console.info('A')
  }

  componentDidMount() {
    console.info('A')
  }

  render() {
    return <div>Foo</div>
  }

}
