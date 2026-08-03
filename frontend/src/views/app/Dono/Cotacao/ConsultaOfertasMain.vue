<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte as ofertas realizadas para essa cotação." >
        <template #title>
            Consultar <span style="color:#FF8049;">Ofertas</span> na Cotação
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela20 :id_cotacao="idCotacao"/>
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela20 from '@/components/Tabela20.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela20,
    },
    data(){
        return{
            idCotacao: null,
            nomeCotacao: null
        }
    },

    watch:{
      
    },


    methods:{
     
    },

    mounted(){
        const query = this.$route.query
        this.idCotacao   = Number(query.id_cotacao)
        this.nomeCotacao = query.nome_cotacao

        console.log(query)
    }
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