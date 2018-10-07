import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ProblemMessage from '../components/ProblemMessage'
import wrappedAxios from '../wrappers/axios'

const initialState = {
  isUserInfoLoading: false,
  thereIsServerError: false,
  currentUser: undefined,
}

class UserContainer extends Component {
  state = initialState

  componentDidMount = () => {
    this.loadUser()
  }

  loadUser = () => {
    const enableMocks = this.props.enableMocks || false
    const userPromise = enableMocks ? this.getMockedUserInfo() : this.getUserInfo()

    this.setState({isUserInfoLoading: true})

    return userPromise
      .then(currentUser => {
        const pisFormattedCurrentUser = {
          ...currentUser,
          pis: currentUser.pis.replace(/(\d{3,4})(\d{4})(\d{3})(\d)/, `$1.$2.$3-$4`)
        }

        this.setState({
          currentUser: pisFormattedCurrentUser,
          thereIsServerError: false,
        })
      })
      .catch(reason => {
        this.setState({
          thereIsServerError: true,
        })

        console.log(reason)
      })
      .then(() => this.setState({isUserInfoLoading: false}))
  }

  getMockedUserInfo = () => {
    return new Promise(resolve => {
      const currentUser = {
        ip_address: `10.20.132.99`,
        pis: `012869029944`,
        datainfo_username: `data52360`,
        itamaraty_username: `hallison.boaventura`,
      }

      setTimeout(() => resolve(currentUser), 500)
    })
  }

  getUserInfo = () => {
    return wrappedAxios
      .get(`/me`)
      .then(response => response.data.me)
  }

  render = () => {
    const {
      isUserInfoLoading,
      currentUser,
      thereIsServerError,
    } = this.state

    return (
      <span>
        {
          isUserInfoLoading &&
          <span>Carregando...</span>
        }
        {
          !isUserInfoLoading && thereIsServerError &&
          <ProblemMessage>
            Houve um problema ao obter informações do usuário.
          </ProblemMessage>
        }
        {
          !isUserInfoLoading && !thereIsServerError && 'object' === typeof currentUser &&
          <span>
            <strong>{currentUser.ip_address}</strong>
            <span> • </span>
            <strong>{currentUser.pis}</strong>
            <span> • </span>
            <strong>{currentUser.datainfo_username}</strong>
            <span> • </span>
            <strong>{currentUser.itamaraty_username}</strong>
          </span>
        }
      </span>
    )
  }
}

UserContainer.propTypes = {
  enableMocks: PropTypes.bool,
}

export default UserContainer
