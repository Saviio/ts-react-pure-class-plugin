import * as React from 'react'

export class A1 extends React.PureComponent<any> {
  render() {
    const { a, b, c } = this.props
    return (
      <div>
        { a }
        { b }
        { c }
      </div>
    )
  }
}
