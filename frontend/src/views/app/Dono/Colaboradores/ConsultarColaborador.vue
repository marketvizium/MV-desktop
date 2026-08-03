<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte seus colaboradores cadastrados no sistema." >
        <template #title>
            Consultar <span style="color:#FF8049;">Colaboradores</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela24 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela24 from '@/components/Tabela24.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela24,
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