<template>
  <div class="totalPage">
    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">
      <cardOps
        icon="add_business"
        iconColor="#5A0F83"
        title="Criar nova loja"
        descricao="Cadastre uma nova loja no sistema"
        route="CadastrarLoja"
      />

      <cardOps
        icon="manage_search"
        iconColor="#082E5D"
        title="Consultar lojas"
        descricao="Consulte as lojas cadastradas."
        route="ConsultarLoja"
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
