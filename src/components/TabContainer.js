import React, {Component} from 'react'
import PropTypes from 'prop-types'

class TabContainer extends Component {
  render = () => {
    const {children} = this.props

    return (
      <div style={{padding: 24}}>
        {children}
      </div>
    )
  }
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
}

export default TabContainer
