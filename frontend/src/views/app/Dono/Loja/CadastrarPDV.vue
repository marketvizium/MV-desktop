<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Cadastrar Dispositivo"
      subtitle="Cadastre um novo dispositivo informando os dados abaixo."
    />

    <!-- LINHA 1 -->
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop
          placeholder="Nome do dispositivo"
          v-model="dispositivo.nome"
        />
      </div>

      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop
          placeholder="Localização"
          v-model="dispositivo.localizacao"
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
        label="Cadastrar dispositivo"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        @click="cadastrarDispositivo"
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
import { Button } from 'primevue'

export default {
  name: 'CadastroDispositivo',

  components: {
    TitileSubtitle,
    inputDesktop,
    Button
  },

  data () {
    return {
      loading: false,
      auth: null,

      // CAMPOS VISÍVEIS AO USUÁRIO
      dispositivo: {
        nome: null,
        localizacao: null
      }
    }
  },

  methods: {
    limparTudo () {
      Object.keys(this.dispositivo).forEach(k => {
        this.dispositivo[k] = null
      })
    },

    async cadastrarDispositivo () {
      this.loading = true

      try {
        // validação básica
        if (!this.dispositivo.nome || !this.dispositivo.localizacao) {
          this.$toast.info('Preencha todos os campos obrigatórios')
          return
        }

        // 🔒 PAYLOAD FINAL CONTROLADO
        const payload = {
          id_dispositivo: 'boot',        // valor padrão
          nome: this.dispositivo.nome,
          localizacao: this.dispositivo.localizacao,
          status: 'manutencao'           // cliente não vê
        }

        console.log('Payload enviado:', payload)

        await api.post(`/mvpu/loja/terminal/cadastro/${this.auth.id_loja}`, payload)

        this.$toast.success('Dispositivo cadastrado com sucesso!')
        this.limparTudo()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
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
