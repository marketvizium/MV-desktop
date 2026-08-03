<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Cadastrar Loja"
      subtitle="Cadastre uma nova loja no sistema preenchendo os dados abaixo."
    />

    <!-- LINHA 1 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="CNPJ"
          maxlength="14"
          v-model="loja.cnpj"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Nome fantasia"
          v-model="loja.nome_fantasia"
        />
      </div>
    </div>

    <!-- LINHA 2 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Razão social"
          v-model="loja.razao_social"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Email da empresa"
          v-model="loja.email_empresa"
        />
      </div>
    </div>

    <!-- LINHA 3 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Celular"
          maxlength="11"
          v-model="loja.celular"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Telefone (opcional)"
          v-model="loja.telefone"
        />
      </div>
    </div>

    <!-- LINHA 4 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Rua"
          v-model="loja.rua"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="CEP"
          maxlength="8"
          v-model="loja.cep"
        />
      </div>
    </div>

    <!-- LINHA 5 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Cidade"
          v-model="loja.cidade"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Estado"
          v-model="loja.estado"
        />
      </div>
    </div>

    <!-- LINHA 6 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Código de login da loja (senha)"
          type="password"
          v-model="loja.cod_login"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Inscrição estadual (opcional)"
          v-model="loja.inscricao_estadual"
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

      loja: {
        cnpj: null,
        nome_fantasia: null,
        razao_social: null,
        telefone: null,
        celular: null,
        email_empresa: null,
        rua: null,
        cidade: null,
        estado: null,
        cep: null,
        cod_login: null,
        inscricao_estadual: null
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
        const obrigatorios = [
          'cnpj',
          'nome_fantasia',
          'razao_social',
          'celular',
          'email_empresa',
          'rua',
          'cidade',
          'estado',
          'cep',
          'cod_login'
        ]

        for (const campo of obrigatorios) {
          if (!this.loja[campo]) {
            this.$toast.info('Preencha todos os campos obrigatórios')
            return
          }
        }

        const payload = {
          ...this.loja,
          telefone: this.loja.telefone || null,
          inscricao_estadual: this.loja.inscricao_estadual || null
        }

        console.log(payload)

        await api.post('/mvpu/usuario/criarLoja', payload)

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
