<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte todos os turnos em revisão.. Os turnos em revisão são aqueles que os valores estão sendo verificados pelo supervisor para conferir os valores em caixa." >
        <template #title>
            Consulte turnos em <span style="color:#FF8049;">revisão</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela11 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela11 from '@/components/Tabela11.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela11,
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