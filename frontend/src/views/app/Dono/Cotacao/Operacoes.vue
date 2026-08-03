<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Gestão de Cotações"
      subtitle="Gerencie cotações e ofertas de forma rápida e organizada."
    />

    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">

      <cardOps
        icon="note_add"
        iconColor="#2E7D32"
        title="Registrar Cotação"
        descricao="Cadastre uma nova cotação"
        route="RegistrarCotacao"
        v-show="user.nivel==6 || user.nivel==1"
      />


      <!--
      <cardOps
        icon="add_box"
        iconColor="#1565C0"
        title="Adicionar Produto"
        descricao="Adicionar produtos à cotação"
        route="AdicionarProdutoCotacao"
      />
      -->

      <cardOps
        icon="tv_options_edit_channels"
        iconColor="#EF6C00"
        title="Console de cotação"
        descricao="Consulte, selecione e opere suas cotações"
        route="ConsultarCotacoesConsole"
      />
      
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'
import { useAuthStore } from '@/stores/auth';
import { mapState } from 'pinia';

export default {
  name: 'GestaoCotacoesPage',
  components: {
    TitileSubtitle,
    cardOps
  },
  
  computed:{
    ...mapState(useAuthStore, ['user', 'id_loja']),
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
