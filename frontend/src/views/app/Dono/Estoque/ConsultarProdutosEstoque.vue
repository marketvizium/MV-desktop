<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todas os produtos presentes no estoque." >
        <template #title>
            Consultar <span style="color:#FF8049;">Produtos</span> no  Estoque
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela16 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela16 from '@/components/Tabela16.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela16,
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