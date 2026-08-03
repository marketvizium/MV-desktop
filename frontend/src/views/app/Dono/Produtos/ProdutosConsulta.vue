<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte seus produtos cadastrados, realize operações com os cadastros ativos." >
        <template #title>
            Consultar Produtos <span style="color:#FF8049;">Cadastrados</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela1 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela1 from '@/components/Tabela1.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela1,
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
