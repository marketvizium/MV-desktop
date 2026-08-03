import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //baseURL: 'https://market-vizium.cloud/',
  headers: {
    'Content-Type': 'application/json',
    'mx54oivbd8a6x2fd89456plms9v72a64': 'ap984xp3DOsS5f4a1sZkpOi47135LmNO'
  },
  timeout: 10000,
  
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {

      if(router.currentRoute.value.fullPath!= '/'){

        console.log(router.currentRoute.value.fullPath)

        const auth = useAuthStore()
        
        if(error.response.data){

          if(error.response.data.body){

            if(error.response.data.body.COD == '32'){
              auth.logout()
              router.push('/')
            }

          }
        }
      }

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
  const token = localStorage.getItem('token') // ou da sua store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
