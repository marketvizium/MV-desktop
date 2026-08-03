import './assets/main.css'
import './assets/fonts.css'

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { toastService } from './services/toast'
import { useAuthStore } from './stores/auth'
import 'material-symbols'


const app = createApp(App)
app.use(createPinia())
const authStore = useAuthStore()   
authStore.decodeToken()          //Pego o token decodifico e armazeno em user
authStore.hydrate()              //Reidrato a função de armazenamento de id_loja


import router from './router'
app.use(router)

app.config.globalProperties.$router = router;

app.use(PrimeVue, {
    theme: {
        preset: Aura
    },
    
    locale: {
        firstDayOfWeek: 0,
        dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
        dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        monthNames: [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ],
        monthNamesShort: [
        'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
        'jul', 'ago', 'set', 'out', 'nov', 'dez'
        ],
        today: 'Hoje',
        clear: 'Limpar'
    }
});

app.use(ToastService)
app.component('Toast', Toast)
app.config.globalProperties.$toast = toastService


app.mount('#app')
