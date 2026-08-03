<template>
  <div class="totalPage">
    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">
      <cardOps
        icon="point_of_sale"
        iconColor="#5A0F83"
        title="Cadastrar novo PDV"
        descricao="Cadastre um novo PDV para vendas."
        route="CadastrarPDV"
      />

      <cardOps
        icon="search"
        iconColor="#082E5D"
        title="Consultar PDVs"
        descricao="Consultar todos os PDVs da loja."
        route="ConsultarPDV"
      />

      <cardOps
        icon="nest_clock_farsight_analog"
        iconColor="#70640C"
        title="Consultar turnos"
        descricao="Consultar todos os turnos em tempo real."
        route="ConsultarTurnos"
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
