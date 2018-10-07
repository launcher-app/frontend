import React, {Component} from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'

const styles = theme => ({
  root: {
    width: `100%`,
    overflowX: `auto`,
  },
})

class TableWrapper extends Component {
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

TableWrapper.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

export default withStyles(styles)(TableWrapper)
