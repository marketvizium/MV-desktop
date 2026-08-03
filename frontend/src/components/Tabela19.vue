<template>
  <div class="card">
    <div class="table-header">
      <div class="header-left">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input
            type="text"
            placeholder="Pesquisar por código ou nome do produto..."
            v-model="search"
          />
        </div>

        <Button 
          label="Adicionar Produto" 
          icon="pi pi-plus" 
          class="btn-add" 
          @click="redirecionarAdd" 
        />
      </div>

      <div class="header-right">
        <Button 
          v-if="itensSelecionados.length >= 1"
          label="Remover Selecionados" 
          icon="pi pi-trash" 
          severity="danger" 
          variant="text"
          @click="confirmarRemocao = true"
          class="mr-2"
        />
        
        <Button 
          type="button" 
          icon="pi pi-filter" 
          label="Filtros" 
          outlined 
          @click="showFilters = !showFilters" 
          class="btn-filter"
        />
      </div>
    </div>

    <div v-if="showFilters" class="filters-panel">
      <div class="filters-grid">
        <div class="filter-group">
          <span class="filter-label">Quantidade</span>
          <div class="input-range">
            <input type="number" placeholder="Mín" v-model.number="filtros.qtdMin" class="custom-input" />
            <input type="number" placeholder="Máx" v-model.number="filtros.qtdMax" class="custom-input" />
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">Margem (%)</span>
          <div class="input-range">
            <input type="number" placeholder="Mín" v-model.number="filtros.margemMin" class="custom-input" />
            <input type="number" placeholder="Máx" v-model.number="filtros.margemMax" class="custom-input" />
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">Preço Venda</span>
          <div class="input-range">
            <input type="number" placeholder="Mín" v-model.number="filtros.precoMin" class="custom-input" />
            <input type="number" placeholder="Máx" v-model.number="filtros.precoMax" class="custom-input" />
          </div>
        </div>
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar filtros</button>
    </div>

    <DataTable
      v-if="!loading && itensFiltrados.length > 0"
      :value="itensPaginados"
      dataKey="id_solicitado"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:selection="itensSelecionados"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      
      <Column header="Código">
        <template #body="{ data }">
          <span class="barcode-text">{{ data.codigo_barra }}</span>
        </template>
      </Column>

      <Column field="nome" header="Produto" sortable>
        <template #body="{ data }">
          <span class="product-name">{{ data.nome }}</span>
        </template>
      </Column>

      <Column header="Qtd" style="width: 80px">
        <template #body="{ data }">
          <span class="font-bold">{{ data.quantidade }}</span>
        </template>
      </Column>

      <Column header="Custo">
        <template #body="{ data }">
          <span class="text-muted">R$ {{ data.preco_custo.toFixed(2) }}</span>
        </template>
      </Column>

      <Column header="Margem">
        <template #body="{ data }">
          <Tag :value="data.margem + '%'" severity="secondary" />
        </template>
      </Column>

      <Column header="Venda">
        <template #body="{ data }">
          <span class="text-success font-bold">R$ {{ data.preco_venda.toFixed(2) }}</span>
        </template>
      </Column>

      <Column header="Ações" style="width: 80px">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded severity="info" @click="abrirModalEdicao(data)" />
        </template>
      </Column>
    </DataTable>

    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <Button icon="pi pi-chevron-left" @click="paginaAtual--" :disabled="paginaAtual === 1" text rounded />
      <span class="poppins-regular">Página <b>{{ paginaAtual }}</b> de {{ totalPaginas }}</span>
      <Button icon="pi pi-chevron-right" @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" text rounded />
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Carregando itens...</span>
    </div>

    <div v-else-if="!loading && itensFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Nenhum produto encontrado nesta cotação...</div>
    </div>

    <Dialog v-model:visible="modalEditar" header="Editar Produto" :style="{ width: '350px' }" modal>
      <div class="modal-body">
        <p class="text-muted mb-4 text-sm">Ajuste a quantidade solicitada para <b>{{ itemEdicao.nome }}</b>.</p>
        <div class="field">
          <label class="label">Quantidade</label>
          <input type="number" v-model.number="itemEdicao.quantidade" class="custom-input w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="modalEditar = false" severity="secondary" />
        <Button label="Salvar" icon="pi pi-check" @click="salvarEdicao" autofocus />
      </template>
    </Dialog>

    <Dialog v-model:visible="confirmarRemocao" header="Confirmar Exclusão" :style="{ width: '400px' }" modal>
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #ef4444" />
        <span>Deseja realmente remover os <b>{{ itensSelecionados.length }}</b> itens selecionados?</span>
      </div>
      <template #footer>
        <Button label="Não" icon="pi pi-times" text @click="confirmarRemocao = false" severity="secondary" />
        <Button label="Sim, Remover" icon="pi pi-trash" severity="danger" @click="removerItens" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

export default {
  name: 'TabelaItensCotacao',
  components: { ProgressSpinner, DataTable, Column, Tag, Button, Dialog },

  props: {
    id_cotacao: Number,
    nome_cotacao: String
  },

  data () {
    return {
      search: '',
      loading: false,
      showFilters: false,
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 15,
      filtros: {
        qtdMin: null,
        qtdMax: null,
        margemMin: null,
        margemMax: null,
        precoMin: null,
        precoMax: null
      },
      itens: [],
      itensSelecionados: [],
      modalEditar: false,
      confirmarRemocao: false,
      itemEdicao: {}
    }
  },

  computed: {
    itensFiltrados () {
      const termo = this.search.toLowerCase()
      return this.itens.filter(i => {
        const matchesSearch = `${i.codigo_barra} ${i.nome}`.toLowerCase().includes(termo)
        const matchesQtd = (!this.filtros.qtdMin || i.quantidade >= this.filtros.qtdMin) &&
                          (!this.filtros.qtdMax || i.quantidade <= this.filtros.qtdMax)
        const matchesMargem = (!this.filtros.margemMin || i.margem >= this.filtros.margemMin) &&
                             (!this.filtros.margemMax || i.margem <= this.filtros.margemMax)
        const matchesPreco = (!this.filtros.precoMin || i.preco_venda >= this.filtros.precoMin) &&
                            (!this.filtros.precoMax || i.preco_venda <= this.filtros.precoMax)
        
        return matchesSearch && matchesQtd && matchesMargem && matchesPreco
      })
    },
    totalPaginas () {
      return Math.ceil(this.itensFiltrados.length / this.itensPorPagina)
    },
    itensPaginados () {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.itensFiltrados.slice(inicio, inicio + this.itensPorPagina)
    }
  },

  methods: {
    limparFiltros() {
      this.filtros = { qtdMin: null, qtdMax: null, margemMin: null, margemMax: null, precoMin: null, precoMax: null }
    },

    abrirModalEdicao (item) {
      this.itemEdicao = { ...item }
      this.modalEditar = true
    },

    async salvarEdicao () {
      try {
        await api.put(`/mvpu/cotacao/atualizarItem/${this.auth.id_loja}`, {
          id_solicitado: this.itemEdicao.id_solicitado,
          id_cotacao: this.id_cotacao,
          quantidade: this.itemEdicao.quantidade
        })
        this.$toast.success('Produto atualizado com sucesso.')
        this.modalEditar = false
        this.carregarItens()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    async removerItens () {
      try {
        // Mapeia os IDs dos itens selecionados caso venha o objeto completo do DataTable selection
        const idsParaRemover = this.itensSelecionados.map(i => i.id_solicitado || i)
        
        await api.delete(`/mvpu/cotacao/deletarItem/${this.auth.id_loja}`, {
          data: {
            id_solicitado: idsParaRemover,
            id_cotacao: this.id_cotacao
          }
        })

        this.$toast.success('Produto(s) removido(s) com sucesso.')
        this.confirmarRemocao = false
        this.itensSelecionados = []
        this.carregarItens()
      } catch (e) { exibeErro(e, this.$toast) }
    },

    async carregarItens () {
      try {
        this.loading = true
        const res = await api.get(`/mvpu/cotacao/donoGetCotacoes/${this.auth.id_loja}/${this.id_cotacao}`)
        this.itens = res.data.data?.reverse() || []
      } finally { this.loading = false }
    },

    redirecionarAdd(){
      this.$router.push({
        name: 'AdicionarItensCotacao',
        query: { id_cotacao: this.id_cotacao, nome_cotacao: this.nome_cotacao }
      })
    }
  },

  mounted () {
    this.auth = useAuthStore()

    this.loading = true
    setTimeout(()=>{
      this.carregarItens()
    },500)
  }
}
</script>

<style scoped>
.card { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 400px; }

/* HEADER */
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-left { display: flex; align-items: center; gap: 16px; flex: 1; }
.header-right { display: flex; align-items: center; gap: 12px; }

.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 400px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; }
.search-box i { color: #94a3b8; }

.btn-add { background: #FF8049 !important; border-color: #FF8049 !important; border-radius: 10px; }

/* FILTROS */
.filters-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.filters-grid { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 12px; }
.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.input-range { display: flex; gap: 8px; }
.custom-input { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; outline: none; transition: border 0.2s; }
.custom-input:focus { border-color: #FF8049; }
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 500; }

/* TABELA */
.barcode-text { font-family: monospace; color: #64748b; font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.product-name { font-weight: 500; color: #1e293b; }
.text-muted { color: #64748b; font-size: 13px; }
.text-success { color: #10b981; }

/* PAGINAÇÃO E ESTADOS */
.pagination-container { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 24px; }
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; opacity: 0.8; }
.poppins-regular { color: #64748b; font-size: 14px; }

/* MODAIS */
.field { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
.label { font-size: 12px; font-weight: 600; color: #475569; }
.confirmation-content { display: flex; align-items: center; padding: 1rem 0; }
.w-full { width: 100%; }
.mb-4 { margin-bottom: 1rem; }
.text-sm { font-size: 14px; }
</style>