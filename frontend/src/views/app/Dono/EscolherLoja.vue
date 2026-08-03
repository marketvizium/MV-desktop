<template>
  <div class="totalPage">
    <div>
        <div class="escolher-loja poppins-bold">
            Escolha a sua loja
        </div>
        <div class="frase-loja  poppins-bold">
            Selecione uma de suas lojas cadastradas para você gerenciar e controlar seus processos.
        </div>
        <div style="display: flex; justify-content: center; width: 100%; gap: 20px; margin-top: 30px;">
            <cardOps
            v-for="loja in lojas"
            icon="storefront"
            iconColor="#FF8049"
            :title="loja.razao_social"
            :descricao="loja.rua"
            @click="ChamaFuncao(loja.id_loja)"
          />
        </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api';
import exibeErro from '@/utils/ExibeErro';
import cardOps from '@/components/cardOps.vue';
import { useAuthStore } from '@/stores/auth';

export default {
    name:'RelatoriosPage',
    components:{
      cardOps,
    },
    data(){
        return{
            lojas: [],
            auth: null
        }
    },

    watch:{
      
    },


    methods:{
        async reqGetLojas(){
            try{
                const lojas = await api.get('/mvpu/usuario/consultarLojas')
                this.lojas = lojas.data.data
            
            }catch(e){
                exibeErro(e, this.$toast)
            }
        },
        async ChamaFuncao(id_loja){
            try{
                await this.auth.escolherLoja(id_loja)
            }catch(e){
                exibeErro(e, this.$toast)
            }
        }
    },

    mounted(){
        this.auth = useAuthStore()
        this.reqGetLojas()
    }
}
</script>

<style scoped>
.totalPage{
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 150px;
}

.header-page{
  width: 100%;
  padding: 20px;
}

.escolher-loja{
    width: 100%;
    text-align: center;
    font-size: 40px;
    color: #555;
}

.frase-loja{
    font-size: 16px;
    width: 100%;
    text-align: center;
    color: #222;
}
</style>
