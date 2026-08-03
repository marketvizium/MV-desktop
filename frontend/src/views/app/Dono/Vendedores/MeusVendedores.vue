<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Conheça os vendedores associados à sua loja." >
        <template #title>
            Consultar <span style="color:#FF8049;">Vendedores</span> Associados à Loja.
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela23 />
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela23 from '@/components/Tabela23.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela23,
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