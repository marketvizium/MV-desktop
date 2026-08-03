<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Selecionar Cotação"
      subtitle="Selecione uma cotação fechada para consultar produtos adicionados."
    />

    <!-- GRID DE CARDS -->
    <div class="cards-wrapper">
      <div
        v-for="cotacao in cotacoesFechadas"
        :key="cotacao.id_cotacao"
        class="cotacao-card"
        @click="irParaAdicionarProdutos(cotacao)"
      >
        <div class="icon-box">
          <span class="material-symbols-outlined">
            inventory_2
          </span>
        </div>

        <div class="card-content">
          <h3>{{ cotacao.nome_cotacao }}</h3>

          <p>
            {{ formatarData(cotacao.inicio_cotacao) }}
            —
            {{ formatarData(cotacao.final_cotacao) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

export default {
  name: 'SelecionarCotacaoParaProdutos',

  components: {
    TitileSubtitle
  },

  data () {
    return {
      cotacoes: [],
      auth: null
    }
  },

  computed: {
    cotacoesFechadas () {
      return this.cotacoes.filter(
        c => c.status_cotacao === 'fechada'
      )
    }
  },

  methods: {
    async buscarCotacoes () {
      try {
        const response = await api.get(
          `/mvpu/cotacao/consultarCotacao/${this.auth.id_loja}`
        )

        this.cotacoes = response.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    irParaAdicionarProdutos (cotacao) {
      this.$router.push({
        name: 'ConsultaItensmain',
        query: {
          nome_cotacao: cotacao.nome_cotacao,
          id_cotacao: cotacao.id_cotacao,
          id_usuario: cotacao.id_usuario
        }
      })
    },

    formatarData (timestamp) {
      const date = new Date(Number(timestamp))
      return date.toLocaleString('pt-BR')
    }
  },

  mounted () {
    this.auth = useAuthStore()
    this.buscarCotacoes()
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
  font-family: 'Poppins', sans-serif;
}

/* GRID */
.cards-wrapper {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

/* CARD */
.cotacao-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: all 0.25s ease;
}

.cotacao-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

/* ÍCONE */
.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: #FF8049;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box span {
  color: #fff;
  font-size: 26px;
}

/* CONTEÚDO */
.card-content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-content p {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
}
</style>
