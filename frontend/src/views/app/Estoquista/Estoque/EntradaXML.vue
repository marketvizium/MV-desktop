<template>
  <div class="totalPage">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

    <TitileSubtitle
      title="Entrada por XML (NF-e)"
      subtitle="Importe um XML de NF-e para dar entrada automática nos produtos."
    />

    <div class="upload-container">
      <label class="custom-upload-btn">
        <span class="material-symbols-outlined" style="margin-right: 8px">file_upload</span>
        Escolher Arquivo XML
        <input type="file" accept=".xml" @change="lerXML" hidden />
      </label>

      <Button 
        v-if="produtos.length > 0" 
        label="Registrar Entrada" 
        icon="pi pi-check" 
        class="btn-registrar" 
        @click="registrarEntrada"
      />
    </div>

    <div v-if="produtosNaoCadastrados.length > 0" class="alert-error-container">
      <span class="material-symbols-outlined">warning</span>
      Existem produtos no XML que não estão cadastrados no sistema. Verifique as linhas destacadas.
    </div>

    <div v-if="produtos.length" class="table-wrapper p-shadow-2">
      <DataTable 
        :value="produtos" 
        v-model:expandedRows="expandedRows"
        dataKey="id_temp"
        responsiveLayout="stack" 
        breakpoint="960px" 
        stripedRows 
        class="p-datatable-sm"
        :rowClass="rowClass"
      >
        <Column expander style="width: 3rem" />

        <Column field="codigo_barra" header="EAN">
          <template #body="slotProps">
            <div class="flex align-items-center">
              <span 
                v-if="isNaoCadastrado(slotProps.data.codigo_barra)" 
                class="material-symbols-outlined text-red-500 mr-2" 
                title="Produto não cadastrado"
              >
                cancel
              </span>
              {{ slotProps.data.codigo_barra }}
            </div>
          </template>
        </Column>
        
        <Column field="nome" header="Produto"></Column>
        
        <Column field="quantidade" header="Qtd (Emb)"></Column>
        
        <Column header="Total Unidades">
          <template #body="slotProps">
            <span :class="{'comp-badge': slotProps.data.quantidade_unit > 1}">
              {{ (slotProps.data.quantidade * slotProps.data.quantidade_unit).toFixed(0) }} UN
            </span>
          </template>
        </Column>

        <Column header="Preço Custo">
          <template #body="slotProps">
            R$ {{ slotProps.data.preco_custo.toFixed(2) }}
          </template>
        </Column>

        <Column field="lote" header="Lote">
          <template #body="slotProps">
            {{ slotProps.data.lote || '-' }}
          </template>
        </Column>

        <Column field="validade" header="Validade">
          <template #body="slotProps">
            {{ formatarDataExibicao(slotProps.data.data_validade) }}
          </template>
        </Column>

        <Column header="Ações">
          <template #body="slotProps">
            <Button class="p-button-rounded p-button-text p-button-warning" @click="abrirEdicao(slotProps.index)" >
                <span class="material-symbols-outlined">edit</span>
            </Button>
          </template>
        </Column>

        <template #expansion="slotProps">
          <div class="expansion-details p-3">
            <div v-if="isNaoCadastrado(slotProps.data.codigo_barra)" class="not-found-banner mb-3">
               <span class="material-symbols-outlined">error</span>
               Atenção: Este código de barras não foi encontrado no seu banco de dados. Cadastre o produto antes de processar a entrada.
            </div>

            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="info-card supplier-card">
                  <h5 class="m-0 mb-2"><span class="material-symbols-outlined v-align">store</span> Fornecedor</h5>
                  <p><strong>Razão Social:</strong> {{ slotProps.data.nome_fornecedor }}</p>
                  <p><strong>CNPJ:</strong> {{ slotProps.data.cnpj }}</p>
                </div>
              </div>
              
              <div class="col-12 md:col-6">
                <div class="info-card composition-card">
                  <h5 class="m-0 mb-2"><span class="material-symbols-outlined v-align">inventory_2</span> Composição da Embalagem</h5>
                  <p v-if="slotProps.data.quantidade_unit > 1">
                    <i class="pi pi-info-circle"></i> 
                    Esta embalagem é uma <strong>composição</strong>. 
                    Cada 1 {{ slotProps.data.uCom || 'unidade' }} contém <strong>{{ slotProps.data.quantidade_unit }} unidades</strong> internas.
                  </p>
                  <p v-else>Produto unitário (venda simples).</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <Dialog style="font-family: 'Poppins';" v-model:visible="displayModal" header="Editar Informações do Produto" :style="{ width: '450px' }" :modal="true">
      <div class="p-fluid">
        <div class="field mb-3">
          <label for="nome">Nome do Produto</label>
          <InputText id="nome" v-model="produtoEdicao.nome" />
        </div>
        <div class="field mb-3">
          <label for="qtd">Quantidade (Embalagens)</label>
          <InputNumber id="qtd" v-model="produtoEdicao.quantidade" mode="decimal" :minFractionDigits="2" />
        </div>
        
        <div class="field mb-3">
          <label for="qtd_unit">Unidades por Embalagem (Fator)</label>
          <InputNumber id="qtd_unit" v-model="produtoEdicao.quantidade_unit" mode="decimal" :minFractionDigits="0" />
          <small class="text-orange-500">Total: {{ (produtoEdicao.quantidade * (produtoEdicao.quantidade_unit || 1)).toFixed(0) }} unidades no estoque.</small>
        </div>

        <div class="field mb-3">
          <label for="custo">Preço de Custo (Unitário da Embalagem)</label>
          <InputNumber id="custo" v-model="produtoEdicao.preco_custo" mode="currency" currency="BRL" locale="pt-BR" />
        </div>
        
        <div class="formgrid grid">
          <div class="field col mb-3">
            <label for="lote">Lote</label>
            <InputText id="lote" v-model="produtoEdicao.lote" />
          </div>
          <div class="field col mb-3">
            <label for="validade">Validade</label>
            <DatePicker 
              id="validade" 
              v-model="produtoEdicao.data_validade" 
              dateFormat="dd/mm/yy" 
              showIcon 
              iconDisplay="input"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="displayModal = false" class="p-button-text p-button-secondary" />
        <Button label="Salvar Alterações" icon="pi pi-save" @click="salvarEdicao" class="btn-salvar" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import { XMLParser } from 'fast-xml-parser'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import { api } from '@/services/api'
import exibeErro from '@/utils/ExibeErro'

export default {
  name: 'EntradaPorXML',
  components: { 
    TitileSubtitle, Button, DataTable, Column, Dialog, InputText, InputNumber, DatePicker
  },

  data() {
    return {
      produtos: [],
      produtosNaoCadastrados: [], // Armazena os EANs que deram erro 799
      expandedRows: [],
      auth: null,
      displayModal: false,
      produtoEdicao: {},
      indiceEdicao: null
    }
  },

  methods: {
    // Verifica se um código de barras está na lista de "não encontrados"
    isNaoCadastrado(ean) {
      return this.produtosNaoCadastrados.includes(String(ean))
    },

    // Define a classe da linha baseada no status de cadastro
    rowClass(data) {
      return this.isNaoCadastrado(data.codigo_barra) ? 'row-error' : null
    },

    lerXML(event) {
      const file = event.target.files[0]
      if (!file) return
      this.produtosNaoCadastrados = [] // Limpa erros ao carregar novo arquivo
      const reader = new FileReader()
      reader.onload = (e) => this.processarXML(e.target.result)
      reader.readAsText(file)
    },

    processarXML(xmlString) {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' })
      try {
        const json = parser.parse(xmlString)
        const infoNFe = json?.nfeProc?.NFe?.infNFe || json?.NFe?.infNFe
        const det = infoNFe?.det
        
        const fornecedorNome = infoNFe?.emit?.xNome || 'Não Identificado'
        const fornecedorCNPJ = infoNFe?.emit?.CNPJ || infoNFe?.emit?.CPF || '00.000.000/0000-00'

        if (!det) {
          this.$toast.error('XML inválido ou sem produtos.')
          return
        }

        const itens = Array.isArray(det) ? det : [det]

        this.produtos = itens.map((element, index) => {
          const rastroTag = element.rastro || element.prod?.rastro
          const primeiroRastro = Array.isArray(rastroTag) ? rastroTag[0] : rastroTag
          const qCom = parseFloat(element.prod?.qCom || 1)
          const qTrib = parseFloat(element.prod?.qTrib || 1)
          const fator = qTrib > qCom ? Math.round(qTrib / qCom) : 1

          let dataValidade = null
          if (primeiroRastro?.dVal) {
             dataValidade = new Date(primeiroRastro.dVal + 'T12:00:00')
          }

          return {
            id_temp: index,
            codigo_barra: String(element.prod?.cEAN || ''),
            nome: element.prod?.xProd || null,
            uCom: element.prod?.uCom || 'UN',
            quantidade: qCom,
            quantidade_unit: fator,
            preco_custo: parseFloat(element.prod?.vUnCom || 0),
            responsavel: this.auth?.user?.email || 'Sistema',
            id_loja: parseInt(this.auth?.id_loja || 0),
            lote: primeiroRastro?.nLote || null,
            data_validade: dataValidade,
            cnpj: fornecedorCNPJ,
            nome_fornecedor: fornecedorNome
          }
        })
      } catch (error) {
        this.$toast.error('Erro ao processar o arquivo XML.')
      }
    },

    formatarDataExibicao(data) {
      if (!data) return '-'
      if (!(data instanceof Date)) return data
      return data.toLocaleDateString('pt-BR')
    },

    abrirEdicao(index) {
      this.indiceEdicao = index
      this.produtoEdicao = { ...this.produtos[index] }
      this.displayModal = true
    },

    salvarEdicao() {
      this.produtos[this.indiceEdicao] = { ...this.produtoEdicao }
      this.displayModal = false
    },

    async registrarEntrada() {
        try {
            if (this.produtos.length <= 0) return
            this.produtosNaoCadastrados = [] // Reset antes de tentar

            const produtosParaEnviar = this.produtos.map(prod => {
                const p = { ...prod }
                delete p.nome
                delete p.id_temp
                delete p.uCom
                p.data_validade = p.data_validade ? new Date(p.data_validade).getTime() : null
                return p
            })

            const response = await api.post(`/mvpu/estoque/EntradaXMLestoque/${this.auth.id_loja}`, { produtos: produtosParaEnviar })
            
            this.$toast.success('Entrada registrada com sucesso!')
            this.produtos = []

        } catch (e) {
            // Lógica para capturar erro 799 e destacar produtos
            if (e.response?.data?.COD === "799") {
                this.produtosNaoCadastrados = e.response.data.data.map(p => String(p.codigo_barra))
                exibeErro(e, this.$toast)
            } else {
                exibeErro(e, this.$toast)
            }
        }
    }
  },

  mounted() {
    this.auth = useAuthStore()
  }
}
</script>

<style scoped>
.totalPage {
  padding: 20px;
  width: 100%;
  font-family: 'Poppins', sans-serif;
}

.alert-error-container {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

/* Classe aplicada à linha inteira se o produto não existir */
:deep(.row-error) {
  background-color: #fff5f5 !important;
  color: #c53030 !important;
}

.not-found-banner {
  background: #c53030;
  color: white;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.upload-container {
  display: flex;
  gap: 15px;
  align-items: center;
  margin: 25px 0;
}

.custom-upload-btn {
  background-color: #FF8049;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

:deep(.btn-registrar) { background-color: #2ecc71 !important; height: 50px; border: none !important; }
:deep(.btn-salvar) { background-color: #FF8049 !important; border: none !important; }

.table-wrapper { margin-top: 20px; background: white; border-radius: 8px; }

.comp-badge {
  background: #fff3e0;
  color: #ef6c00;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  border: 1px solid #ffe0b2;
}

.info-card { background: #f8f9fa; padding: 15px; border-radius: 6px; height: 100%; }
.supplier-card { border-left: 4px solid #FF8049; }
.composition-card { border-left: 4px solid #4f46e5; }
.v-align { vertical-align: middle; font-size: 20px; }
.field label { font-weight: 600; display: block; margin-bottom: 5px; color: #555; }
</style>