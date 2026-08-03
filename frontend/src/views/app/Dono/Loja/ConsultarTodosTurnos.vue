<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todos os turnos. Aqui você poderá consultar todos os turnos, abertos, fechados e em revisão no sistema." >
        <template #title>
            Consulte todos os <span style="color:#FF8049;">turnos</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela12 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela12 from '@/components/Tabela12.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela12,
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