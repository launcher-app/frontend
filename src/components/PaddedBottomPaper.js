import React, {Component} from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import Paper from '@material-ui/core/Paper'

const styles = theme => ({
  root: {
    paddingBottom: 24,
  },
})

class PaddedBottomPaper extends Component {
  render = () => {
    const {
      children,
      classes,
    } = this.props

    return (
      <Paper className={classes.root}>
        {children}
      </Paper>
    )
  }
}

PaddedBottomPaper.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

export default withStyles(styles)(PaddedBottomPaper)
