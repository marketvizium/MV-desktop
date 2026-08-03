<template>
  <div class="total-page">
    <aside style="width: 40%;">
      <div style="padding: 20px;">
        <img src="../assets/img/logo.png" width="170px" alt="">
      </div>
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding-bottom: 100px;">
        <div class="poppins-extrabold" style="width: 100%; text-align: center;">
          <div style="color: #555; font-size: 30px;">
            <b>
              Login
            </b>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; width: 60%;">
          <InputText name="email" type="email" v-model="pacoteUsuario.email"  placeholder="Digite o seu email.." class="input-underline" />
          <Password v-model="pacoteUsuario.passe_usuario" :feedback="false" toggleMask placeholder="Digite a sua senha..." class="password-underline" />
        </div>

        <div style="width: 100%; display: flex; justify-content: center; margin-top: 40px;">
          <Button type="button" label="ENTRAR" class="poppins-bold btn-sbmt" :loading="loading" @click="Entrar" />
        </div>

      </div>
    </aside>
    <aside style="width: 60%; overflow: hidden; position: relative;">
      <div style="height: 100vh; width: 100%; background-color: rgba(0, 0, 0, 0.6); position: absolute; z-index: 5; display: flex; flex-direction: column;; justify-content: center; padding-top: 80px;" >

       
        <div style="padding-left: 30px; margin-bottom: 150px;">
          <div class="gloock-regular" style="color: #FFF; font-size: 50px;">
            Bem-vindo ao Marviz da <br>Market <span style="color: #FF8049;">Vizium
              
            </span>
          </div>
          <br>
          <div class="poppins-regular txt-ttl" style="color: #fff; font-size: 18px;" >
            Bem-vindo ao sistema de varejo omnichannel que automatiza seus processos e leva mais inteligência para a sua loja
          </div>
        </div>

      </div>
      <img src="../assets/img/market.png" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="">
    </aside>
  </div>
</template>

<script>

import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button';
import exibeErro from '@/utils/ExibeErro';
import { mapState } from 'pinia';

export default {
  name: 'HomeView',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  computed:{
    ...mapState(useAuthStore, ['user', 'id_loja'])
  },

  data(){
    return{
      pacoteUsuario:{
        email: "",
        passe_usuario: "",
      },
      loading: false
    }
  },

  components: {
    Password,
    InputText,
    Button
  },

  methods:{
    async Entrar(){
      try{

        this.loading = true
        const auth = useAuthStore()
        await auth.login(this.pacoteUsuario)

        this.$toast.success('Seja bem vindo!')
        this.loading = false

      }catch(e){
        this.loading = false
        exibeErro(e, this.$toast)

      }
    },
  },
  mounted(){

        const usuario = this.user

        console.log(usuario, "AAA")

        if(usuario){
          this.$router.push({name: 'DashboardCotacao'})
        }
    }
}
</script>

<style scoped>

.total-page {
  width: 100%;
  height: 100vh;
  display: flex;
}

/* PrimeVue Password - underline style */
:deep(.p-password input) {
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
  box-shadow: none;
  width: 100%;
}

/* Foco */
:deep(.p-password input:focus) {
  border-bottom-color: #FF8049;
  outline: none;
}


:deep(.input-underline) {
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
  margin-bottom: 30px;
  margin-top: 40px;
  box-shadow: none;
}

:deep(.input-underline:focus) {
  border-bottom-color: #FF8049;
  outline: none;
}

:deep(.p-inputtext.input-underline:enabled:focus) {
  border-bottom-color: #FF8049;
  
}


.btn-sbmt {
  width: 40%;
  height: 50px;
  color: #FFF; /* isso agora vai aplicar */
  background-color: #FF8049;
  border: none;
  font-size: 15px;
  transition: 0.5s;
  cursor: pointer;
}


.btn-sbmt:focus,
.btn-sbmt:active {
  background-color: #FF8049; /* mantém a cor original */
  outline: none; /* remove borda de foco azul ou verde */
  box-shadow: none;
}

:deep(.btn-sbmt.p-button),
:deep(.btn-sbmt.p-button:hover),
:deep(.btn-sbmt.p-button:focus),
:deep(.btn-sbmt.p-button:active) {
  background-color: #FF8049 !important; /* ou #ce673b se quiser hover */
  color: #FFF !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}


.btn-cad{
  background-color: transparent;
  border: solid 1px #FFF;
  color: #FFF;
  border-radius: 50px;
  height: 50px;
  width: 200px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.5s;
}

.btn-cad:hover{
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.5s;
}

@media (min-width: 1294px) {
  .txt-ttl{
    width: 646px;
  }
}

@media (max-width: 1293px) {
  .txt-ttl{
    padding-right: 20px;
  }
}

</style>
