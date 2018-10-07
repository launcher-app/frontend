import React, {Component} from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import green from '@material-ui/core/colors/green'
import orange from '@material-ui/core/colors/orange'
import * as moment from 'moment'
import 'moment/locale/pt-br'
import 'moment-duration-format'

const styles = theme => ({
  positiveBalance: {
    color: green[500],
  },
  negativeBalance: {
    color: orange[500],
  },
})

class WorkedBalance extends Component {
  formatMilliseconds = milliseconds => {
    const formatted = moment.duration(milliseconds).format(`hh:mm`, {
      trim: false
    })

    if (0 <= milliseconds) {
      return `+${formatted}`
    }

    return formatted
  }

  render = () => {
    const {
      classes,
      milliseconds,
    } = this.props

    const classNameMap = {
      true: classes.positiveBalance,
      false: classes.negativeBalance,
    }

    const formatted = this.formatMilliseconds(milliseconds)
    const className = classNameMap[milliseconds >= 0]

    return (
      <Typography noWrap variant="inherit" className={className}>
        {formatted}
      </Typography>
    )
  }
}

WorkedBalance.propTypes = {
  classes: PropTypes.object.isRequired,
  milliseconds: PropTypes.number.isRequired
}

export default withStyles(styles)(WorkedBalance)
