<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todas as entradas que houveram no seu estoque." >
        <template #title>
            Consultar <span style="color:#FF8049;">Entradas</span> no  Estoque
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela15 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela15 from '@/components/Tabela15.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela15,
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