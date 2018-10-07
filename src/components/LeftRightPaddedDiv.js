import React, {Component} from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'

const styles = theme => ({
  root: {
    padding: `0 24px 0`,
  },
})

class LeftRightPaddedDiv extends Component {
  render = () => {
    const {
      children,
      classes,
    } = this.props

    return (
      <div className={classes.root}>
        {children}
      </div>
    )
  }
}

LeftRightPaddedDiv.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

export default withStyles(styles)(LeftRightPaddedDiv)
