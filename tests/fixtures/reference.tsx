import React from 'react'

class Item extends React.PureComponent<any> {
  render() {
    const { isDisabled } = this.props

    return (
      <div onClick={ this.handleClick }>
        { isDisabled ? null : <div /> }
      </div>
    )
  }

  private handleClick = () => {
    this.props.onDivisionClick(this.props.item)
  }
}

export const SortableItem = SortableElement(Item)
