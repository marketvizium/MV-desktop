<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Gestão de Estoque"
      subtitle="Acesse rapidamente as funcionalidades de estoque abaixo."
    />

    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">

      <cardOps
        icon="input"
        iconColor="#2E7D32"
        title="Consultar Entradas"
        descricao="Consulte as entradas no estoque"
        route="ConsultarEntradas"
        v-if="show"
      />

      <cardOps
        icon="output"
        iconColor="#D32F2F"
        title="Consultar Saídas"
        descricao="Consulte as saídas do estoque"
        route="ConsultarSaidas"
        v-if="show"
      />

      <cardOps
        icon="inventory"
        iconColor="#5A0F83"
        title="Consultar Produtos"
        descricao="Consulte produtos em estoque"
        route="ConsultarProdutosEstoque"
      />

      <cardOps
        icon="warning"
        iconColor="#F9A825"
        title="Próximos e Vencidos"
        descricao="Consulte produtos próximo de vencer e vencidos"
        route="ProdutosProximosVencimento"
      />

      <cardOps
        icon="tv_options_edit_channels"
        iconColor="#EF6C00"
        title="Console do estoque"
        descricao="Veja giros, estoque mínimo, e outras análises..."
        route="consoleEstoque"
      />

      <cardOps
        icon="search"
        iconColor="#0288D1"
        title="Localizar Produto"
        descricao="Localize um produto na loja"
        route="LocalizarProduto"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'ConsultarEstoquePage',
  components: {
    TitileSubtitle,
    cardOps,
  },
  data(){
    return{
      auth: null,
      show: false
    }
  },

  beforeMount(){
    this.auth = useAuthStore()

    if(this.auth.usuario.nivel == 1){
      this.show = true
    }

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

/* GRID DOS CARDS */
.cards-wrapper {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}
</style>
