<template>
  <div class="totalPage">
    <TitileSubtitle title="Consultar Industrias" subtitle="Consulte as industrias cadastradas na sua base" />

    <div style="width: 100%; margin-top: 25px;">
        <Tabela3 />
    </div>

  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela3 from '@/components/Tabela3.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela3,
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
