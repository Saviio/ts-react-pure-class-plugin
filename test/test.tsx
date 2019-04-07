import * as React from 'react'
// deopt
// contain lifecycle
// contain states
// contain static default
// contain get/set

// inner class
// instance method
// instance field

export class A extends React.PureComponent<{}> {

  private k: number

  constructor(props: any) {
    super(props)
    this.k = 2
  }

  onClick = () => {
    this.k = 2
    this['ks'] = 2
  }

  render() {
    const { abc } = this.props
    const k = this.k
    return <div data-abc={ abc } />
  }

}

export class A1 extends React.PureComponent<{v: string, x: number, onChange: any}> {

  private k: number = 5
  s = 100
  q = 'sss'

  constructor(props: any) {
    super(props)
    this.k = 2
    this.onClick = this.onClick.bind(this)
  }

  onClick = (z) => {
    this.k = 2
  }

  render() {
    const k = this.k
    const v = this.props.v
    const { x } = this.props
    const props = {} 
    return <div data-abc={ k } data-xyz={ v } onClick={ this.onClick } onChange={ this.props.onChange }/>
  }

}

export class C extends React.PureComponent<{}> {

  static getDerivedStateFromProps() {}

  componentDidCatch = () => {}
  componentWillUnmount() {}

  render() {
    return (
      <div>1</div>
    )
  }

}

export default class B extends React.PureComponent<{}> {

  render() {
    return <div />
  }

}