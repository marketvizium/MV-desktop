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
        <div class="filter-group">
          <label class="filter-label">Lote</label>
          <select v-model="filtros.comLote" class="custom-select">
            <option value="">Todos</option>
            <option value="sim">Com lote</option>
            <option value="nao">Sem lote</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Validade</label>
          <select v-model="filtros.comValidade" class="custom-select">
            <option value="">Todas</option>
            <option value="sim">Com validade</option>
            <option value="nao">Sem validade</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Data Início</label>
          <input type="date" v-model="filtros.dataInicio" class="custom-input" />
        </div>

        <div class="filter-group">
          <label class="filter-label">Data Fim</label>
          <input type="date" v-model="filtros.dataFim" class="custom-input" />
        </div>
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && itensFiltrados.length > 0"
      :value="itensPaginados"
      v-model:expandedRows="expandedRows"
      dataKey="id" 
      responsiveLayout="scroll"
      stripedRows
      rowHover
      class="custom-table"
    >
      <Column expander style="width: 3rem" />

      <Column header="Código de barras">
        <template #body="{ data }">
          <span class="barcode-text">{{ data.codigo_barra }}</span>
        </template>
      </Column>

      <Column header="Qtd">
        <template #body="{ data }">
          <span class="font-bold quantity-badge">{{ data.quantidade }}</span>
        </template>
      </Column>

      <Column header="Preço Custo">
        <template #body="{ data }">
          <span class="font-bold cost-text">
            {{ data.preco_custo ? `R$ ${Number(data.preco_custo).toFixed(2)}` : '--' }}
          </span>
        </template>
      </Column>

      <Column header="Lote">
        <template #body="{ data }">
          <span class="text-muted">{{ data.lote || '--' }}</span>
        </template>
      </Column>

      <Column header="Validade">
        <template #body="{ data }">
          <span class="text-sm">{{ formatarData(data.data_validade) }}</span>
        </template>
      </Column>

      <Column header="Data/Hora Operação">
        <template #body="{ data }">
          <div class="op-date-container">
            <span class="text-sm font-medium op-date">{{ formatarDataHora(data.data_operacao) }}</span>
          </div>
        </template>
      </Column>

      <Column header="Responsável">
        <template #body="{ data }">
          <span class="text-sm font-medium user-text">{{ data.responsavel }}</span>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="expansion-container">
          <div class="supplier-card">
            <div class="supplier-header">
              <i class="pi pi-truck"></i>
              <span>Informações do Fornecedor</span>
            </div>
            <div class="supplier-content">
              <div class="info-item">
                <label>Razão Social / Nome</label>
                <p>{{ slotProps.data.nome_fornecedor || 'Não informado' }}</p>
              </div>
              <div class="info-item">
                <label>CNPJ</label>
                <p>{{ slotProps.data.cnpj || 'Não informado' }}</p>
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

    <div v-if="loading" class="feedback-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted-text">Processando histórico...</span>
    </div>

    <div v-else-if="!loading && itensFiltrados.length === 0" class="feedback-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="empty-text">Nenhum registro encontrado para essa busca.</div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import exibeErro from '@/utils/ExibeErro';
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

export default {
  name: 'TabelaHistoricoEntradas',
  components: { ProgressSpinner, DataTable, Column, Button },

  data() {
    return {
      search: '',
      loading: false,
      showFilters: false,
      expandedRows: [], // Necessário para controlar as linhas abertas
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
        const texto = `${i.codigo_barra} ${i.lote ?? ''} ${i.responsavel} ${i.nome_fornecedor ?? ''}`.toLowerCase()
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
    limparFiltros() {
      this.filtros = { comLote:'', comValidade:'', dataInicio:'', dataFim:'' }
    },
    formatarData(valor) {
      if (!valor) return '--'
      return new Date(Number(valor)).toLocaleDateString('pt-BR')
    },
    formatarDataHora(valor) {
      if (!valor) return '--'
      return new Date(Number(valor)).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async receberItens() {
      try {
        this.loading = true
        this.auth = useAuthStore()
        const res = await api.get(`/mvpu/estoque/historicoEntradas/${this.auth.id_loja}`)
        console.log(res)
        // Garantindo que cada item tenha um ID único para o DataTable expander funcionar bem
        this.itens = res.data.data.map((item, index) => ({
          ...item,
          id: item.id || index 
        })).reverse()
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
/* ESTILOS ORIGINAIS MANTIDOS */
.card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); min-height: 450px; font-family: 'Poppins', sans-serif; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 18px; gap: 12px; width: 100%; max-width: 480px; transition: all 0.3s; }
.search-box:focus-within { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: #1e293b; }
.search-box i { color: #94a3b8; font-size: 1.1rem; }

/* FILTROS */
.filters-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px; animation: slideDown 0.3s ease; }
.filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px; }
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.custom-select, .custom-input { padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 13px; background: white; outline: none; transition: border 0.2s; color: #334155; }
.custom-select:focus, .custom-input:focus { border-color: #f97316; }
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 600; text-decoration: underline; opacity: 0.8; transition: 0.2s; }

/* ESTILIZAÇÃO DA TABELA */
:deep(.p-datatable .p-datatable-thead > tr > th) { background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; padding: 16px; border: none; }
:deep(.p-datatable .p-datatable-tbody > tr > td) { padding: 18px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }

.barcode-text { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #4f46e5; background: #eef2ff; padding: 4px 10px; border-radius: 6px; font-size: 13px; }
.quantity-badge { color: #1e293b; font-size: 15px; }
.cost-text { color: #10b981; } 
.op-date { color: #0284c7; font-weight: 600; }
.user-text { color: #5A0F83; }

/* NOVO: DESIGN DA EXPANSÃO (FORNECEDOR) */
.expansion-container {
  padding: 1rem 2rem;
  background-color: #fbfcfe;
}

.supplier-card {
  background: #ffffff;
  border-left: 4px solid #f97316;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.supplier-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #f97316;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.supplier-content {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.info-item label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.info-item p {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

/* PAGINAÇÃO */
.pagination-container { display: flex; justify-content: center; margin-top: 40px; }
.pagination-content { display: flex; align-items: center; gap: 20px; background: #fff; padding: 8px 16px; border-radius: 50px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.nav-btn { width: 42px !important; height: 42px !important; background: #f97316 !important; border: none !important; border-radius: 50% !important; color: #fff !important; transition: 0.3s; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2); }
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: translateY(-2px); }
.nav-btn:disabled { background: #fed7aa !important; box-shadow: none; opacity: 0.6; cursor: not-allowed; }
.page-info { font-size: 14px; color: #64748b; }
.current-page { font-weight: 800; color: #f97316; font-size: 16px; }

/* FEEDBACKS & ANIMAÇÕES */
.feedback-container { display: flex; flex-direction: column; align-items: center; padding: 80px 0; gap: 16px; }
.muted-text { color: #94a3b8; font-weight: 500; }
.empty-img { max-width: 200px; opacity: 0.8; }
.empty-text { font-family: 'Poppins'; color: #64748b; font-size: 15px; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .table-header { flex-direction: column; align-items: stretch; }
  .search-box { max-width: 100%; }
  .supplier-content { gap: 20px; }
}
</style>