<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todos os turnos abertos. Os turnos abertos são aqueles que ainda estão operando na sua loja." >
        <template #title>
            Consulte turnos <span style="color:#FF8049;">abertos</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela9 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela9 from '@/components/Tabela9.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela9,
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