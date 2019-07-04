import * as React from 'react'

interface ReadWorldProps {
  message: 'hello! Wuha!'
  color: 'orange'
  ftSize: 12
}

export class RealWorld extends React.PureComponent<ReadWorldProps> {
  private fontSize: number = 0
  private style: React.CSSProperties = {}

  constructor(props: ReadWorldProps) {
    super(props)
    this.fontSize = props.ftSize + 2
    this.style = {
      backgroundColor: props.color,
      fontSize: this.fontSize
    }
  }

  say = () => {
    alert(this.props.message)
  }

  render() {
    return (
      <>
        <div onClick={ this.say } style={ this.style }>
          Welcome to reald world
        </div>
      </>
    )
  }
}
