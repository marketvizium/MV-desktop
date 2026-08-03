<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Localizar Produto"
      subtitle="Digite o código de barras do produto para consultar sua localização no estoque."
    />

    <!-- INPUT -->
    <div style="width: 100%; margin-top: 20px;">
      <inputDesktop
        placeholder="Código de barras do produto"
        v-model="codigo_barra"
      />
    </div>

    <!-- BOTÃO -->
    <div style="margin-top: 20px; display: flex;">
      <Button
        label="Localizar produto"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        @click="localizarProduto"
      />
    </div>

    <!-- MODAL PRIMEVUE -->
    <Dialog
      v-model:visible="modalVisivel"
      header="Localização do Produto"
      modal
      :style="{ width: '450px' }"
      style="font-family: 'Poppins';"
    >
      <div v-if="produto">
        <p><strong>Nome:</strong> {{ produto.nome }}</p>
        <p><strong>Código de Barras:</strong> {{ produto.codigo_barra }}</p>
        <p><strong>Gôndula (Estoque):</strong> {{ produto.gondula_estoque }}</p>
        <p><strong>Gôndula (Loja):</strong> {{ produto.gondula_loja }}</p>
        <p>
          <strong>Preço de Venda:</strong>
          R$ {{ Number(produto.preco_venda).toFixed(2) }}
        </p>
      </div>

      <template #footer>
        <Button
          label="Fechar"
          style="background-color: #ff8049; border: none;"
          @click="modalVisivel = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import inputDesktop from '@/components/inputDesktop.vue'
import { Button } from 'primevue'
import Dialog from 'primevue/dialog'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

export default {
  name: 'LocalizarProduto',

  components: {
    TitileSubtitle,
    inputDesktop,
    Button,
    Dialog
  },

  data() {
    return {
      codigo_barra: null,
      loading: false,
      modalVisivel: false,
      produto: null,
      auth: null
    }
  },

  methods: {
    async localizarProduto() {
      if (!this.codigo_barra) {
        this.$toast.info('Informe o código de barras do produto')
        return
      }

      this.loading = true

      const payload = {
        id_loja      : this.auth.id_loja,
        codigo_barra : this.codigo_barra
      }

      try {
        const response = await api.post(
          `/mvpu/estoque/localizaProd/`,
          payload
        )

        this.produto = response.data.data
        this.modalVisivel = true
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    this.auth = useAuthStore()
  }
}
</script>

<style scoped>
.totalPage {
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

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
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}
</style>
