<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte o extrato de vendas realizadas anteriormente." >
        <template #title>
            Consultar Vendas <span style="color:#FF8049;">Efetuaadas</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela6 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela6 from '@/components/Tabela6.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela6,
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