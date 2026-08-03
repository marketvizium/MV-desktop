const axios = require('axios')
const Store                           = require('electron-store')      //Chama a classe store para persistencia de dados
const store                           = new Store()                    //Instância da Sotre para persistencia de dados
const https                           = require('https')

const dev  = "http://localhost:8081"
const prod = "https://market-vizium.cloud"

const api = axios.create({
  baseURL: prod,
  headers: {
    'Content-Type': 'application/json',
    'mx54oivbd8a6x2fd89456plms9v72a64': 'ap984xp3DOsS5f4a1sZkpOi47135LmNO'
  },
  timeout: 5000,
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('[API ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data
      })
    } else if (error.request) {
      console.error('[API NO RESPONSE]', error.request)
    } else {
      console.error('[API SETUP ERROR]', error.message)
    }

    return Promise.reject(error)
  }
)

api.interceptors.request.use(config => {
  const token = store.get('token') // ou da sua store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

module.exports = {
    api
}
