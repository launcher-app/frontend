import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Toolbar from '@material-ui/core/Toolbar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {DatePicker} from '@material-ui/pickers'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import SendIcon from '@material-ui/icons/Send'
import PaddedBottomPaper from '../components/PaddedBottomPaper'
import LeftRightPaddedDiv from '../components/LeftRightPaddedDiv'
import * as moment from 'moment'
import 'moment/locale/pt-br'

const initialState = {
  startDate: moment().startOf(`month`),
  endDate: moment(),
}

class AdministrativeActivitiesContainer extends Component {
  state = initialState

  handleDateChange = name => date => {
    this.setState({[name]: date})
  }

  handleClickSend = (startDate, endDate, onSendPerformedTasks) => event => {
    const {startDate, endDate} = this.state

    const weekend = [
      moment().day(`Sábado`).weekday(),
      moment().day(`Domingo`).weekday()
    ]

    let performedTasks = []
    for (let date = startDate.clone(); date.isSameOrBefore(endDate, `day`); date.add(1, `day`).startOf(`day`)) {
      const isWorkingDay = -1 === weekend.indexOf(date.weekday())

      if (isWorkingDay) {
        performedTasks.push({
          date: date.format(),
          start_time: date.clone().startOf(`date`).add(moment.duration(`PT8H`)).format(),
          end_time: date.clone().add(moment.duration(`PT16H30M`)).format(),
        })
      }
    }

    if (0 === performedTasks.length) {
      return
    }

    onSendPerformedTasks(performedTasks, `administrative`)
  }

  render = () => {
    const {
      startDate,
      endDate,
    } = this.state

    const {
      onSendPerformedTasks,
    } = this.props

    return (
      <PaddedBottomPaper>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={10}>
              <Typography variant="h6" noWrap>
                Atividades administrativas
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Grid container direction="row" justify="flex-end" alignItems="center">
                <Grid item>
                  <Tooltip title="Lançar selecionados">
                    <div>
                      <IconButton color="secondary" onClick={this.handleClickSend(startDate, endDate, onSendPerformedTasks)}>
                        <SendIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
        <LeftRightPaddedDiv>
          <Grid container direction="row" justify="flex-start" alignItems="baseline" spacing={3}>
            <Grid item>
              <DatePicker
                label="Data inicial"
                style={{maxWidth: 120}}
                cancelLabel="Cancelar"
                format="DD/MM/YYYY"
                value={startDate}
                onChange={this.handleDateChange(`startDate`)}
              />
            </Grid>
            <Grid item>
              <DatePicker
                label="Data final"
                style={{maxWidth: 120}}
                cancelLabel="Cancelar"
                format="DD/MM/YYYY"
                value={endDate}
                onChange={this.handleDateChange(`endDate`)}
              />
            </Grid>
          </Grid>
        </LeftRightPaddedDiv>
      </PaddedBottomPaper>
    )
  }
}

AdministrativeActivitiesContainer.propTypes = {
  onSendPerformedTasks: PropTypes.func.isRequired,
}

export default AdministrativeActivitiesContainer
