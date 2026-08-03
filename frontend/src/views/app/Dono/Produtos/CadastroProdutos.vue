<template>
  <div class="totalPage">
    <TitileSubtitle title="Cadastro" subtitle="Cadastre novos produtos no formulário abaixo" />
    
    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Nome do produto" v-model="cadastroProduto.nome" />
      </div>
      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop placeholder="Código de barras" maxlength="13" v-model="cadastroProduto.codigo_barra" />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Nome do fabricante" v-model="cadastroProduto.nome_fornecedor" dropdown>
          <template #dropdown>
            <button 
              type="button"
              class="dropdown-item" 
              @click="SelecionarFornecedor(fornecedor)" 
              v-for="fornecedor in fornecedores" 
              :key="fornecedor.cnpj"
            >
              {{fornecedor.nome_fornecedor}}
            </button>
          </template>
        </inputDesktop>
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="CNPJ do fabricante" v-model="fornecedor_detalhes.cnpj" />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Nome fantasia do fabricante (Opcional)" v-model="fornecedor_detalhes.nome_fantasia" />
      </div>
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Razão social do fabricante (Opcional)" v-model="fornecedor_detalhes.razao_social" />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Email principal do fabricante (Opcional)" v-model="fornecedor_detalhes.email_principal" />
      </div>
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Telefone Principal do fabricante (Opcional)" v-model="fornecedor_detalhes.telefone_principal" />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Gondula na loja" v-model="cadastroProduto.gondula_loja" />
      </div>
      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop placeholder="Gondula no estoque" maxlength="16" v-model="cadastroProduto.gondula_estoque" />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Preço de custo" v-model="cadastroProduto.preco_custo" />
      </div>
      <div style="width: 100%; padding-left: 5px; display: flex;">
        <div style="width: 100%; padding-right: 5px;">
          <inputDesktop placeholder="Margem (%)" maxlength="3" v-model="cadastroProduto.margem" />
        </div>
        <div style="width: 100%; padding-left: 5px;">
          <inputDesktop placeholder="Preço de venda" :disabled="true" v-model="preco_venda" />
        </div>
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Código NCM" v-model="cadastroProduto.ncm" />
      </div>
      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop placeholder="Código CEST" />
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 20px;">
      <div style="width: 100%; padding-right: 5px;">
        <inputDesktop placeholder="Categoria (Opcional)" v-model="cadastroProduto.categoria" />
      </div>
      <div style="width: 100%; padding-left: 5px;">
        <inputDesktop placeholder="Código ou frase para busca rápida (Opcional)" v-model="cadastroProduto.busca_rapida" />
      </div>
    </div>

    <div class="checkbox-group">
      <label class="checkbox-container">
        <input type="checkbox" v-model="cadastroProduto.controle_lote" />
        <span class="checkmark"></span>
        <span class="checkbox-text">Controlar por lote</span>
      </label>

      <label class="checkbox-container">
        <input type="checkbox" v-model="cadastroProduto.ajuste_automatico" />
        <span class="checkmark"></span>
        <span class="checkbox-text">Atualizar Preço Automaticamente com Entrada de Produtos</span>
      </label>
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
import { mapState } from 'pinia';
import { Button } from 'primevue';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default {
    name: 'CadastroProdutos',
    components: {
      TitileSubtitle,
      inputDesktop,
      Button
    },
    data() {
      return {
        controlarPorLote: false,
        atualizarPrecoAutomatico: false, // Adicionado para suportar o novo checkbox
        loading: false,
        auth: null,
        fornecedores: [],

        fornecedor_detalhes: {
          email_principal: null,
          nome_fantasia: null,
          razao_social: null,
          telefone_principal: null,
          nome_fornecedor: null,
          cnpj: null,
          status: 'ativo'
        },

        cadastroProduto: {
          nome: null,
          nome_fornecedor: null,
          codigo_barra: null,
          preco_custo: null,
          ajuste_automatico: false,
          controle_lote: false,
          preco_venda: null,
          ncm: null,
          margem: null,
          categoria: null,
          busca_rapida: null,
          gondula_estoque: null,
          gondula_loja: null,
          id_loja: null
        }
      }
    },

    computed: {
      preco_venda() {
        this.cadastroProduto.preco_venda = Number(this.cadastroProduto.preco_custo * (1 + Number(this.cadastroProduto.margem)/100))
        return this.cadastroProduto.preco_venda
      },
      ...mapState(useAuthStore, ['id_loja'])
    },

    methods: {
      SelecionarFornecedor(fornecedor) {
        // Preenche o campo de input de texto do fornecedor
        this.cadastroProduto.nome_fornecedor = fornecedor.nome_fornecedor;
        
        // Preenche os detalhes do fornecedor
        this.fornecedor_detalhes.cnpj = fornecedor.cnpj
        this.fornecedor_detalhes.nome_fantasia = fornecedor.nome_fantasia
        this.fornecedor_detalhes.razao_social = fornecedor.razao_social
        this.fornecedor_detalhes.telefone_principal = fornecedor.telefone_principal
        this.fornecedor_detalhes.email_principal = fornecedor.email_principal
        
        // Para fechar o dropdown, geralmente limpamos a lista ou tiramos o foco. 
        // Como o dropdown renderiza baseado em 'fornecedores', forçamos um fechamento lógico se o componente inputDesktop emitir algum evento de blur ou fechamento.
        // Se o dropdown for reativo à busca, ao definir o nome ele filtrará apenas 1 ou nenhum, dependendo da lógica do inputDesktop.
      },

      async CadastrarProd() {
        this.loading = true
        try {
          this.cadastroProduto.id_loja = this.auth.id_loja
          if (
            !this.cadastroProduto.nome ||
            !this.cadastroProduto.nome_fornecedor ||
            !this.cadastroProduto.preco_custo ||
            !this.cadastroProduto.margem ||
            !this.cadastroProduto.preco_venda ||
            !this.cadastroProduto.codigo_barra ||
            !this.cadastroProduto.ncm ||
            !this.cadastroProduto.gondula_loja ||
            !this.cadastroProduto.gondula_estoque
          ) {
            this.loading = false
            this.$toast.info('Dados obrigatórios não preenchidos')
            return
          }


          let auth = useAuthStore()

          this.cadastroProduto['cnpj']        = this.fornecedor_detalhes.cnpj
          this.cadastroProduto['responsavel'] = auth.user.email

          //const status_rede = await window.electronAPI.getStatusRede()
          const status_rede = false

          if(status_rede){
            await api.post('/mvpu/produto/cadastro', this.cadastroProduto)
            this.$toast.success('Produto cadastrado com sucesso!')
            this.limparTudo()
          }else{
            console.log(window.electronAPI)

            const obj = JSON.parse(
              JSON.stringify(this.cadastroProduto)
            )

            const retornoCadastro = await window.electronAPI.setCadastroProduto(obj)

            if(retornoCadastro.erro == 'PRODUTO_JA_CADASTRADO'){
              this.$toast.info('Produto já foi cadastrado anteriormente!')
              return
            }

            if(retornoCadastro.erro == 'DADOS_INVALIDOS'){
              this.$toast.info('Você não preencheu todos os campos obrigatórios')
              return
            }

            if(retornoCadastro.erro == 'FORNECEDOR_INEXISTENTE'){
              this.$toast.info('O CNPJ especificado não está cadastrado na base. Favor, cadastre o CNPJ antes de cadastrar o produto...')
              return
            }

            this.$toast.success('Produto cadastrado com sucesso!')
            this.limparTudo()
          }

        } catch (e) {
          exibeErro(e, this.$toast)
        } finally {
          this.loading = false
        }
      },

      limparTudo() {
        this.cadastroProduto = {
          nome: null,
          nome_fornecedor: null,
          codigo_barra: null,
          preco_custo: null,
          ajuste_automatico: false,
          controle_lote: false,
          preco_venda: null,
          ncm: null,
          margem: null,
          categoria: null,
          busca_rapida: null,
          gondula_estoque: null,
          gondula_loja: null,
          id_loja: this.auth.id_loja
        }
        this.fornecedor_detalhes = {
          cnpj: null, nome_fantasia: null, razao_social: null,
          telefone_principal: null, email_principal: null
        }
        this.controlarPorLote = false
        this.atualizarPrecoAutomatico = false
      },

      async getFornecedores() {
        try {
          const res = await api.get(`/mvpu/produto/consultarFornecedores/${this.auth.id_loja}`)
          this.fornecedores = res.data.data
        } catch (e) {
          exibeErro(e, this.$toast)
        }
      }
    },

    mounted() {
      this.auth = useAuthStore()
      this.getFornecedores()
    }
}
</script>

<style scoped>
.totalPage {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.checkbox-group {
  display: flex;
  flex-direction: row;
  gap: 30px;
  margin-top: 20px;
  width: 100%;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #333;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

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

.checkbox-container input:checked ~ .checkmark {
  background-color: #444;
  border-color: #444;
}

.checkmark::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  display: none;
}

.checkbox-container input:checked ~ .checkmark::after {
  display: block;
}

:deep(.btn-sbmt.p-button) {
  background-color: #FF8049 !important;
  color: #FFF !important;
  border: none !important;
  width: 100%;
  margin-left: 8px;
  height: 50px;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b !important;
}

.dropdown-item {
  height: 40px;
  width: 100%;
  text-align: start;
  padding-left: 15px;
  border: solid 1px #CCC;
  background-color: #f7f7f7;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #eee;
}
</style>