<template>
  <div class="totalPage">
    <div class="cards-wrapper">
      <cardOps
        icon="person_add"
        iconColor="#5A0F83"
        title="Cadastrar colaborador"
        descricao="Registre um novo colaborador no sistema"
        route="CadastrarColaborador"
      />

      <cardOps
        icon="person_search"
        iconColor="#082E5D"
        title="Consultar colaboradores"
        descricao="Visualize e gerencie a lista de colaboradores."
        route="ConsultarColaborador"
      />
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'

export default {
  // Alterado o nome para refletir o novo propósito da página
  name: 'GerenciarColaboradores', 
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

.cards-wrapper {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}
</style>