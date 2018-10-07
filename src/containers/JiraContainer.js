import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableFooter from '@material-ui/core/TableFooter'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import RefreshIcon from '@material-ui/icons/Refresh'
import TableWrapper from '../components/TableWrapper'
import ProblemMessage from '../components/ProblemMessage'
import wrappedAxios from '../wrappers/axios'

const initialState = {
  issues: [],
  totalUst: undefined,
  isIssuesLoading: false,
  thereIsServerError: false,
  page: 0,
  rowsPerPage: 5,
}

class JiraContainer extends Component {
  state = initialState

  componentDidMount = () => {
    this.loadIssues()
  }

  loadIssues = () => {
    const enableMocks = this.props.enableMocks || false
    const issuesPromise = enableMocks ? this.getMockedIssues() : this.getIssues()

    this.setState({isIssuesLoading: true})

    return issuesPromise
      .then(({issues, totalUst}) => {
        this.setState({
          issues,
          totalUst,
          thereIsServerError: false,
        })
      })
      .catch(reason => {
        this.setState({
          thereIsServerError: true,
        })

        console.log(reason)
      })
      .then(() => this.setState({isIssuesLoading: false}))
  }

  getIssues = () => {
    return wrappedAxios
      .get(`/issues`)
      .then(response => {
        return {
          issues: response.data.issues,
          totalUst: response.data.total_ust,
        }
      })
  }

  getMockedIssues = () => {
    return new Promise(resolve => {
      const issues = [
        {ticket: `AR-0001`, summary: `Foo`, type: `bug`,          ust: 1},
        {ticket: `AR-0002`, summary: `Bar`, type: `demanda_lean`, ust: 2},
        {ticket: `AR-0003`, summary: `Baz`, type: `pleito`,       ust: 3},
        {ticket: `AR-0004`, summary: `Qux`, type: `pleito`,       ust: 4},
        {ticket: `AR-0005`, summary: `Fzz`, type: `manutencao`,   ust: 5},
        {ticket: `AR-0006`, summary: `Xpt`, type: `demanda_lean`, ust: 6},
      ]

      const reducer = (accumulator, currentVal) => accumulator + currentVal.ust
      const totalUst = issues.reduce(reducer, 0)

      setTimeout(() => resolve({issues, totalUst}), 500)
    })
  }

  handleClickReload = () => {
    this.setState(initialState, this.loadIssues)
  }

  handleDragIssueStart = (onDragIssueStart, issue) => event => {
    onDragIssueStart(event, issue)
  }

  handleDragIssueEnd = (onDragIssueEnd, issue) => event => {
    onDragIssueEnd(event, issue)
  }

  handleChangePage = (event, page) => {
    this.setState({
      page,
    })
  }

  handleChangeRowsPerPage = event => {
    this.setState({
      rowsPerPage: parseInt(event.target.value, 10),
    })
  }

  render = () => {
    const {
      issues,
      totalUst,
      thereIsServerError,
      isIssuesLoading,
      page,
      rowsPerPage,
    } = this.state

    const {
      onDragIssueStart,
      onDragIssueEnd,
    } = this.props

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, issues.length - page * rowsPerPage)

    return (
      <Paper>
        <Toolbar>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={10}>
              <Typography variant="h6" noWrap>
                Jira
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Grid container direction="row" justify="flex-end" alignItems="center">
                <Grid item>
                  <Tooltip title="Reload" onClick={this.handleClickReload}>
                    <div>
                      <IconButton color="secondary" disabled={isIssuesLoading}>
                        <RefreshIcon />
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
                <TableCell>Ticket</TableCell>
                <TableCell>Atividade</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>UST's</TableCell>
              </TableRow>
            </TableHead>
            {
              !isIssuesLoading && 0 < issues.length &&
              <TableFooter>
                <TableRow key={`record-total-time`}>
                  <TableCell colSpan={3}></TableCell>
                  <TableCell>{totalUst}</TableCell>
                </TableRow>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    colSpan={4}
                    count={issues.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    labelRowsPerPage="Linhas p/ pág."
                    labelDisplayedRows={labelRows => `${labelRows.from}-${labelRows.to} de ${labelRows.count}`}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            }
            <TableBody>
              {
                isIssuesLoading &&
                <TableRow>
                  <TableCell colSpan={4}>
                    <em>Carregando...</em>
                  </TableCell>
                </TableRow>
              }
              {
                !isIssuesLoading && thereIsServerError &&
                <TableRow>
                  <TableCell colSpan={4}>
                    <ProblemMessage>
                      Houve um problema ao obter issues do Jira.
                    </ProblemMessage>
                  </TableCell>
                </TableRow>
              }
              {
                !isIssuesLoading && !thereIsServerError && 0 === issues.length &&
                <TableRow>
                  <TableCell colSpan={4}>
                    <em>Nenhuma atividade neste mês.</em>
                  </TableCell>
                </TableRow>
              }
              {
                !isIssuesLoading && !thereIsServerError && 0 < issues.length &&
                issues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(issue =>
                    <TableRow key={issue.ticket}>
                      <TableCell>
                        <Chip
                          draggable
                          style={{cursor: `move`}}
                          color="primary"
                          label={issue.ticket}
                          onDragStart={this.handleDragIssueStart(onDragIssueStart, issue)}
                          onDragEnd={this.handleDragIssueEnd(onDragIssueEnd, issue)}
                        />
                      </TableCell>
                      <TableCell style={{maxWidth: 200}}>
                        <Typography variant="inherit" noWrap>
                          {issue.summary}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {issue.type}
                      </TableCell>
                      <TableCell>
                        {issue.ust}
                      </TableCell>
                    </TableRow>
                  )
              }
              {
                !isIssuesLoading && 0 < issues.length && 0 < emptyRows &&
                <TableRow style={{height: 48 * emptyRows}}>
                  <TableCell colSpan={4} />
                </TableRow>
              }
            </TableBody>
          </Table>
        </TableWrapper>
      </Paper>
    )
  }
}

JiraContainer.propTypes = {
  enableMocks: PropTypes.bool,
  onDragIssueStart: PropTypes.func.isRequired,
  onDragIssueEnd: PropTypes.func.isRequired,
}

export default JiraContainer
