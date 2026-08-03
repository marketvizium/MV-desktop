<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Gestão da Cotação"
      subtitle="Consulte informações relacionadas às cotações."
    />

    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">

      <cardOps
        icon="inventory_2"
        iconColor="#1565C0"
        title="Consultar itens"
        descricao="Consultar itens adicionados à cotação"
        route="ConsultarItensCotacao"
      />

      <cardOps
        icon="local_offer"
        iconColor="#EF6C00"
        title="Consultar ofertas"
        descricao="Consulte todas as ofertas de sua cotação"
        route="ConsultarOfertasCotacao"
      />

      <cardOps
        icon="history"
        iconColor="#6A1B9A"
        title="Consultar histórico"
        descricao="Consulte o histórico da cotação"
        route="ConsultarHistoricoCotacao"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  name: 'GestaoConsultasCotacao',
  components: {
    TitileSubtitle,
    cardOps
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
