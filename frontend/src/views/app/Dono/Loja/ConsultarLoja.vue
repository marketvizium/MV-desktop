<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte suas lojas cadastradas no sistema e realize operações." >
        <template #title>
            Consultar Lojas <span style="color:#FF8049;">Cadastradas</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela5 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela5 from '@/components/Tabela5.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela5,
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