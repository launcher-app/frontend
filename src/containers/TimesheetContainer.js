import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Checkbox from '@material-ui/core/Checkbox'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableFooter from '@material-ui/core/TableFooter'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import RefreshIcon from '@material-ui/icons/Refresh'
import SendIcon from '@material-ui/icons/Send'
import {KeyboardTimePicker} from '@material-ui/pickers'
import TableWrapper from '../components/TableWrapper'
import WorkedBalance from '../components/WorkedBalance'
import ProblemMessage from '../components/ProblemMessage'
import wrappedAxios from '../wrappers/axios'
import * as moment from 'moment'
import 'moment/locale/pt-br'

const initialState = {
  timesheet: [],
  selected: [],
  isTimesheetLoading: false,
  thereIsServerError: false,
}

class TimesheetContainer extends Component {
  state = initialState

  componentDidMount = () => {
    this.loadTimesheet()
  }

  loadTimesheet = () => {
    const enableMocks = this.props.enableMocks || false
    const timesheetPromise = enableMocks ? this.getMockedTimesheet() : this.getTimesheet()

    this.setState({isTimesheetLoading: true})

    return timesheetPromise
      .then(timesheet => {
        this.setState({
          timesheet,
          thereIsServerError: false,
        })
      })
      .catch(reason => {
        this.setState({
          thereIsServerError: true,
        })

        console.log(reason)
      })
      .then(() => {
        let newState = {
          isTimesheetLoading: false,
        }

        if (enableMocks) {
          newState.selected = [1]
        }

        this.setState(newState)
      })
  }

  getTimesheet = () => {
    return wrappedAxios
      .get(`/timesheet`)
      .then(response => response.data.timesheet)
  }

  getMockedTimesheet = () => {
    return new Promise(resolve => {
      const issue = {
        ticket: `AR-0001`,
        summary: `Foo`,
        type: `demanda_lean`,
        ust: 1,
      }

      const timesheet = [
        {
          date: `2019-03-31T00:00:00-03:00`,
          records: [
            {id: 1, arrival: `2019-03-31T08:30:00-03:00`, departure: `2019-03-31T12:30:00-03:00`, issue},
            {id: 2, arrival: `2019-03-31T13:30:00-03:00`, departure: `2019-03-31T18:00:00-03:00`},
          ],
        },
        {
          date: `2019-04-01T00:00:00-03:00`,
          records: [
            {id: 3, arrival: `2019-04-01T08:30:00-03:00`, departure: `2019-04-01T12:30:00-03:00`},
            {id: 4, arrival: `2019-04-01T13:30:00-03:00`, departure: null},
          ],
        },
        {
          date: `2019-04-02T00:00:00-03:00`,
          records: [
            {id: 5, arrival: `2019-04-02T08:30:00-03:00`, departure: `2019-04-02T12:30:00-03:00`},
            {id: 6, arrival: null,                        departure: null},
          ],
        },
      ]

      setTimeout(() => resolve(timesheet), 500)
    })
  }

  handleChangeSelectAll = event => {
    let selected = []

    // Se o checkbox "selecionar todos" estiver marcado
    if (event.target.checked) {
      // Seleciona somente os que tiverem issues
      const {timesheet} = this.state

      for (let i = 0; i < timesheet.length; i++) {
        const withIssues = timesheet[i].records.filter(record => record.issue)
        selected = selected.concat(withIssues.map(record => record.id))
      }
    }

    // Atualiza o state
    this.setState({selected})
  }

  withIssues = (accumulator, date) => {
    return accumulator + date.records.filter(record => record.issue).length
  }

  handleClickSelect = record => event => {
    const {selected} = this.state

    let newSelected = []
    const selectedIndex = selected.indexOf(record.id)

    if (!record.issue) {
      return
    }

    if (selectedIndex === -1) {
      // Adiciona registro
      newSelected = newSelected.concat(selected, record.id)
    } else if (selectedIndex === 0) {
      // Remove o primeiro registro
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      // Remove o último registro
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else {
      // Remove registro do meio
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    this.setState({selected: newSelected})
  }

  handleDropIssue = (dateIndex, record, recordIndex) => event => {
    const {timesheet, selected} = this.state

    // Procura e vincula a issue no registro
    const transferedIssue = event.dataTransfer.getData(`issue`)
    if (!transferedIssue) {
      return
    }

    const issue = JSON.parse(transferedIssue)

    timesheet[dateIndex].records[recordIndex].issue = issue
    let newState = {timesheet}

    // Adiciona ID do registro aos selecionados
    if (-1 === selected.indexOf(record.id)) {
      newState.selected = selected.concat(record.id)
    }

    // Atualiza o state
    this.setState(newState)
  }

  handleDragIssueOver = record => event => {
    if (null !== record.arrival && null !== record.departure) {
      event.preventDefault()
    }
  }

  handleDragIssueEnter = event => {
    // noOp
  }

  handleDragIssueLeave = event => {
    // noOp
  }

  handleChangeTimePicker = (isArrival, date, dateIndex, recordIndex) => newDate => {
    const {timesheet} = this.state

    // Atribuindo novo valor
    const isArrivalMap = {
      true: `arrival`,
      false: `departure`,
    }

    // Adiciona horas e minutos selecionados na data
    timesheet[dateIndex].records[recordIndex][isArrivalMap[isArrival]] = date.clone()
      .add(newDate.hours(), `hours`)
      .add(newDate.minutes(), `minutes`)
      .format(`YYYY-MM-DDTHH:mm:00ZZ`)

    // Atualiza o state
    this.setState({timesheet})
  }

  handleDragIssueStart = (onDragIssueStart, issue) => event => {
    onDragIssueStart(event, issue)
  }

  handleDragIssueEnd = (onDragIssueEnd, issue) => event => {
    onDragIssueEnd(event, issue)
  }

  handleDeleteChip = (dateIndex, record, recordIndex) => event => {
    const {timesheet, selected} = this.state

    // Remove a issue do registro
    delete timesheet[dateIndex].records[recordIndex].issue

    // Remove dos selecionados
    const selectedIndex = selected.indexOf(record.id)

    // Se não encontrou o record nos selecionados, não é necessário
    // remover dos selecionados
    if (selectedIndex === -1) {
      this.setState({
        timesheet,
      })

      return
    }

    let newSelected = []

    if (selectedIndex === 0) {
      // Remove o primeiro selecionado
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      // Remove o último selecionado
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else {
      // Remove o selecionado do meio
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    // Atualiza o state
    this.setState({
      timesheet,
      selected: newSelected
    })
  }

  handleClickSend = onSendPerformedTasks => event => {
    const {
      timesheet,
      selected,
    } = this.state

    let performedTasks = []
    // Acessa todos selecionados
    for (let i = 0; i < selected.length; i++) {
      // Acessa todos os registros
      for (let j = 0; j < timesheet.length; j++) {
        // Cria uma tarefa a partir do período selecionado
        const performedTask = timesheet[j].records.find(record => selected[i] === record.id)

        if (undefined !== performedTask) {
          performedTasks.push({
            date: timesheet[j].date,
            start_time: performedTask.arrival,
            end_time: performedTask.departure,
            ticket: performedTask.issue.ticket,
            description: performedTask.issue.summary,
          })

          break
        }
      }
    }

    onSendPerformedTasks(performedTasks, `presential`)
  }

  getTotalAsMilliseconds = records => {
    let durations = []

    for (let i = 0; i < records.length; i++) {
      const record = records[i]

      // O record obrigatóriamente tem que ter chegada e partida
      if (!(record.arrival && record.departure)) {
        continue
      }

      const arrival = moment(record.arrival)
      const departure = moment(record.departure)
      const duration = moment.duration(departure.diff(arrival))

      durations.push(duration)
    }

    if (0 === durations.length) {
      throw new Error(`Não é possível determinar a duração dos registros`)
    }

    // Soma todas durações
    return durations
      .reduce((accumulator, currentVal) => currentVal.add(accumulator))
      .asMilliseconds()
  }

  getWorkdayBalanceAsMilliseconds = records => {
    const totalMilliseconds = this.getTotalAsMilliseconds(records)

    // Calcula a diferença entre as horas trabalhadas e 8h30
    const expected = moment.duration(`PT8H30M`)
    const diff = moment.duration(totalMilliseconds).subtract(expected)

    return diff.asMilliseconds()
  }

  getTotalBalanceAsMilliseconds = () => {
    const {
      timesheet,
    } = this.state

    let totalMilliseconds = 0
    for (let i = 0; i < timesheet.length; i++) {
      try {
        const milliseconds = this.getWorkdayBalanceAsMilliseconds(timesheet[i].records)
        totalMilliseconds += milliseconds
      } catch (e) {}
    }

    return totalMilliseconds
  }

  reloadTimesheet = () => {
    const newState = {
      timesheet: [],
      selected: [],
    }

    this.setState(newState, this.loadTimesheet)
  }

  handleClickReload = () => {
    const {timesheet} = this.state

    let shouldAskConfirmation = false
    timesheetLoop:
    for (let i = 0; i < timesheet.length; i++) {
      const records = timesheet[i].records

      for (let j = 0; j < records.length; j++) {
        if (undefined !== records[j].issue) {
          shouldAskConfirmation = true

          break timesheetLoop
        }
      }
    }

    if (shouldAskConfirmation) {
      const shouldRealodAnyway = window.confirm(`Esta ação irá limpar todos os pontos configurados.`)

      if (shouldRealodAnyway) {
        this.reloadTimesheet()
      }

      return
    }

    this.reloadTimesheet()
  }

  timeMask = value => {
    const chars = value.split(``)
    const minutes = [/[0-5]/, /[0-9]/]
    const hours = [
        /[0-2]/,
        `2` === chars[0] ? /[0-3]/ : /[0-9]/
    ]

    return hours.concat(`:`).concat(minutes)
  }

  getWorkdayBalanceNode = records => {
    try {
      const workdayBalanceMilliseconds = this.getWorkdayBalanceAsMilliseconds(records)

      return (<WorkedBalance milliseconds={workdayBalanceMilliseconds} />)
    } catch (e) {}

    return (<em style={{color: `#cccccc`}}>n/a</em>)
  }

  render = () => {
    const {
      timesheet,
      selected,
      isTimesheetLoading,
      thereIsServerError,
    } = this.state

    const {
      isDraggingIssue,
      issueBeingDragged,
      onDragIssueStart,
      onDragIssueEnd,
      onSendPerformedTasks,
    } = this.props

    const rowCount = timesheet.reduce(this.withIssues, 0)
    const selectedCount = selected.length
    const totalBalanceMilliseconds = this.getTotalBalanceAsMilliseconds()
    const s = selectedCount > 1 ? `s` : ``

    return (
      <Paper>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={8}>
              {
                selectedCount > 0 ? (
                  <Typography variant="subtitle1" noWrap>
                    {`${selectedCount} registro${s} selecionado${s}`}
                  </Typography>
                ) : (
                  <Typography variant="h6" noWrap>
                    Registro de pontos
                  </Typography>
                )
              }
            </Grid>
            <Grid item xs={4}>
              <Grid container direction="row" justify="flex-end" alignItems="center">
                <Grid item>
                  <Tooltip title="Reload" onClick={this.handleClickReload}>
                    <div>
                      <IconButton color="secondary" disabled={isTimesheetLoading}>
                        <RefreshIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Lançar selecionados">
                    <div>
                      <IconButton color="secondary" disabled={0 === selectedCount} onClick={this.handleClickSend(onSendPerformedTasks)}>
                        <SendIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
        <TableWrapper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={0 < selectedCount && selectedCount < rowCount}
                    checked={0 < rowCount && selectedCount === rowCount}
                    disabled={0 === rowCount}
                    onChange={this.handleChangeSelectAll}
                  />
                </TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Entrada</TableCell>
                <TableCell>Saída</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Ticket</TableCell>
              </TableRow>
            </TableHead>
            {
              !isTimesheetLoading && !thereIsServerError &&
              <TableFooter>
                <TableRow key={`record-total-time`}>
                  <TableCell colSpan={4}></TableCell>
                  <TableCell colSpan={2}>
                    <WorkedBalance milliseconds={totalBalanceMilliseconds} />
                  </TableCell>
                </TableRow>
              </TableFooter>
            }
            <TableBody>
              {
                isTimesheetLoading &&
                <TableRow>
                  <TableCell colSpan={6}>
                    <em>Carregando...</em>
                  </TableCell>
                </TableRow>
              }
              {
                !isTimesheetLoading && thereIsServerError &&
                <TableRow>
                  <TableCell colSpan={6}>
                    <ProblemMessage>
                      Houve um problema ao obter os registros de pontos.
                    </ProblemMessage>
                  </TableCell>
                </TableRow>
              }
              {
                !isTimesheetLoading && !thereIsServerError &&
                timesheet.map((date, dateIndex) => {
                  const dateMoment = moment(date.date)

                  return date.records.map((record, recordIndex) => {
                    const isSelected = -1 !== selected.indexOf(record.id)

                    return (
                      <TableRow
                        key={`record-${dateIndex}-${recordIndex}`}
                        onDragEnter={this.handleDragIssueEnter}
                        onDragLeave={this.handleDragIssueLeave}
                        onDragOver={this.handleDragIssueOver(record)}
                        onDrop={this.handleDropIssue(dateIndex, record, recordIndex)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            disabled={!record.issue}
                            onClick={this.handleClickSelect(record)}
                          />
                        </TableCell>
                        {
                          0 === recordIndex &&
                          <TableCell
                            style={{maxWidth: 185}}
                            rowSpan={date.records.length}
                          >
                            <Typography noWrap variant="inherit">
                              {dateMoment.format(`DD/MM`)}
                              &nbsp;
                              ({dateMoment.format(`dddd`).toLowerCase().replace(`-feira`, ``)})
                            </Typography>
                          </TableCell>
                        }
                        <TableCell style={{minWidth: 190}}>
                          <KeyboardTimePicker
                            keyboardIcon={<AccessTimeIcon />}
                            invalidDateMessage={<em>Horário inválido</em>}
                            ampm={false}
                            cancelLabel="Cancelar"
                            value={record.arrival}
                            onChange={this.handleChangeTimePicker(true, dateMoment, dateIndex, recordIndex)}
                          />
                        </TableCell>
                        <TableCell style={{minWidth: 190}}>
                          <KeyboardTimePicker
                            keyboardIcon={<AccessTimeIcon />}
                            invalidDateMessage={<em>Horário inválido</em>}
                            ampm={false}
                            cancelLabel="Cancelar"
                            value={record.departure}
                            onChange={this.handleChangeTimePicker(false, dateMoment, dateIndex, recordIndex)}
                          />
                        </TableCell>
                        {
                          0 === recordIndex &&
                          <TableCell rowSpan={date.records.length}>
                            {this.getWorkdayBalanceNode(date.records)}
                          </TableCell>
                        }
                        <TableCell style={{width: 170}}>
                          {
                            // record tem issue
                            record.issue &&
                            <Chip
                              draggable
                              color="primary"
                              style={{cursor: `move`}}
                              variant={isSelected ? `default` : `outlined`}
                              label={record.issue.ticket}
                              onDelete={this.handleDeleteChip(dateIndex, record, recordIndex)}
                              onDragStart={this.handleDragIssueStart(onDragIssueStart, record.issue)}
                              onDragEnd={this.handleDragIssueEnd(onDragIssueEnd, record.issue)}
                            />
                          }
                          {
                            // record não tem issue, mas tem entrada e saída
                            // e tem uma issue sendo movida
                            !record.issue && record.arrival && record.departure &&
                            isDraggingIssue &&
                            <Chip
                              style={{borderStyle: `dashed`, color: `grey`}}
                              variant="outlined"
                              label={issueBeingDragged.ticket}
                              onDelete={() => {}}
                            />
                          }
                          {
                            // record não tem issue, nem entrada ou saída
                            // e tem uma issue presencial sendo movida
                            !record.issue && !(record.arrival && record.departure) &&
                            isDraggingIssue &&
                            <Typography variant="caption" style={{color: `grey`}} noWrap>
                              <em>Sem entrada/saída</em>
                            </Typography>
                          }
                        </TableCell>
                      </TableRow>
                    )
                  })
                })
              }
            </TableBody>
          </Table>
        </TableWrapper>
      </Paper>
    )
  }
}

TimesheetContainer.propTypes = {
  enableMocks: PropTypes.bool,
  isDraggingIssue: PropTypes.bool.isRequired,
  issueBeingDragged: PropTypes.object,
  onDragIssueStart: PropTypes.func.isRequired,
  onDragIssueEnd: PropTypes.func.isRequired,
  onSendPerformedTasks: PropTypes.func.isRequired,
}

export default TimesheetContainer
