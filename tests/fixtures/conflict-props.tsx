import * as React from 'react'

export class A1 extends React.PureComponent<{ message: string }> {
  render() {
    const props = {}
    return <div>{ this.props.message }</div>
  }
}
