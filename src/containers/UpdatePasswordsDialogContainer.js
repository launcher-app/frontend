import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Slide from '@material-ui/core/Slide'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import ProblemMessage from '../components/ProblemMessage'
import wrappedAxios from '../wrappers/axios'

const initialState = {
  jiraPassword: ``,
  isJiraPasswordNotEmpty: false,
  isUpdatingJiraPassword: false,
  thereIsServerErrorForUpdatingJiraPassword: false,

  datainfoPassword: ``,
  isDatainfoPasswordNotEmpty: false,
  isUpdatingDatainfoPassword: false,
  thereIsServerErrorForUpdatingDatainfoPassword: false,
}

class UpdatePasswordsDialogContainer extends Component {
  state = initialState

  handleSaveJiraPassword = (jiraPassword, onClose) => event => {
    const postData = {
      jira_password: jiraPassword,
    }

    this.setState({isUpdatingJiraPassword: true})

    wrappedAxios
      .post(`/update-jira-password`, postData)
      .then(response => {
        onClose()
      })
      .catch(reason => {
        this.setState({
          thereIsServerErrorForUpdatingJiraPassword: true,
        })

        console.error(reason)
      })
      .then(() => this.setState({isUpdatingJiraPassword: false}))
  }

  handleSaveDatainfoPassword = (datainfoPassword, onClose) => event => {
    const postData = {
      datainfo_password: datainfoPassword,
    }

    this.setState({isUpdatingDatainfoPassword: true})

    wrappedAxios
      .post(`/update-datainfo-password`, postData)
      .then(response => {
        onClose()
      })
      .catch(reason => {
        this.setState({
          thereIsServerErrorForUpdatingDatainfoPassword: true,
        })

        console.error(reason)
      })
      .then(() => this.setState({isUpdatingDatainfoPassword: false}))
  }

  handleChangePasswordField = name => event => {
    const newState = {
      [name]: event.target.value
    }

    this.setState(newState, this.unlockSaveButtonUnlessMismatch)
  }

  unlockSaveButtonUnlessMismatch = () => {
    const {
      jiraPassword,
      datainfoPassword,
    } = this.state

    this.setState({
      isJiraPasswordNotEmpty: `` !== jiraPassword,
      isDatainfoPasswordNotEmpty: `` !== datainfoPassword,
    })
  }

  render = () => {
    const {
      isOpen,
      onClose,
    } = this.props

    const {
      jiraPassword,
      isJiraPasswordNotEmpty,
      isUpdatingJiraPassword,
      thereIsServerErrorForUpdatingJiraPassword,

      datainfoPassword,
      isDatainfoPasswordNotEmpty,
      isUpdatingDatainfoPassword,
      thereIsServerErrorForUpdatingDatainfoPassword,
    } = this.state

    return (
      <div>
        <Dialog
          onClose={onClose}
          open={isOpen}
          scroll="body"
          TransitionComponent={Slide}
          maxWidth="sm"
        >
          <DialogTitle>Atualizar senhas</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Atualize suas senhas do Jira e do Service da Datainfo.
            </DialogContentText>

            <div style={{marginTop: 20}}>
              <Typography variant="h6" noWrap>
                Jira
              </Typography>
              <form noValidate autoComplete="off" style={{marginTop: 15}}>
                <Grid container spacing={16}>
                  <Grid item xs={12}>
                    <TextField
                      id="jira-password"
                      label="Senha atual do Jira"
                      helperText="Campo em texto claro"
                      onChange={this.handleChangePasswordField('jiraPassword')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        {
                          !isUpdatingJiraPassword && thereIsServerErrorForUpdatingJiraPassword &&
                          <ProblemMessage>
                            Houve um problema ao atualizar senha do Jira.
                          </ProblemMessage>
                        }
                      </Grid>
                      <Grid item>
                        <Button onClick={this.handleSaveJiraPassword(jiraPassword, onClose)} color="primary" disabled={isUpdatingJiraPassword || !isJiraPasswordNotEmpty}>
                          Salvar senha do Jira
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </form>
            </div>

            <div style={{marginTop: 40}}>
              <Typography variant="h6" noWrap>
                Service da Datainfo
              </Typography>
              <form noValidate autoComplete="off" style={{marginTop: 15}}>
                <Grid container spacing={16}>
                  <Grid item xs={12}>
                    <TextField
                      id="datainfo-password"
                      label="Senha atual do Service da Datainfo"
                      helperText="Campo em texto claro"
                      onChange={this.handleChangePasswordField('datainfoPassword')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        {
                          !isUpdatingDatainfoPassword && thereIsServerErrorForUpdatingDatainfoPassword &&
                          <ProblemMessage>
                            Houve um problema ao atualizar senha da Datainfo.
                          </ProblemMessage>
                        }
                      </Grid>
                      <Grid item>
                        <Button onClick={this.handleSaveDatainfoPassword(datainfoPassword, onClose)} color="primary" disabled={isUpdatingDatainfoPassword || !isDatainfoPasswordNotEmpty}>
                          Salvar senha do Service
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
}

UpdatePasswordsDialogContainer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default UpdatePasswordsDialogContainer
