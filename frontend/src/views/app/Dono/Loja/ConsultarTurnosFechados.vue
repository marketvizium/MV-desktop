<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todos os turnos fechados. Turnos fechados são aqueles em que foram revisados e posteriormente encerrados." >
        <template #title>
            Consulte turnos <span style="color:#FF8049;">fechados</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela10 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela10 from '@/components/Tabela10.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela10,
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