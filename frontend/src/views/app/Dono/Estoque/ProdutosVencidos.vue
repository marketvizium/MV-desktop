<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todos os produtos vencidos no seu estoque." >
        <template #title>
            Consultar Produtos <span style="color:#FF8049;">Vencidos</span> no  Estoque
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela17 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela17 from '@/components/Tabela17.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela17,
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