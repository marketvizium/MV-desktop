<template>
  <div class="totalPage">
    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">
      <cardOps
        icon="person_add"
        iconColor="#5A0F83"
        title="Consultar Vendedores"
        descricao="Consultar vendedores cadastrados na MarketVizium"
        route="VendedoresConsulta"
      />

      <cardOps
        icon="group"
        iconColor="#2E7D32"
        title="Meus vendedores"
        descricao="Consulte os vendedores associados à loja."
        route="MeusVendedores"
      />
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  name: 'VendedoresOps',
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
