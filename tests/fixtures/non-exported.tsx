import * as React from 'react'

class A1 extends React.PureComponent<{ message: string }> {
  render() {
    return <div>{ this.props.message }</div>
  }
}

export { A1 }
