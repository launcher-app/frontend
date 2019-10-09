import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import TableWrapper from '../components/TableWrapper'
import SendIcon from '@material-ui/icons/Send'
import {DatePicker} from '@material-ui/pickers'
import ProblemMessage from '../components/ProblemMessage'
import wrappedAxios from '../wrappers/axios'
import * as moment from 'moment'
import 'moment/locale/pt-br'

const initialState = {
  report: [],
  isReportLoading: false,
  thereIsServerError: false,
  isSearchPristine: true,
  startDate: moment().startOf(`month`),
  endDate: moment().endOf(`day`),
}

class PerformedTasksReportContainer extends Component {
  state = initialState

  loadReport = () => {
    const enableMocks = this.props.enableMocks || false
    const reportPromise = enableMocks ? this.getMockedReport() : this.getReport()

    this.setState({
      isReportLoading: true,
      isSearchPristine: false,
    })

    return reportPromise
      .then(report => {
        this.setState({
          report,
          thereIsServerError: false,
        })
      })
      .catch(reason => {
        this.setState({
          thereIsServerError: true,
        })

        console.error(reason)
      })
      .then(() => this.setState({isReportLoading: false}))
  }

  getMockedReport = () => {
    return new Promise(resolve => {
      const report = [
        {
          date_formatted: `17/11/1989`,
          worked_time: `8:30`,
          details: [
            {
              description: `description`,
              project: `project`,
              activity: `activity`,
              start_time: `4:00`,
              end_time: `4:30`,
              effort_type: `Normal`,
              worked_time: `worked`,
            },
            {
              description: `description`,
              project: `project`,
              activity: `activity`,
              start_time: `start`,
              end_time: `end`,
              effort_type: `effort`,
              worked_time: `worked`,
            },
          ],
        },
      ]

      setTimeout(() => resolve(report), 500)
    })
  }

  getReport = () => {
    const {
      startDate,
      endDate,
    } = this.state

    return wrappedAxios
      .get(`/widget-report/${startDate.format(`YYYY-MM-DD`)}/${endDate.format(`YYYY-MM-DD`)}`)
      .then(response => response.data.widget_report)
  }

  handleClickQueryReport = () => {
    this.loadReport()
  }

  handleDateChange = name => date => {
    this.setState({[name]: date})
  }

  render = () => {
    const {
      report,
      isReportLoading,
      startDate,
      endDate,
      thereIsServerError,
      isSearchPristine,
    } = this.state

    return (
      <Paper>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={6}>
              <Typography variant="h6" noWrap>
                Tarefas realizadas lançadas
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Grid container direction="row" justify="flex-end" alignItems="center" spacing={2}>
                <Grid item>
                  <DatePicker
                    showTodayButton
                    todayLabel="Hoje"
                    cancelLabel="Cancelar"
                    label="De"
                    value={startDate}
                    format="DD/MM/YYYY"
                    onChange={this.handleDateChange(`startDate`)}
                    disabled={isReportLoading}
                  />
                </Grid>
                <Grid item>
                  <DatePicker
                    showTodayButton
                    todayLabel="Hoje"
                    cancelLabel="Cancelar"
                    label="Até"
                    value={endDate}
                    format="DD/MM/YYYY"
                    onChange={this.handleDateChange(`endDate`)}
                    disabled={isReportLoading}
                  />
                </Grid>
                <Grid item>
                  <Tooltip title="Buscar">
                    <div>
                      <IconButton disabled={isReportLoading} color="secondary" onClick={this.handleClickQueryReport}>
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
                <TableCell>Data</TableCell>
                <TableCell>Trabalhadas</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Atividade</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Término</TableCell>
                <TableCell>Horas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                isReportLoading &&
                <TableRow>
                  <TableCell colSpan={7}>
                    <em>Carregando...</em>
                  </TableCell>
                </TableRow>
              }
              {
                !isReportLoading && thereIsServerError &&
                <TableRow>
                  <TableCell colSpan={7}>
                    <ProblemMessage>
                      Houve um problema ao obter as tarefas realizadas lançadas.
                    </ProblemMessage>
                  </TableCell>
                </TableRow>
              }
              {
                !isReportLoading && !thereIsServerError && 0 === report.length && !isSearchPristine &&
                <TableRow>
                  <TableCell colSpan={7}>
                    <em>Nenhum lançamento no mês selecionado.</em>
                  </TableCell>
                </TableRow>
              }
              {
                isSearchPristine &&
                <TableRow>
                  <TableCell colSpan={7}>
                    <em>Defina um intervalo e clique no botão para pesquisar.</em>
                  </TableCell>
                </TableRow>
              }
              {
                !isReportLoading && !thereIsServerError && 0 < report.length &&
                report.map((task, taskIndex) =>
                  task.details.map((detail, detailIndex) =>
                    <TableRow key={`${taskIndex}_${detailIndex}`}>
                      {
                        0 === detailIndex &&
                        <TableCell rowSpan={task.details.length}>
                          {task.date_formatted} ({moment(task.date_formatted, 'DD/MM/YYYY').format('dddd').toLowerCase().replace(`-feira`, ``)})
                        </TableCell>
                      }
                      {
                        0 === detailIndex &&
                        <TableCell rowSpan={task.details.length}>
                          {task.worked_time}
                        </TableCell>
                      }
                      <TableCell>{detail.description || `—`}</TableCell>
                      <TableCell>{detail.activity}</TableCell>
                      <TableCell>{detail.start_time}</TableCell>
                      <TableCell>{detail.end_time}</TableCell>
                      <TableCell>{detail.worked_time}</TableCell>
                    </TableRow>
                  )
                )
              }
            </TableBody>
          </Table>
        </TableWrapper>
      </Paper>
    )
  }
}

PerformedTasksReportContainer.propTypes = {
  enableMocks: PropTypes.bool,
}

export default PerformedTasksReportContainer
