<template>
  <div class="totalPage">
    <TitileSubtitle title="Consultar embalagens associadas" subtitle="Consulte todas as embalagens associadas aos produtos unitários e suas respectivas quantidades. Você pode remover ou alterar a quantidade manualmente a qualquer momento!" />

    <div style="width: 100%; margin-top: 25px;">
        <Tabela2 />
    </div>

  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela2 from '@/components/Tabela2.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela2,
    },
    data(){

    },

    watch:{
      
    },


    methods:{
     
    },

    mounted(){}
}
</script>

<style scoped>

.totalPage{
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

</style>
