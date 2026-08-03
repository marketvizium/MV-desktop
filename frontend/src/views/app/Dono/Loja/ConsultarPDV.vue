<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte os pontos de vendas cadastrados no sistema. É por eles que as vendas são realizadas." >
        <template #title>
            Consultar PDVs <span style="color:#FF8049;">Cadastrados</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela7 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela7 from '@/components/Tabela7.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela7,
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