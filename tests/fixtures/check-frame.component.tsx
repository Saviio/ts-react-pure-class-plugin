import * as React from 'react'
import classnames from 'classnames'

type CheckProps = {
  readonly checked?: boolean
  readonly disabled?: boolean
  readonly onCheckClick?: () => void
}

export class CheckFrame extends React.PureComponent<CheckProps> {

  onToggleCheck = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (this.props.onCheckClick) {
      this.props.onCheckClick()
    }
  }

  renderCheckbox() {
    return (
      <div
        className='frame-check-box'
        onClick={ this.onToggleCheck }
      >
        <i className='check-mark icon icon-tick'/>
      </div>
    )
  }

  renderContent() {
    return this.props.children && (
      <div className='frame-content'>
        { this.props.children }
      </div>
    )
  }

  render() {
    const rootClassName = classnames('check-frame', {
      checked: !!this.props.checked,
      disabled: !!this.props.disabled
    })
    return (
      <div className={ rootClassName }>
        { this.renderContent() }
        { this.renderCheckbox() }
      </div>
    )
  }
}
