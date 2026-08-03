<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por código, lote ou responsável..."
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

        <div class="date-input-group">
          <span class="date-label">Início:</span>
          <input type="date" v-model="filtros.dataInicio" class="custom-input" />
        </div>

        <div class="date-input-group">
          <span class="date-label">Fim:</span>
          <input type="date" v-model="filtros.dataFim" class="custom-input" />
        </div>
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && itensFiltrados.length > 0"
      :value="itensPaginados"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      class="custom-table"
    >
      <Column header="Código de barras">
        <template #body="{ data }">
          <span class="barcode-text">{{ data.codigo_barra }}</span>
        </template>
      </Column>

      <Column header="Qtd">
        <template #body="{ data }">
          <span class="font-bold quantity-text">{{ data.quantidade }}</span>
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

      <Column header="Data/Hora Operação">
        <template #body="{ data }">
          <div class="op-date-time">
            <span class="text-sm font-medium d-block">{{ formatarDataHora(data.data_operacao) }}</span>
          </div>
        </template>
      </Column>

      <Column header="Responsável">
        <template #body="{ data }">
          <span class="text-sm font-medium user-name">{{ data.responsavel }}</span>
        </template>
      </Column>
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
      <span class="muted mt-2">Buscando histórico de saídas...</span>
    </div>

    <div v-else-if="!loading && itensFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Nenhum registro de saída encontrado...</div>
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
import Button from 'primevue/button'

export default {
  name: 'TabelaHistoricoSaidas',
  components: { ProgressSpinner, DataTable, Column, Button },
  data() {
    return {
      search: '',
      loading: false,
      showFilters: false,
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 15,
      filtros: {
        comLote: '',
        comValidade: '',
        dataInicio: '',
        dataFim: ''
      },
      itens: []
    }
  },
  computed: {
    itensFiltrados() {
      const termo = this.search.toLowerCase()
      return this.itens.filter(i => {
        const texto = `${i.codigo_barra} ${i.lote ?? ''} ${i.responsavel}`.toLowerCase()
        const dataOp = i.data_operacao ? new Date(Number(i.data_operacao)) : null
        const inicio = this.filtros.dataInicio ? new Date(this.filtros.dataInicio) : null
        const fim = this.filtros.dataFim ? new Date(this.filtros.dataFim) : null

        return (
          (!termo || texto.includes(termo)) &&
          (!this.filtros.comLote || (this.filtros.comLote === 'sim' ? i.lote : !i.lote)) &&
          (!this.filtros.comValidade || (this.filtros.comValidade === 'sim' ? i.data_validade : !i.data_validade)) &&
          (!inicio || (dataOp && dataOp >= inicio)) &&
          (!fim || (dataOp && dataOp <= fim))
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
    formatarData(ts) {
      if (!ts) return '--'
      return new Date(Number(ts)).toLocaleDateString('pt-BR')
    },
    formatarDataHora(ts) {
      if (!ts) return '--'
      return new Date(Number(ts)).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    limparFiltros() {
      this.filtros = { comLote: '', comValidade: '', dataInicio: '', dataFim: '' }
    },
    async receberItens() {
      try {
        this.loading = true
        const res = await api.get(`/mvpu/estoque/historicoSaidas/${this.auth.id_loja}`)
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
.card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 400px; }

/* HEADER */
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 450px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: #1e293b; }
.search-box i { color: #94a3b8; }

/* FILTROS */
.filters-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.filters-grid { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 12px; }
.custom-select, .custom-input { padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: white; outline: none; transition: 0.2s; }
.custom-input:focus, .custom-select:focus { border-color: #5A0F83; }

.date-input-group { display: flex; align-items: center; gap: 8px; }
.date-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 600; text-decoration: underline; }

/* TABELA */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1.25rem 1rem !important;
}

.barcode-text { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #4f46e5; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 13px; }
.text-sm { font-size: 13px; }
.text-muted { color: #64748b !important; }
.quantity-text { color: #1e293b; font-size: 15px; }
.user-name { color: #5A0F83; }
.op-date-time { color: #334155; }
.d-block { display: block; }

/* PAGINAÇÃO */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content {
  display: flex; align-items: center; gap: 16px; background: #fff; padding: 6px 12px; border-radius: 50px;
  border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.03);
}

.nav-btn {
  width: 40px !important; height: 40px !important; background: #f97316 !important; border: none !important;
  border-radius: 50% !important; color: #ffffff !important; display: flex !important;
  align-items: center !important; justify-content: center !important; transition: all 0.2s ease;
}
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; opacity: 0.7; cursor: not-allowed; }

.page-info { font-size: 14px; color: #64748b; }
.current-page { font-weight: 700; color: #1e293b; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
</style>