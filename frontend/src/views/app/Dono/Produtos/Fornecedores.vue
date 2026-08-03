<template>
  <div class="totalPage">
    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">
      <cardOps
        icon="person"
        iconColor="#174007"
        title="Cadastrar Industrias"
        descricao="Cadastre uma industria aqui."
        route="CadastroFornecedores"
      />

      <cardOps
        icon="inventory_2"
        iconColor="#70640C"
        title="Consultar Industrias"
        descricao="Consulte as industrias cadastradas aqui."
        route="ConsultaFornecedores"
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
