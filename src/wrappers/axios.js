import axios from 'axios'

export default axios.create({
  baseURL: `http://launcher-app:8888/`,
})
