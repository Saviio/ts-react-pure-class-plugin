import * as React from 'react'
import * as fs from 'fs'

export class A1 extends React.PureComponent<{ message: string }> {

  async output() {
    const a = await fs.readFileSync('foo')
    console.info(a)
  }

  output2 = async () => {
    const a = await fs.readFileSync('foo')
    console.info(a)
  }

  *output3() {
    const a = yield 1
    console.info(a)
  }

  render() {
    return (
      <div>
        { this.props.message }
        <div onClick={ this.output }>output1</div>
        <div onClick={ this.output2 }>output2</div>
        <div onClick={ this.output3 }>output3</div>
      </div>
    )
  }
}
