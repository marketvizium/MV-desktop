<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte suas promoções ativas no sistema. Aqui são exibidos produtos com promoções já sendo executadas, e promoções ainda agendadas." >
        <template #title>
            Consultar Produtos com Promoções <span style="color:#FF8049;">Ativas</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela4 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela4 from '@/components/Tabela4.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela4,
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
