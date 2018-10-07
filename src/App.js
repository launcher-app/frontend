import React, {Component} from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'
import CloseIcon from '@material-ui/icons/Close'
import indigo from '@material-ui/core/colors/indigo'
import deepOrange from '@material-ui/core/colors/deepOrange'
import SwipeableViews from 'react-swipeable-views'
import {SnackbarProvider} from 'notistack'
import MomentUtils from '@date-io/moment'
import AdministrativeActivitiesContainer from './containers/AdministrativeActivitiesContainer'
import JiraContainer from './containers/JiraContainer'
import PerformedTasksDialogContainer from './containers/PerformedTasksDialogContainer'
import StaticBalanceContainer from './containers/StaticBalanceContainer'
import TabContainer from './components/TabContainer'
import TimesheetContainer from './containers/TimesheetContainer'
import PerformedTasksReportContainer from './containers/PerformedTasksReportContainer'
import UserContainer from './containers/UserContainer'
import * as moment from 'moment'
import 'moment/locale/pt-br'

const enableMocks = false

const defaultThemeOptions = {
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      ...indigo,
      main: `#4a4f72`,
    },
    secondary: {
      ...deepOrange,
      main: `#e94e24`,
    },
  },
}

const lightTheme = createMuiTheme({
  ...defaultThemeOptions,
  palette: {
    ...defaultThemeOptions.palette,
    type: `light`,
  },
})

const darkTheme = createMuiTheme({
  ...defaultThemeOptions,
  palette: {
    ...defaultThemeOptions.palette,
    type: `dark`,
  },
})

const styles = theme => ({
  appName: {
    fontFamily: `monaco, fira code, menlo, deja vu sans mono, ubuntu mono, consolas, monospace, monospaced`,
  },
})

const initialState = {
  isNightMode: false,
  activeTab: 0,
  isDraggingIssue: false,
  issueBeingDragged: undefined,
  isPerformedTasksDialogOpen: false,
  performedTasks: [],
  performedTasksType: undefined,
}

class App extends Component {
  state = initialState

  componentDidMount = () => {
    moment.locale(`pt-br`)
  }

  handleChangeTab = (event, activeTab) => {
    this.setState({activeTab})
  }

  handleChangeNightMode = event => {
    const isNightMode = event.target.checked

    this.setState({isNightMode})
  }

  handleDragIssueStart = (event, issue) => {
    event.dataTransfer.setData(`issue`, JSON.stringify(issue))

    this.setState({
      isDraggingIssue: true,
      issueBeingDragged: issue,
    })
  }

  handleDragIssueEnd = (event, issue) => {
    this.setState({
      isDraggingIssue: false,
      issueBeingDragged: undefined,
    })
  }

  hidePerformedTasksDialog = () => {
    this.setState({
      isPerformedTasksDialogOpen: false,
    })
  }

  handleClosePerformedTasksDialog = () => {
    this.hidePerformedTasksDialog()
  }

  handleCancelPerformedTasksDialog = () => {
    this.hidePerformedTasksDialog()
  }

  handleOpenPerformedTasksDialog = (performedTasks, performedTasksType) => {
    this.setState({
      performedTasks,
      performedTasksType,
      isPerformedTasksDialogOpen: true,
    })
  }

  render = () => {
    const {
      isNightMode,
      activeTab,
      isDraggingIssue,
      issueBeingDragged,
      performedTasks,
      performedTasksType,
      isPerformedTasksDialogOpen,
    } = this.state

    const {classes} = this.props

    const theme = isNightMode ? darkTheme : lightTheme

    return (
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={4} action={
          <IconButton key="close" aria-label="Close" color="inherit">
            <CloseIcon />
          </IconButton>
        }>
          <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale="pt-br">
            <React.Fragment>
              <CssBaseline />

              <AppBar position="sticky">
                <Toolbar>
                  <Grid container direction="row" justify="space-between" alignItems="center">
                    <Grid item>
                      <Typography variant="h6" color="inherit" className={classes.appName}>
                        launcherApp
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="overline" color="inherit">
                        <UserContainer enableMocks={enableMocks} />
                      </Typography>
                    </Grid>
                  </Grid>
                </Toolbar>
              </AppBar>

              <Tabs value={activeTab} onChange={this.handleChangeTab}>
                <Tab label="Lançar" />
                <Tab label="Lançados" />
                {/*
                <Tab label="Saldo" />
                <Tab label="Ranking" />
                */}
              </Tabs>
              <SwipeableViews axis="x" index={activeTab}>
                <TabContainer>
                  <Grid container direction="row" justify="space-between" alignItems="flex-start" spacing={16}>
                    <Grid item xs={8}>
                      <TimesheetContainer
                        enableMocks={enableMocks}
                        isDraggingIssue={isDraggingIssue}
                        issueBeingDragged={issueBeingDragged}
                        onDragIssueStart={this.handleDragIssueStart}
                        onDragIssueEnd={this.handleDragIssueEnd}
                        onSendPerformedTasks={this.handleOpenPerformedTasksDialog}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Grid container direction="column" spacing={16}>
                        <Grid item xs={12}>
                          <JiraContainer
                            enableMocks={enableMocks}
                            onDragIssueStart={this.handleDragIssueStart}
                            onDragIssueEnd={this.handleDragIssueEnd}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StaticBalanceContainer
                            untilEndOf="month"
                            enableMocks={enableMocks}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StaticBalanceContainer
                            untilEndOf="day"
                            enableMocks={enableMocks}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <AdministrativeActivitiesContainer
                            onSendPerformedTasks={this.handleOpenPerformedTasksDialog}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </TabContainer>
                <TabContainer>
                  <PerformedTasksReportContainer
                    enableMocks={enableMocks}
                  />
                </TabContainer>
                {/*
                <TabContainer>
                  <div style={{height: 500, border: `1px solid grey`}}>
                    Saldo
                  </div>
                </TabContainer>
                <TabContainer>
                  <div style={{height: 500, border: `1px solid grey`}}>
                    Ranking
                  </div>
                </TabContainer>
                */}
              </SwipeableViews>

              <PerformedTasksDialogContainer
                enableMocks={enableMocks}
                isOpen={isPerformedTasksDialogOpen}
                performedTasks={performedTasks}
                performedTasksType={performedTasksType}
                onCancel={this.handleCancelPerformedTasksDialog}
                onClose={this.handleClosePerformedTasksDialog}
              />
            </React.Fragment>
          </MuiPickersUtilsProvider>
        </SnackbarProvider>
      </MuiThemeProvider>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(App)
