<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte os itens que estão na sua loja, e veja quais ainda não foram vendidos" >
        <template #title>
            Consultar Itens na <span style="color:#FF8049;">Loja</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela13 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela13 from '@/components/Tabela13.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela13,
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