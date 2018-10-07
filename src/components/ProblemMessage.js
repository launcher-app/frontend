import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'

const styles = theme => ({
  root: {
    color: theme.palette.error.main,
  },
})

class ProblemMessage extends Component {
  render = () => {
    const {
      children,
      classes,
    } = this.props

    return (
      <Typography variant="caption" className={classes.root}>
        <em>{children}</em>
      </Typography>
    )
  }
}

ProblemMessage.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

export default withStyles(styles)(ProblemMessage)
