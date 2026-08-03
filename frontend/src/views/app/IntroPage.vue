<template>
  <div class="totalPage">
    <div class="header-page">
      <img src="../../assets/img/logo.png" alt="">
    </div>
    <div class="tela-frase" v-if="!TelaForms">
      <div style="font-size: 50px; padding-bottom: 115px; padding-left: 30px; padding-right: 30px; text-align: center;" :class="{'ShowFrase': screen1, 'HideFrase': !screen1}">
        {{ frase }}
      </div>
    </div>
    <div v-else>
      <div v-if="forms1" :class="{'fade-in-forms': screen1, 'fade-out-forms': !screen1}">
        <div style="width: 100%; text-align: center;" class="poppins-bold">
          <div style="color: #555; font-size: 50px;">
            Cadastre sua loja
          </div>
          <div style="color: #555; font-size: 16px; margin-bottom: 40px;">
            Vamos começar pelos dados jurídicos?
          </div>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
          <input type="text"  placeholder="CNPJ (Somente números)" v-model="pacoteCadastroLoja.cnpj" maxlength="14" class="input_estilo">
          <input type="text" placeholder="NOME FANTASIA" :disabled="disabled_camps" v-model="pacoteCadastroLoja.nome_fantasia" class="input_estilo" :class="{'disabled_color': disabled_camps}">
          <input type="text" placeholder="RAZÃO SOCIAL" :disabled="disabled_camps" v-model="pacoteCadastroLoja.razao_social" class="input_estilo" :class="{'disabled_color': disabled_camps}">
          <input type="text" placeholder="INSCRIÇÃO ESTADUAL (Somente números - Opcional)" v-model="pacoteCadastroLoja.inscricao_estadual" class="input_estilo" :class="{'disabled_color': disabled_camps}">
        </div>


        <button class="btn-sbmt" :disabled="disabled_camps" @click="prosseg(1)">
          Prosseguir →
        </button>

      </div>
      <div v-if="forms2" :class="{'fade-in-forms': screen1, 'fade-out-forms': !screen1}">

        <div style="width: 100%; text-align: center;" class="poppins-bold">
          <div style="color: #555; font-size: 50px;">
            Cadastre sua loja
          </div>
          <div style="color: #555; font-size: 16px; margin-bottom: 40px;">
            Agora insira seus dados de endereço
          </div>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
          <input type="text" placeholder="CEP" v-model="pacoteCadastroLoja.cep" class="input_estilo">
          <input type="text" placeholder="CIDADE" v-model="pacoteCadastroLoja.cidade" class="input_estilo">
          <input type="text" placeholder="ESTADO" v-model="pacoteCadastroLoja.estado" class="input_estilo">
          <input type="text" placeholder="RUA" v-model="pacoteCadastroLoja.rua" class="input_estilo">
        </div>


        <button class="btn-sbmt" @click="prosseg(2)">
          Prosseguir →
        </button>

      </div>
      <div v-if="forms3" :class="{'fade-in-forms': screen1, 'fade-out-forms': !screen1}">
        <div style="width: 100%; text-align: center;" class="poppins-bold">
          <div style="color: #555; font-size: 50px;">
            Cadastre sua loja
          </div>
          <div style="color: #555; font-size: 16px; margin-bottom: 40px;">
            Agora insira seus dados de endereço
          </div>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
          <input type="text" placeholder="TELEFONE (Opcional)" v-model="pacoteCadastroLoja.telefone" class="input_estilo">
          <input type="text" placeholder="CELULAR" v-model="pacoteCadastroLoja.celular" class="input_estilo">
          <input type="text" placeholder="EMAIL DA EMPRESA" v-model="pacoteCadastroLoja.email_empresa" class="input_estilo">
        </div>


        <Button
          type="button"
          label="Concluir"
          class="poppins-bold btn-finish"
          :loading="loading"
          severity="contrast"
          @click="prosseg(3)"
        />

      </div>
      <div class="tela-frase" v-if="telaFinal">
        <div style="font-size: 50px; padding-bottom: 115px; padding-left: 30px; padding-right: 30px; height: 100%; width: 100%; justify-content: center;" :class="{'ShowFrase': screen1, 'HideFrase': !screen1}">
          {{ frase }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import router from '@/router';
import { api } from '@/services/api';
import axios from 'axios';
import Button from 'primevue/button';


export default {
    name:'IntroPage',
    components:{
      Button,
    },
    data(){
      return{
        screen1: false,
        TelaForms: false,
        disabled_camps: true,
        telaFinal: false,
        forms1: false ,
        forms2: false,
        forms3: false,
        frase:  "",
        loading: false,
        pacoteCadastroLoja: {
          cnpj: null,
          nome_fantasia : null,
          razao_social: null,
          telefone : null,
          celular: null,
          email_empresa: null,
          rua: null,
          cidade: null,
          estado: null,
          cep:null,
          cod_login: null,
          inscricao_estadual: null
        }
      }
    },

    watch:{
      'pacoteCadastroLoja.cnpj': {
        handler(novoCnpj) {
          if (!novoCnpj) return;

          if (novoCnpj.length === 14) {

            const arrayCNPJ = novoCnpj.split("")
            let erro = false

            arrayCNPJ.forEach(caracter=>{
              if(isNaN(parseInt(caracter))){
                this.$toast.info('MSG: CNPJ fora do padrão. Por favor, digite apenas números...')
                erro = true
                return
              }
            })
            if(!erro){
              this.validarCNPJ(novoCnpj)
            }

          }
        },
      }
    },


    methods:{
      async prosseg(pagina){
        if(pagina==1){
          if(this.pacoteCadastroLoja.cnpj == null || this.pacoteCadastroLoja.cnpj.length < 14){
            this.$toast.info('MSG: CNPJ inexistente ou fora de padrão')
            return
          }

          if(this.pacoteCadastroLoja.nome_fantasia == null || this.pacoteCadastroLoja.nome_fantasia == ""){
            this.$toast.info('MSG: Nome fantasia precisa ser preenchido')
            return
          }

          this.screen1 = false

          setTimeout(()=>{
            this.forms1 = false
            this.forms2 = true
            setTimeout(()=>{
              this.screen1 = true
            },500)
          },1000)

        }else if(pagina == 2){

          if(this.pacoteCadastroLoja.cidade == null || this.pacoteCadastroLoja.cidade == "" || 
            this.pacoteCadastroLoja.rua == null || this.pacoteCadastroLoja.rua == "" || 
            this.pacoteCadastroLoja.estado == null || this.pacoteCadastroLoja.estado == "" || 
            this.pacoteCadastroLoja.cep == null || this.pacoteCadastroLoja.cep == ""
          ){
            this.$toast.info('MSG: Todos os dados de endereço precisam estar preenchidos')
            return
          }

          this.screen1 = false

          setTimeout(()=>{
            this.forms2 = false
            this.forms3 = true
            setTimeout(()=>{
              this.screen1 = true
            },500)
          },1000)

        }else if(pagina == 3){
          if(this.pacoteCadastroLoja.email_empresa == null || this.pacoteCadastroLoja.email_empresa == "" || 
            this.pacoteCadastroLoja.celular == null || this.pacoteCadastroLoja.celular == ""
          ){
            this.$toast.info('MSG: Todos os dados de contato precisam estar preenchidos')
            return
          }

          const cod_login_ts     = Date.now()
          const string_cod_login = toString(cod_login_ts).split("")
          const hashDefault      = `a%fa${string_cod_login[string_cod_login.length-1]}${string_cod_login[string_cod_login.length-2]}${string_cod_login[string_cod_login.length-3]}e9x`
          this.pacoteCadastroLoja.cod_login = hashDefault


          //Fazer requisição aquii
          this.loading = true

          
          api.post('/mvpu/usuario/criarLoja', this.pacoteCadastroLoja)
            .then((resposta)=>{
              this.loading = false

              this.screen1 = false

              setTimeout(()=>{
                this.forms3    = false
                this.TelaForms = false
                this.frase     = "Tudo pronto. Aproveite!"
                setTimeout(()=>{
                  this.screen1 = true
                  setTimeout(()=>{
                    this.screen1 = false
                    setTimeout(()=>{
                      router.push({name: 'Dashboard'})
                    },2000)
                  },3000)
                },500)
              },1000)

            }).catch((e)=>{

              if(e.response){
                this.$toast.error('Erro no cadastro da loja.', e.response.data.COD, e.response.data.MSG)
                this.loading = false
                this.screen1 = false
                setTimeout(()=>{
                  this.forms3 = false
                  this.forms1 = true
                  setTimeout(()=>{
                    this.screen1 = true
                  })
                },1000)
              }

            })
          
        }

      },

      async validarCNPJ(cnpj){

        
          const cnpjURL = `https://api.cnpja.com/office/${cnpj}`

        
          //Realizar requisição para verificar se o CNPJ é verdadeiro////
          const statusCNPJ = await axios.get(cnpjURL, { headers:{
              'Authorization':'318f4cf8-32e4-4399-a005-e83a46b90eed-7322ee11-2635-430d-9569-ba384b754065'
          }})
              .then((resposta)=>{
                this.disabled_camps = false
                return resposta
                  // Área de logs
              }).catch((e)=>{       
                  console.log(e, 'ERRO')
                  return 'erro'
              })
              
          
          //Caso der erro
          if(statusCNPJ == 'erro'){
            this.$toast.info('MSG: CNPJ inexistente')  
            return
          }


          this.pacoteCadastroLoja.razao_social  = statusCNPJ.data.company.name
          this.pacoteCadastroLoja.nome_fantasia = statusCNPJ.data.alias
          this.pacoteCadastroLoja.cidade        = statusCNPJ.data.address.city
          this.pacoteCadastroLoja.estado        = statusCNPJ.data.address.state
          this.pacoteCadastroLoja.rua           = statusCNPJ.data.address.street
          this.pacoteCadastroLoja.cep           = statusCNPJ.data.address.zip

          if(statusCNPJ.data.phones.length > 0){
            this.pacoteCadastroLoja.celular       = statusCNPJ.data.phones[0].number
          }

          if(statusCNPJ.data.emails.length > 0){
            this.pacoteCadastroLoja.email_empresa = statusCNPJ.data.emails[0].address
          }
      }
    },

    mounted(){

      this.frase   = 'Olá.'

      setTimeout(()=>{
        this.screen1 = true

        setTimeout(()=>{
          this.screen1 = false
          setTimeout(()=>{
            this.frase   = 'Seja bem-vindo!'
            setTimeout(()=>{
              this.screen1 = true

              setTimeout(()=>{
                this.screen1 = false

                setTimeout(()=>{
                  this.frase = 'Ficamos felizes por confiar em nossos serviços.'

                  setTimeout(()=>{
                    this.screen1 = true

                    setTimeout(()=>{
                      this.screen1 = false

                      setTimeout(()=>{
                        this.frase = 'Confira a solução que irá impulsionar seu negócio.'
                        setTimeout(()=>{
                          this.screen1 = true

                          setTimeout(()=>{
                            this.screen1 = false

                            setTimeout(()=>{
                              this.frase = 'Vamos começar?'
                              setTimeout(()=>{
                                this.screen1 = true

                                setTimeout(()=>{
                                  this.screen1 = false
                                  setTimeout(()=>{
                                    this.TelaForms = true

                                    setTimeout(()=>{
                                      this.forms1    = true
                                      setTimeout(()=>{
                                        this.screen1 = true
                                      }, 500)
                                    },1000)
                                  },1000)
                                },2700)
                              },1000)
                            }, 1000)
                          },2700)
                        },1000)
                      },1000)
                    }, 2700)
                  },1000)
                },1000)
              },1500)
            },500)
          },1000)
        },1500)
      }, 500)
    }
}
</script>

<style scoped>
.totalPage{
  width: 100%;
  height: 100vh;
}

.header-page{
  width: 100%;
  padding: 20px;
}

.tela-frase{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.HideFrase{
  opacity: 0;
  transform: translateY(15px);
  transition: 1s;
}

.ShowFrase{
  opacity: 1;
  transform: translateY(0px);
  transition: 1s;
}


.fade-in-forms{
  opacity: 1;
  transition: 1s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 115px;
}

:deep(.input-underline) {
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
  margin-bottom: 30px;
  margin-top: 40px;
  box-shadow: none;
}

.fade-out-forms{
  opacity: 0;
  transition: 1s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 115px;
}

.input_estilo{
  width: 30%;
  height: 52px;
  background-color: transparent;
  border: solid 1px #CCC;
  color: #555;
  padding-left: 15px;
  border-radius: 52px;
  margin-bottom: 15px;
  font-size: 16px;
}

.btn-sbmt {
  width: 15%;
  margin-top: 30px;
  height: 50px;
  color: #FFF; /* isso agora vai aplicar */
  background-color: #FF8049;
  border: none;
  font-size: 15px;
  transition: 0.5s;
  cursor: pointer;
}

.disabled_color{
  background-color: #EEE;
}

.btn-finish {
  width: 15%;
  height: 50px;
  color: #FFF; /* isso agora vai aplicar */
  background-color: #FF8049;
  border: none;
  font-size: 15px;
  transition: 0.5s;
  cursor: pointer;
}


.btn-finish:focus,
.btn-finish:active {
  background-color: #FF8049; /* mantém a cor original */
  outline: none; /* remove borda de foco azul ou verde */
  box-shadow: none;
}

:deep(.btn-finish.p-button),
:deep(.btn-finish.p-button:hover),
:deep(.btn-finish.p-button:focus),
:deep(.btn-finish.p-button:active) {
  background-color: #FF8049 !important; /* ou #ce673b se quiser hover */
  color: #FFF !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.btn-finish.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}


</style>
