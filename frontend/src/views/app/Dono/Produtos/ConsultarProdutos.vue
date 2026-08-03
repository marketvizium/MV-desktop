<template>
  <div class="totalPage">
    <!-- WRAPPER DOS CARDS -->
    <div class="cards-wrapper">
      <cardOps
        icon="box"
        iconColor="#5A0F83"
        title="Consultar Produtos"
        descricao="Consulte aqui todos os seus produtos cadastrados"
        route="ProdutosConsulta"
      />

      
      <!--
      <cardOps
        icon="bar_chart"
        iconColor="#082E5D"
        title="Consultar IPCA"
        descricao="Consulte as estatísticas de IPCA aqui."
        route="ipcaConsulta"
        v-if="show"
      />
      -->

      <cardOps
        icon="inventory_2"
        iconColor="#70640C"
        title="Consultar Caixas/Fardos"
        descricao="Consulte as embalagens associadas aos produtos unitários"
        route="AssociadosConsulta"
      />

    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import cardOps from '@/components/cardOps.vue'
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'ConsultarProdutos',
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
  mounted(){
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
