<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Gestão de Estoque"
      subtitle="Acesse rapidamente as funcionalidades de estoque abaixo."
    />

    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">

      <cardOps
        icon="warning"
        iconColor="#F44336"
        title="Produtos Vencidos"
        descricao="Consulte todos os produtos já vencidos"
        route="ProdutosVencidos"
      />

      <cardOps
        icon="schedule"
        iconColor="#F9A825"
        title="Produtos Próximos de Vencer"
        descricao="Consulte produtos que estão próximos da data de validade"
        route="ProdutosProximosAlertas"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  name: 'ConsultarEstoquePage',
  components: {
    TitileSubtitle,
    cardOps,
  },
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
