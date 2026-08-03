<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Cadastrar Loja"
      subtitle="Cadastre uma nova loja informando os dados abaixo."
    />

    <!-- LINHA 1 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Nome da loja"
          v-model="loja.nome"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Descrição"
          v-model="loja.descricao"
        />
      </div>
    </div>

    <!-- LINHA 2 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%;">
        <inputDesktop
          placeholder="CEP"
          v-model="loja.cep"
        />
      </div>
    </div>

    <!-- AÇÕES -->
    <div style="display: flex; margin-top: 20px;">
      <button
        @click="limparTudo"
        style="width: 100%; margin-right: 8px; background-color: #888; color: #FFF; border-radius: 5px; border: none; height: 50px; cursor: pointer;"
      >
        Limpar tudo
      </button>

      <Button
        type="button"
        label="Cadastrar loja"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        @click="cadastrarLoja"
      />
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import inputDesktop from '@/components/inputDesktop.vue'
import { api } from '@/services/api'
import exibeErro from '@/utils/ExibeErro'
import { Button } from 'primevue'

export default {
  name: 'CadastroLoja',

  components: {
    TitileSubtitle,
    inputDesktop,
    Button
  },

  data () {
    return {
      loading: false,

      // CAMPOS VISÍVEIS AO USUÁRIO
      loja: {
        nome: null,
        descricao: null,
        cep: null
      }
    }
  },

  methods: {
    limparTudo () {
      Object.keys(this.loja).forEach(k => {
        this.loja[k] = null
      })
    },

    async cadastrarLoja () {
      this.loading = true

      try {
        // validação básica
        if (!this.loja.nome || !this.loja.descricao || !this.loja.cep) {
          this.$toast.info('Preencha todos os campos obrigatórios')
          return
        }

        const payload = {
          nome: this.loja.nome,
          descricao: this.loja.descricao,
          cep: this.loja.cep
        }

        console.log('Payload enviado:', payload)

        await api.post(`/mvpu/loja/cadastro`, payload)

        this.$toast.success('Loja cadastrada com sucesso!')
        this.limparTudo()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.totalPage{
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* === TODO O CSS ORIGINAL MANTIDO === */

:deep(.btn-sbmt.p-button),
:deep(.btn-sbmt.p-button:hover),
:deep(.btn-sbmt.p-button:focus),
:deep(.btn-sbmt.p-button:active) {
  background-color: #FF8049 !important;
  color: #FFF !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  cursor: pointer;
  width: 100%;
  margin-left: 8px;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}
</style>
