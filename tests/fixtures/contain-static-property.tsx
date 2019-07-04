import * as React from 'react'

export class A1 extends React.PureComponent {
  static Property = 1
  render() {
    return <div>{ A1.Property }</div>
  }
}
