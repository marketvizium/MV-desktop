<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por produto, código, lote ou status..."
          v-model="search"
        />
      </div>

      <div class="actions">
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
        <select v-model="filtros.status" class="custom-select">
          <option value="">Status (Todos)</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>

        <input type="text" placeholder="Produto" v-model="filtros.produto" class="custom-input" />
        
        <input type="number" placeholder="Qtd mín." v-model.number="filtros.qtdMin" class="custom-input" />
        <input type="number" placeholder="Qtd máx." v-model.number="filtros.qtdMax" class="custom-input" />

        <select v-model="filtros.comLote" class="custom-select">
          <option value="">Lote (Todos)</option>
          <option value="sim">Com lote</option>
          <option value="nao">Sem lote</option>
        </select>

        <select v-model="filtros.comValidade" class="custom-select">
          <option value="">Validade (Todos)</option>
          <option value="sim">Com validade</option>
          <option value="nao">Sem validade</option>
        </select>
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && itensFiltrados.length > 0"
      :value="itensPaginados"
      dataKey="id_item"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="Produto">
        <template #body="{ data }">
          <span class="font-medium text-dark">{{ data.nome }}</span>
        </template>
      </Column>

      <Column header="Código">
        <template #body="{ data }">
          <span class="barcode-text">{{ data.codigo_barra }}</span>
        </template>
      </Column>

      <Column header="Qtd">
        <template #body="{ data }">
          <span class="font-bold">{{ data.quantidade }}</span>
        </template>
      </Column>

      <Column header="Lote">
        <template #body="{ data }">
          <span class="text-muted text-sm">{{ data.lote || '--' }}</span>
        </template>
      </Column>

      <Column header="Validade">
        <template #body="{ data }">
          <span class="text-sm text-muted">{{ formatarData(data.data_validade) }}</span>
        </template>
      </Column>

      <Column header="Localização (E/L)">
        <template #body="{ data }">
          <span class="text-sm loc-text">{{ data.gondula_estoque }} / {{ data.gondula_loja }}</span>
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag 
            :value="data.status" 
            :severity="getSeverityStatus(data.status)"
          />
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div class="details-grid">
            <div class="option-card">
              <h4 class="option-title title-1">Financeiro e Venda</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Preço Custo</span>
                  <span class="value">R$ {{ data.preco_custo }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Margem</span>
                  <span class="value">{{ data.margem }}%</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Preço Venda</span>
                  <span class="value price-venda">R$ {{ data.preco_venda }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Último Reajuste</span>
                  <span class="value">{{ data.ultimo_reajuste || '--' }}</span>
                </div>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-2">Promoção e IDs</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Promoção (%)</span>
                  <span class="value">{{ data.porcentagem_promo ? data.porcentagem_promo + '%' : '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Período Promo</span>
                  <span class="value text-sm">{{ data.inicio_promo || '--' }} à {{ data.fim_promo || '--' }}</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Responsável</span>
                  <span class="value">{{ data.responsavel }}</span>
                </div>
                <div class="info-group">
                  <span class="label">IDs (Prod/Forn)</span>
                  <span class="value text-muted" style="font-size: 11px">#{{ data.id_produto }} / #{{ data.id_fornecedor }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataTable>

    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <div class="pagination-content">
        <Button 
          icon="pi pi-chevron-left" 
          @click="paginaAtual--" 
          :disabled="paginaAtual === 1" 
          class="nav-btn"
        />
        <div class="page-info">
          Página <span class="current-page">{{ paginaAtual }}</span> de <b>{{ totalPaginas }}</b>
        </div>
        <Button 
          icon="pi pi-chevron-right" 
          @click="paginaAtual++" 
          :disabled="paginaAtual === totalPaginas" 
          class="nav-btn"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Buscando itens do estoque...</span>
    </div>

    <div v-else-if="!loading && itensFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Nenhum item encontrado no estoque...</div>
    </div>
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

export default {
  name: 'TabelaItensEstoque',
  components: { ProgressSpinner, DataTable, Column, Tag, Button },
  data() {
    return {
      search: '',
      loading: false,
      showFilters: false,
      expandedRows: [],
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 15,
      filtros: {
        status: '',
        produto: '',
        qtdMin: null,
        qtdMax: null,
        comLote: '',
        comValidade: ''
      },
      itens: []
    }
  },
  computed: {
    itensFiltrados() {
      const termo = this.search.toLowerCase()
      return this.itens.filter(i => {
        const texto = `${i.nome} ${i.codigo_barra} ${i.lote ?? ''} ${i.responsavel} ${i.status}`.toLowerCase()
        return (
          (!termo || texto.includes(termo)) &&
          (!this.filtros.status || i.status.toLowerCase() === this.filtros.status.toLowerCase()) &&
          (!this.filtros.produto || i.nome.toLowerCase().includes(this.filtros.produto.toLowerCase())) &&
          (this.filtros.qtdMin == null || i.quantidade >= this.filtros.qtdMin) &&
          (this.filtros.qtdMax == null || i.quantidade <= this.filtros.qtdMax) &&
          (!this.filtros.comLote || (this.filtros.comLote === 'sim' ? i.lote : !i.lote)) &&
          (!this.filtros.comValidade || (this.filtros.comValidade === 'sim' ? i.data_validade : !i.data_validade))
        )
      })
    },
    totalPaginas() { 
      const total = Math.ceil(this.itensFiltrados.length / this.itensPorPagina);
      return total > 0 ? total : 1;
    },
    itensPaginados() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.itensFiltrados.slice(inicio, inicio + this.itensPorPagina)
    }
  },
  watch: {
    search() { this.paginaAtual = 1 },
    filtros: { deep: true, handler() { this.paginaAtual = 1 } }
  },
  methods: {
    getSeverityStatus(status) {
      const map = { ativo: 'success', inativo: 'danger' }
      return map[status.toLowerCase()] || 'secondary'
    },
    formatarData(ts) {
      if (!ts) return '--'
      return new Date(Number(ts)).toLocaleDateString('pt-BR')
    },
    limparFiltros() {
      this.filtros = { status: '', produto: '', qtdMin: null, qtdMax: null, comLote: '', comValidade: '' }
    },
    async receberItens() {
      try {
        this.loading = true
        const res = await api.get(`/mvpu/loja/consultaItens/${this.auth.id_loja}`)
        this.itens = res.data.data.reverse()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.auth = useAuthStore()
    this.receberItens()
  }
}
</script>

<style scoped>
.card { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 400px; }

/* HEADER */
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 450px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: #1e293b; }
.search-box i { color: #94a3b8; }

/* FILTROS */
.filters-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.filters-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
.custom-select, .custom-input { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: white; outline: none; }
.custom-input:focus { border-color: #5A0F83; }
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 500; }

/* TABELA */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1.1rem 1rem !important;
}
.barcode-text { font-family: monospace; font-weight: 600; color: #4f46e5; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.text-dark { color: #1e293b; }
.text-sm { font-size: 13px; }
.text-muted { color: #64748b; }
.loc-text { color: #0284c7; font-weight: 500; }

/* EXPANSÃO */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #5A0F83; }
.title-2 { color: #0284c7; }

.info-row { display: flex; gap: 20px; }
.info-group { display: flex; flex-direction: column; flex: 1; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 14px; color: #1e293b; font-weight: 500; }
.price-venda { color: #10b981; font-weight: 700; }

/* PAGINAÇÃO */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content {
  display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px;
  border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.nav-btn {
  width: 40px !important; height: 40px !important; background: #f97316 !important; border: none !important;
  border-radius: 50% !important; color: #ffffff !important; display: flex !important;
  align-items: center !important; justify-content: center !important; cursor: pointer;
}
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; opacity: 0.7; cursor: not-allowed; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.mt-3 { margin-top: 1rem; }
</style>