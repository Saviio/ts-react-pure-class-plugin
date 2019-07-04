import * as React from 'react'

export class A1 extends React.PureComponent<any> {
  a: number = 0
  b: string = '1'
  c: boolean = false
  obj: object = {}
  fn: (e: any) => void = (e: any) => void 0
  z: string = 'x'
  y: number = 0
  x: boolean = false

  constructor(props: any) {
    super(props)
    this.a = props.a
    this.b = 'bar-foo'
    this.c = true
    this.obj = { a: this.c }
    this.fn = this.fn.bind(this)
    this.z = props['z']
    this.y = this.props.y
    this.x = this.props['x']
  }

  output = () => {
    const a = this.props.a
    const b = this.props.b
    const c = this.props['c']
    const { d } = this['props']
    console.info(a, b, c)
  }

  read = () => {
    const { a, b, c } = this
    return [a, b, c]
  }

  render() {
    return (
      <>
        <div>
          <span>{ this.a }</span>
          <div>{ this.c || false }</div>
          <div onClick={ this.output }>{ this.obj.toString() }</div>
          <div onClick={ this.fn }>Foo</div>
        </div>
      </>
    )
  }
}
