<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todos os produtos próximos de vencer no seu estoque." >
        <template #title>
            Consultar Produtos <span style="color:#FF8049;">Próximos</span> de Vencer no  Estoque
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela18 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela18 from '@/components/Tabela18.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela18,
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