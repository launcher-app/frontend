import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import RefreshIcon from '@material-ui/icons/Refresh'
import wrappedAxios from '../wrappers/axios'
import WorkedTimeChart from '../components/WorkedTimeChart'
import PaddedBottomPaper from '../components/PaddedBottomPaper'
import LeftRightPaddedDiv from '../components/LeftRightPaddedDiv'
import ProblemMessage from '../components/ProblemMessage'
import * as moment from 'moment'
import 'moment-duration-format'
import 'moment/locale/pt-br'

const UNTIL_END_OF_DAY = `day`
const UNTIL_END_OF_MONTH = `month`

const initialState = {
  isBalanceLoading: false,
  thereIsServerError: false,
  balance: undefined,
}

class StaticBalanceContainer extends Component {
  state = initialState

  componentDidMount = () => {
    this.loadBalance()
  }

  loadBalance = () => {
    const enableMocks = this.props.enableMocks || false
    const balancePromise = enableMocks ? this.getMockedBalance() : this.getBalance()

    this.setState({isBalanceLoading: true})

    return balancePromise
      .then(balance => {
        if (null === balance) {
          this.setState({
            balance: null,
            thereIsServerError: false,
          })

          return
        }

        const workedTime = moment.duration(balance.worked_time)
        const timeToWork = moment.duration(balance.time_to_work)
        const diff = workedTime.clone().subtract(timeToWork)

        const sign = diff.asMilliseconds() >= 0 ? `+` : ``
        const workedTimeFormatted = workedTime.format(`hh:mm`, {trim: false})
        const timeToWorkFormatted = timeToWork.format(`hh:mm`, {trim: false})
        const diffFormatted = `${sign}${diff.format(`hh:mm`, {trim: false})}`

        // Calcula as porcentagens
        const clamp = (number, min, max) => Math.min(Math.max(Number(number), min), max)
        const workedTimePercent = clamp(workedTime.asMilliseconds() / timeToWork.asMilliseconds() * 100, 0, 100)
        const timeToWorkPercent = 100 - workedTimePercent

        const newBalance = {
          workedTimeFormatted,
          timeToWorkFormatted,
          diffFormatted,
          workedTimePercent,
          timeToWorkPercent,
        }

        this.setState({
          balance: newBalance,
          thereIsServerError: false,
        })
      })
      .catch(reason => {
        this.setState({
          thereIsServerError: true,
        })

        console.log(reason)
      })
      .then(() => this.setState({isBalanceLoading: false}))
  }

  getMockedBalance = () => {
    return new Promise(resolve => {
      let workedTimeIso8601 = `PT8H30M`
      let timeToWorkIso8601 = `PT100H00M`

      if (UNTIL_END_OF_DAY === this.props.untilEndOf) {
        workedTimeIso8601 = `PT8H30M`
        timeToWorkIso8601 = `PT17H00M`
      }

      const balance = {
        worked_time: workedTimeIso8601,
        time_to_work: timeToWorkIso8601,
      }

      setTimeout(() => resolve(balance), 500)
    })
  }

  getBalance = () => {
    const startTime = moment().startOf(`month`).format(`YYYY-MM-DD`)
    const endTime = moment().endOf(this.props.untilEndOf).format(`YYYY-MM-DD`)

    return wrappedAxios
      .get(`/balance/${startTime}/${endTime}`)
      .then(response => response.data.balance)
  }

  handleClickReload = () => {
    this.setState(initialState, this.loadBalance)
  }

  resolveTitle = () => {
    const {untilEndOf} = this.props

    if (UNTIL_END_OF_DAY === untilEndOf) {
      return `Saldo lançado do dia 1º até hoje`
    }

    if (UNTIL_END_OF_MONTH === untilEndOf) {
      return `Saldo lançado de ${moment().format(`MMMM`).toLowerCase()}`
    }

    throw new Error(`Limite de período não suportado`)
  }

  render = () => {
    const {
      isBalanceLoading,
      balance,
      thereIsServerError,
    } = this.state

    const title = this.resolveTitle()

    return (
      <PaddedBottomPaper>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={10}>
              <Typography variant="h6" noWrap>
                {title}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Grid container direction="row" justify="flex-end" alignItems="center">
                <Grid item>
                  <Tooltip title="Reload" onClick={this.handleClickReload}>
                    <div>
                      <IconButton color="secondary" disabled={isBalanceLoading}>
                        <RefreshIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
        <LeftRightPaddedDiv>
          {
            isBalanceLoading &&
            <Typography variant="caption">
              <em>Carregando...</em>
            </Typography>
          }
          {
            !isBalanceLoading && thereIsServerError &&
            <ProblemMessage>
              Houve um problema ao obter o saldo.
            </ProblemMessage>
          }
          {
            !isBalanceLoading && !thereIsServerError && null === balance &&
            <Typography variant="caption">
              <em>Nenhum lançamento neste mês.</em>
            </Typography>
          }
          {
            !isBalanceLoading && !thereIsServerError && undefined !== balance && null !== balance &&
            <Grid container direction="row" justify="space-between" alignItems="center">
              <Grid item xs={6}>
                <Grid container direction="row" justify="space-between" alignItems="baseline">
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" noWrap>
                      Trabalhadas
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{textAlign: `right`}}>
                    <Typography variant="caption">
                      {balance.workedTimeFormatted}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction="row" justify="space-between" alignItems="baseline">
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" noWrap>
                      A trabalhar
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{textAlign: `right`}}>
                    <Typography variant="caption">
                      {balance.timeToWorkFormatted}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction="row" justify="space-between" alignItems="baseline">
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" noWrap>
                      Saldo
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{textAlign: `right`}}>
                    <Typography variant="caption">
                      {balance.diffFormatted}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <div style={{width: `100%`, height: 82}}>
                  <WorkedTimeChart
                    workedTime={balance.workedTimePercent}
                    timeToWork={balance.timeToWorkPercent}
                  />
                </div>
              </Grid>
            </Grid>
          }
        </LeftRightPaddedDiv>
      </PaddedBottomPaper>
    )
  }
}

StaticBalanceContainer.propTypes = {
  enableMocks: PropTypes.bool,
  untilEndOf: PropTypes.oneOf([UNTIL_END_OF_MONTH, UNTIL_END_OF_DAY]).isRequired,
}

export default StaticBalanceContainer
