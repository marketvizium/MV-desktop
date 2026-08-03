<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todos os turnos realizados hoje. Os turnos de hoje são exibidos em um período de 24h até o momento." >
        <template #title>
            Consulte turnos de <span style="color:#FF8049;">hoje</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela8 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela8 from '@/components/Tabela8.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela8,
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