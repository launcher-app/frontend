import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Slide from '@material-ui/core/Slide'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import RefreshIcon from '@material-ui/icons/Refresh'
import ProblemMessage from '../components/ProblemMessage'
import {withSnackbar} from 'notistack'
import wrappedAxios from '../wrappers/axios'
import * as moment from 'moment'
import 'moment/locale/pt-br'

const ADMINISTRATIVE_PROJECT_ID = `PJ588`

const ADMINISTRATIVE_TYPE = `administrative`
const PRESENTIAL_TYPE = `presential`

const ADMINISTRATIVE_ACTIVITIES = {
  '6812':   {ticket: `ATESTADOS`,      description: `Atestados`},
  '6814':   {ticket: `FERIAS`,         description: `Férias`},
  '6815':   {ticket: `AUSENCIA`,       description: `Ausência`},
  '8800':   {ticket: `REUNIOES_GERAL`, description: `Reuniões - Geral`},
  '9150':   {ticket: `RECESSO`,        description: `Recesso`},
  '16705':  {ticket: `LICENCA`,        description: `Licença`},
  '179734': {ticket: `FERIADO`,        description: `Feriado`},
  '183593': {ticket: `DISPENSA`,       description: `Dispensa`},
}

const initialState = {
  activityId: ``,
  isSendingPerformedTasks: false,
  activities: [],
  isLoadingActivities: false,
  thereIsServerErrorForLaunching: false,
  thereIsServerErrorForActivitiesFetching: false,
}

class PerformedTasksDialogContainer extends Component {
  state = initialState

  componentDidUpdate = prevProps => {
    const thereIsPerformedTasksTypeVariable = undefined !== this.props.performedTasksType
    const isPerformedTaksTypeUpdated = this.props.performedTasksType !== prevProps.performedTasksType

    if (thereIsPerformedTasksTypeVariable && isPerformedTaksTypeUpdated) {
      this.setState(initialState, this.loadActivities)
    }
  }

  loadActivities = () => {
    const enableMocks = this.props.enableMocks || false
    const activitiesPromise = enableMocks ? this.getMockedActivities() : this.getActivities()

    this.setState({isLoadingActivities: true})

    return activitiesPromise
      .then(activities => {
        const filteredActivities = this.filterActivities(activities)
        let newState = {
          activities: filteredActivities,
          thereIsServerErrorForActivitiesFetching: false,
        }

        // Seleciona automaticamente se houver apenas uma atividade
        if (1 === activities.length) {
          newState.activityId = filteredActivities[0].id
        }

        this.setState(newState)
      })
      .catch(reason => {
        this.setState({
          thereIsServerErrorForActivitiesFetching: true,
        })

        console.error(reason)
      })
      .then(() => this.setState({isLoadingActivities: false}))
  }

  filterActivities = activities => {
    const {performedTasksType} = this.props

    // Não-presenciais
    if (ADMINISTRATIVE_TYPE === performedTasksType) {
      return activities.filter(activity => {
        return ADMINISTRATIVE_PROJECT_ID === activity.project_id
      })
    }

    // Presenciais
    if (PRESENTIAL_TYPE === performedTasksType) {
      return activities.filter(activity => {
        return ADMINISTRATIVE_PROJECT_ID !== activity.project_id
      })
    }

    throw new Error(`Tipo de tarefa não suportado`)
  }

  getActivities = () => {
    return wrappedAxios
      .get(`/activities`)
      .then(response => response.data.activities)
  }

  getMockedActivities = () => {
    return new Promise(resolve => {
      const activities = [
        {
          id: `217807`,
          description: `14.5  -  MRE-Desenv. Novos Projetos - Abril/2019 - (Hallison Boaventura)`,
          project_id: `PJ1283`,
          project_description: `PJ1283 - MRE - Desenvolvimento de Novos Projetos`
        },
        {
          id: `6814`,
          description: `1.7  -  Férias`,
          project_id: `PJ588`,
          project_description: `PJ588 - DATAINFO - ADMINISTRATIVO`
        },
        {
          id: `6812`,
          description: `1.8  -  Atestados`,
          project_id: `PJ588`,
          project_description: `PJ588 - DATAINFO - ADMINISTRATIVO`
        },
      ]

      setTimeout(() => resolve(activities), 500)
    })
  }

  handleClickReload = () => {
    this.setState(initialState, this.loadActivities)
  }

  handleChangeActivity = event => {
    this.setState({
      activityId: event.target.value,
    })
  }

  resolvePerformedTasks = activityId => {
    const {
      performedTasks,
      performedTasksType,
    } = this.props

    if (ADMINISTRATIVE_TYPE !== performedTasksType) {
      return performedTasks
    }

    const activityInfo = ADMINISTRATIVE_ACTIVITIES[activityId]

    if (undefined === activityInfo) {
      throw new Error(`Atividade de ID ${activityId} ainda não é suportada`)
    }

    return performedTasks.map(performedTask => {
      return {
        ...performedTask,
        ticket: activityInfo.ticket,
        description: activityInfo.description,
      }
    })
  }

  handleSendPerformedTasks = onClose => () => {
    const {activityId} = this.state
    const performedTasks = this.resolvePerformedTasks(activityId)

    const launchParams = {
      activity_id: activityId,
      performed_tasks: performedTasks,
    }

    this.setState({isSendingPerformedTasks: true})

    wrappedAxios
      .post(`/launch`, launchParams)
      .then(response => {
        this.setState({
          thereIsServerErrorForLaunching: false,
        })

        const {enqueueSnackbar} = this.props

        const messages = response.data.messages
        const isOkCallback = element => `OK` === element.message
        const isEveryMessageOk = messages.every(isOkCallback)

        if (isEveryMessageOk) {
          enqueueSnackbar(`Todos registros foram lançados`, {variant: `success`})
          onClose()

          return
        }

        const noneOkCallback = element => `OK` !== element.message
        const isNoneMessageOk = messages.every(noneOkCallback)

        if (isNoneMessageOk) {
          enqueueSnackbar(`Service está desbloqueado? Já lançou esses pontos?`, {variant: `info`})
          enqueueSnackbar(`Todos registros foram rejeitados pelo Service`, {variant: `error`})

          return
        }

        enqueueSnackbar(`Alguns registros foram rejeitados`, {variant: `info`, persist: true})

        for (let i = 0; i < messages.length; i++) {
          if (`OK` !== messages[i].message) {
            const date = moment(messages[i].date).format(`DD/MM`)
            const startTime = moment(messages[i].start_time).format(`HH:mm`)
            const endTime = moment(messages[i].end_time).format(`HH:mm`)
            const message = `O registro ${date} ${startTime}~${endTime} foi rejeitado (${messages[i].message})`

            enqueueSnackbar(message, {variant: `error`, persist: true})
          }
        }

        onClose()
      })
      .catch(reason => {
        this.setState({
          thereIsServerErrorForLaunching: true,
        })

        console.error(reason)
      })
      .then(() => this.setState({isSendingPerformedTasks: false}))
  }

  render = () => {
    const {
      activityId,
      isSendingPerformedTasks,
      isLoadingActivities,
      activities,
      thereIsServerErrorForLaunching,
      thereIsServerErrorForActivitiesFetching,
    } = this.state

    const {
      isOpen,
      onCancel,
      onClose,
      performedTasks,
      performedTasksType,
    } = this.props

    return (
      <Dialog
        open={isOpen}
        scroll="body"
        TransitionComponent={Slide}
        maxWidth="md"
      >
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Selecione a atividade e confira as tarefas realizadas.
          </DialogContentText>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item style={{margin: `15px 0`, flexGrow: 1}}>
              <TextField
                select
                fullWidth
                label="Atividade"
                value={activityId}
                disabled={isSendingPerformedTasks || isLoadingActivities || 0 === activities.length}
                onChange={this.handleChangeActivity}
              >
                {
                  activities.map(activity =>
                    <MenuItem key={activity.id} value={activity.id}>
                      {activity.description}
                    </MenuItem>
                  )
                }
              </TextField>
            </Grid>
            <Grid item>
              <Tooltip title="Reload">
                <div>
                  <IconButton
                    color="secondary"
                    onClick={this.handleClickReload}
                    disabled={isSendingPerformedTasks || isLoadingActivities}
                  >
                    <RefreshIcon />
                  </IconButton>
                </div>
              </Tooltip>
            </Grid>
          </Grid>
          {
            !isLoadingActivities && thereIsServerErrorForActivitiesFetching &&
            <ProblemMessage>
              Houve um problema ao obter as atividades.
            </ProblemMessage>
          }
        </DialogContent>
        <Table style={{marginBottom: 15}}>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Entrada</TableCell>
              <TableCell>Saída</TableCell>
              <TableCell>Ticket</TableCell>
              <TableCell>Descrição</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              performedTasks.map(performedTask => (
                <TableRow key={`${performedTask.date}_${performedTask.start_time}_${performedTask.end_time}`}>
                  <TableCell>{moment(performedTask.date).format(`DD/MM`)}</TableCell>
                  <TableCell>{moment(performedTask.start_time).format(`HH:mm`)}</TableCell>
                  <TableCell>{moment(performedTask.end_time).format(`HH:mm`)}</TableCell>
                  <TableCell>
                    <Typography noWrap variant="inherit">
                      {
                        ADMINISTRATIVE_TYPE !== performedTasksType ?
                        performedTask.ticket :
                        <em>Automático</em>
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {
                      ADMINISTRATIVE_TYPE !== performedTasksType ?
                      performedTask.description :
                      <em>Automático</em>
                    }
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        <DialogActions>
          {
            !isSendingPerformedTasks && thereIsServerErrorForLaunching &&
            <ProblemMessage>
              Houve um problema ao enviar os pontos.
            </ProblemMessage>
          }
          <Button
            disabled={isSendingPerformedTasks}
            onClick={onCancel}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            disabled={isSendingPerformedTasks || isLoadingActivities || `` === activityId}
            onClick={this.handleSendPerformedTasks(onClose)}
            color="primary"
          >
            Lançar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

PerformedTasksDialogContainer.propTypes = {
  enableMocks: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  performedTasks: PropTypes.array.isRequired,
  performedTasksType: PropTypes.oneOf([ADMINISTRATIVE_TYPE, PRESENTIAL_TYPE]),
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default withSnackbar(PerformedTasksDialogContainer)
