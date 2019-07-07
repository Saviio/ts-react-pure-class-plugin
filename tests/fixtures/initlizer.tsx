import * as React from 'react'

export class A1 extends React.PureComponent {
  private a: number = 1
  private b: string = '2'
  public c: boolean = true
  render() {
    return (
      <div>
        { this.a }
        { this.b }
        { this.c }
      </div>
    )
  }
}

export class A2 extends React.PureComponent {
  private a: number = 1
  private b: string = '2'
  public c: boolean = true
  render() {
    const a = this.a
    const b = this.b
    const c = this.c
    return (
      <div>
        { a }
        { b }
        { c }
      </div>
    )
  }
}

export class A3 extends React.PureComponent {
  private a: number = 1
  private b: string = '2'
  public c: boolean = true
  render() {
    // tslint:disable-next-line:prefer-const
    let x: number | undefined
    const { a, b, c } = this
    return (
      <div>
        { a }
        { b }
        { c }
        { x }
      </div>
    )
  }
}
