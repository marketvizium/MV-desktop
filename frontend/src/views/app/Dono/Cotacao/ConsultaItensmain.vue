<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte os itens que que você adicionou na cotação." >
        <template #title>
            Consultar Itens na <span style="color:#FF8049;">Cotação</span>
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela19 :id_cotacao="idCotacao" :nome_cotacao="nomeCotacao"/>
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela19 from '@/components/Tabela19.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela19,
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