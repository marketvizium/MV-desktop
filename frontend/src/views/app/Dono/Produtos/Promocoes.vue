<template>
  <div class="totalPage">
    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">
      <cardOps
        icon="box"
        iconColor="#5A0F83"
        title="Promoção por produto"
        descricao="Adicione promoção por código de barras."
        route="PromocaoProdutos"
      />

      <cardOps
        icon="inventory_2"
        iconColor="#70640C"
        title="Promoção por lote"
        descricao="Adicione promoção em um lote específico."
        route="PromocaoLote"
      />

      <cardOps
        icon="search"
        iconColor="#0C4B70"
        title="Consultar promoções"
        descricao="Consulte as promoções ativas no sistema."
        route="ConsultaPromocoes"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  name: 'ConsultarProdutos',
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
