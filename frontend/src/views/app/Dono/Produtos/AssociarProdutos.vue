<template>
  <div class="totalPage">
    <TitileSubtitle title="Relacionar produtos" subtitle="Relacione produtos com código de barras unitário às suas respectivas caixas ou fardos. Dessa forma, o sistema poderá identificar e controlar individualmente cada unidade, mantendo o vínculo com suas embalagens de agrupamento." />

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Código de barras do produto unitário" maxlength="13" v-model="associadoPayload.codigo_barra_prod" />
      </div>
      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop placeholder="Código de barras da caixa/fardo" maxlength="13" v-model="associadoPayload.codigo_barra_comp" />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Nome da caixa/fardo" v-model="associadoPayload.nome_composicao" />
      </div>
      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop placeholder="Quantidade unitária por caixa/fardo" maxlength="13" v-model="associadoPayload.quantidade" type="number" />
      </div>
    </div>

    <div style="display: flex; margin-top: 20px;">
      <button @click="limparTudo" style="width: 100%; margin-right: 8px; background-color: #888; color: #FFF; border-radius: 5px; border: none; height: 50px; cursor: pointer;">
        Limpar tudo
      </button>

      <Button type="button" label="Cadastrar produto" class="poppins-regular btn-sbmt" :loading="loading" @click="CadastrarProd" />

    </div>

  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue';
import inputDesktop from '@/components/inputDesktop.vue';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import exibeErro from '@/utils/ExibeErro';
import { Button } from 'primevue';

export default {
    name:'CadastroProdutos',
    components:{
      TitileSubtitle,
      inputDesktop,
      Button
    },
    data(){
      return {
        controlarPorLote: false,
        loading: false,
        auth: null,
        associadoPayload:{
          codigo_barra_prod: null,
          codigo_barra_comp: null,
          nome_composicao  : null,
          quantidade: null,
          id_loja: null
        }
      }
    },

    methods:{

      limparTudo(){
        this.associadoPayload.codigo_barra_prod  = null
        this.associadoPayload.codigo_barra_comp  = null
        this.associadoPayload.nome_composicao    = null
        this.associadoPayload.quantidade         = null
      },

      async CadastrarProd() {
          this.loading = true;

          try {
              this.auth = useAuthStore();
              this.associadoPayload.id_loja = this.auth.id_loja;

              // 1. Validação básica no Front-end
              if (
                  !this.associadoPayload.codigo_barra_prod ||
                  !this.associadoPayload.codigo_barra_comp ||
                  !this.associadoPayload.nome_composicao ||
                  !this.associadoPayload.quantidade
              ) {
                  this.loading = false;
                  this.$toast.info('Dados obrigatórios não preenchidos');
                  return;
              }


              //Vamos dar prioridade agora para cadastrar direto e não haver
              //retenção. Depois lançamos uma atualização com isso mais estável no 
              //sistema

              await api.post('/mvpu/produto/cadastroAssociado', this.associadoPayload)
              this.loading = false;

              //O código abaixo serve para integrar com a retenção de dados antes de enviar pro
              //servidor. Porém preciso verificar melhor os campos, os dados, pq foi feito correndo.

              //Preciso me certificar de barrar tudo antes no app antes de ir pro server, pq se não
              //a retenção é infinita, dado o cadastro errado


              //this.associadoPayload.quantidade = parseInt(this.associadoPayload.quantidade);

              //const obj = JSON.parse(JSON.stringify(this.associadoPayload));

              // 2. Chama a função no Electron
              //const retorno = await window.electronAPI.setProdutoComp(obj);

              // 3. Processa os possíveis retornos de erro da lógica de banco
              //if (retorno && !retorno.sucesso) {
              //    this.loading = false;
              //    switch (retorno.erro) {
              //        case "PRODUTO_COMP_JA_CADASTRADO":
              //            this.$toast.info('Este código de composição já está cadastrado nesta loja.');
              //            break;
              //        case "PRODUTO_PROD_NAO_CADASTRADO":
              //            this.$toast.error('O produto principal (Pai) não foi encontrado no cadastro.');
              //            break;
              //        case "DADOS_FALTANTES":
              //            this.$toast.info('Verifique os campos obrigatórios.');
              //            break;
              //        default:
              //            this.$toast.error('Erro ao realizar cadastro: ' + (retorno.erro || 'Erro desconhecido'));
              //    }
              //    return; // Interrompe o fluxo pois houve um erro lógico
              //}
              // 4. Se chegou aqui, deu sucesso total
              this.$toast.success('Associação cadastrada com sucesso!');
              this.limparTudo();

          } catch (e) {
              // Erros graves de execução (ex: banco offline, erro de sintaxe SQL)
              console.error("Erro crítico no cadastro:", e);
              exibeErro(e, this.$toast);
          } finally {
              this.loading = false;
          }
      },
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

.checkbox-line {
  margin-top: 20px;
  width: 100%;
}

/* Container */
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #333;
}

/* Esconde o checkbox padrão */
.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* Checkbox customizado */
.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #000;
  border-radius: 4px;
  background: transparent;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

/* Check ativo */
.checkbox-container input:checked ~ .checkmark {
  background-color: #444;
  border-color: #444;
}

/* Ícone de check */
.checkmark::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  display: none;
}

/* Mostra o check */
.checkbox-container input:checked ~ .checkmark::after {
  display: block;
}

.checkbox-text {
  line-height: 1;
}

:deep(.btn-sbmt.p-button),
:deep(.btn-sbmt.p-button:hover),
:deep(.btn-sbmt.p-button:focus),
:deep(.btn-sbmt.p-button:active) {
  background-color: #FF8049 !important; /* ou #ce673b se quiser hover */
  color: #FFF !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  cursor: pointer;
  width: 100%;
  margin-left: 8px;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}

</style>
