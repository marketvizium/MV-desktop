<template>
  <div class="totalPage">
    <TitileSubtitle subtitle="Consulte o histórico de cotação. Todos os itens adicinados relacionados com suas respectivas ofertas." >
        <template #title>
            Consultar <span style="color:#FF8049;">Histórico</span> de Cotação
        </template>
    </TitileSubtitle>

    <div style="width: 100%; margin-top: 25px;">
        <Tabela21 :id_cotacao="idCotacao"/>
    </div>
  </div>
</template>

<script>

import TitileSubtitle from '@/components/TitileSubtitle.vue';
import Tabela21 from '@/components/Tabela21.vue';

export default {
    name:'FornecedoresPage',
    components:{
      TitileSubtitle,
      Tabela21,
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