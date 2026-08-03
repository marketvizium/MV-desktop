<template>
  <div class="totalPage">

    <TitileSubtitle
      title="Cadastro de indústria"
      subtitle="Digite o CNPJ para buscar automaticamente os dados do fabricante."
    />

    <!-- CNPJ -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%;">
        <inputDesktop
          placeholder="CNPJ"
          data-maska="##.###.###/####-##"
          v-maska
          v-model="fornecedor_detalhes.cnpj"
        />
      </div>
    </div>

    <!-- Dados do fornecedor -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Nome do fabricante"
          v-model="fornecedor_detalhes.nome_fornecedor"
          :disabled="inputsDisabled"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Razão social"
          v-model="fornecedor_detalhes.razao_social"
          :disabled="inputsDisabled"
        />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Nome Fantasia"
          v-model="fornecedor_detalhes.nome_fantasia"
          :disabled="inputsDisabled"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Email principal"
          v-model="fornecedor_detalhes.email_principal"
          :disabled="inputsDisabled"
        />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%;">
        <inputDesktop
          placeholder="Telefone principal"
          v-model="fornecedor_detalhes.telefone_principal"
          :disabled="inputsDisabled"
        />
      </div>
    </div>

    <!-- Botões -->
    <div style="display: flex; margin-top: 20px;">

      <button
        @click="limparTudo"
        style="width: 100%; margin-right: 8px; background-color: #888; color: #FFF; border-radius: 5px; border: none; height: 50px; cursor: pointer;"
      >
        Limpar tudo
      </button>

      <Button
        label="Cadastrar fornecedor"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        @click="cadastrarFornecedor"
      />

    </div>

  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue'
import inputDesktop from '@/components/inputDesktop.vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import { vMaska } from 'maska/vue'
import { Button } from 'primevue'

export default {

  name: 'CadastroFornecedor',

  directives: {
    maska: vMaska
  },

  components: {
    TitileSubtitle,
    inputDesktop,
    Button
  },

  data(){
    return{

      loading:false,
      auth:null,

      inputsDisabled:true,
      buscandoCNPJ:false,

      fornecedor_detalhes:{
        email_principal:null,
        nome_fantasia:null,
        razao_social:null,
        telefone_principal:null,
        nome_fornecedor:null,
        cnpj:null,
        status:'ativo'
      }

    }
  },

  watch:{

    async 'fornecedor_detalhes.cnpj'(valor){

      if(!valor) return

      const cnpjLimpo = valor.replace(/\D/g,'')

      if(cnpjLimpo.length === 14 && !this.buscandoCNPJ){

        this.buscandoCNPJ = true

        await this.buscarFornecedorPorCNPJ(cnpjLimpo)

        this.buscandoCNPJ = false
      }

    }

  },

  methods:{

    async buscarFornecedorPorCNPJ(cnpj){

      console.log(cnpj)

      try{
        const resp = await api.get(`/mvpu/produto/buscarIndustria/${cnpj}`)

        if(resp.data){

          const fornecedor = resp.data.body.data
          console.log(fornecedor)

          this.fornecedor_detalhes.nome_fornecedor = fornecedor.company.name
          this.fornecedor_detalhes.nome_fantasia = fornecedor.alias
          this.fornecedor_detalhes.razao_social = fornecedor.company.name

          if(fornecedor.phones.length>0)
            this.fornecedor_detalhes.telefone_principal = fornecedor.phones[0].number

          if(fornecedor.emails.length>0)
            this.fornecedor_detalhes.email_principal = fornecedor.emails[0].address

          this.inputsDisabled = true

          this.$toast.success('Fornecedor encontrado automaticamente')

        }else{

          this.inputsDisabled = false
          this.$toast.info('Fornecedor não encontrado. Preencha manualmente.')

        }

      }catch(e){

        console.log(e)

        this.inputsDisabled = false
        this.$toast.info('Fornecedor não encontrado. Preencha manualmente.')

      }

    },

    limparTudo(){

      this.fornecedor_detalhes={
        email_principal:null,
        nome_fantasia:null,
        razao_social:null,
        telefone_principal:null,
        nome_fornecedor:null,
        cnpj:null,
        status:'ativo'
      }

      this.inputsDisabled=true

    },

    async cadastrarFornecedor(){

      try{

        if(
          !this.fornecedor_detalhes.cnpj ||
          !this.fornecedor_detalhes.nome_fornecedor
        ){
          this.$toast.info('Preencha os dados obrigatórios')
          return
        }

        this.loading=true

        //const status_rede = await window.electronAPI.getStatusRede()
        //const status_rede = false

        await api.post(
          `/mvpu/produto/cadastrarFornecedor/${this.auth.id_loja}`,
          this.fornecedor_detalhes
        )
        
        //if(status_rede){
        //}else{
        //
        //  this.fornecedor_detalhes['id_loja'] = this.auth.id_loja
        //
        //  const obj = JSON.parse(
        //      JSON.stringify(this.fornecedor_detalhes)
        //    )
        //    
        //  const resposta = await window.electronAPI.setCadastroFornecedores(obj)
        //
        //  if(resposta.erro == 'INDUSTRIA_JA_CADASTRADA'){
        //    this.$toast.info('Industria já cadastrada anteriormente')
        //    return
        //  }
        //
        //  if(resposta.erro == 'DADOS_FALTANTES'){
        //    this.$toast.info('Faltam preencher dados obrigatórios')
        //    return
        //  }
        //}

        this.$toast.success('Industria cadastrada com sucesso')

        this.limparTudo()

      }catch(e){

        exibeErro(e,this.$toast)

      }finally{

        this.loading=false

      }

    }

  },

  mounted(){

    this.auth = useAuthStore()

  }

}

</script>

<style scoped>

.totalPage{
  width:100%;
  height:100vh;
  padding:20px;
  display:flex;
  flex-direction:column;
}

:deep(.btn-sbmt.p-button),
:deep(.btn-sbmt.p-button:hover),
:deep(.btn-sbmt.p-button:focus),
:deep(.btn-sbmt.p-button:active) {
  background-color:#FF8049 !important;
  color:#FFF !important;
  border:none !important;
  outline:none !important;
  box-shadow:none !important;
  cursor:pointer;
  width:100%;
  margin-left:8px;
}

:deep(.btn-sbmt.p-button:hover){
  background-color:#ce673b;
  transition:0.5s;
}

</style>