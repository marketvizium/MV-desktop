<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por nome ou CNPJ..."
          v-model="search"
          @input="paginaAtual = 1"
        />
      </div>

      <div class="actions-right">
        <div v-if="selectedIds.length > 0" class="dropdown-wrapper" ref="actionsRef">
          <Button 
            icon="pi pi-ellipsis-v" 
            @click="toggleActions" 
            rounded 
            text 
            severity="secondary"
            style="height: 42px;"
          />
          <div v-if="showActions" class="dropdown">
            <button v-if="selectedIds.length === 1" class="dropdown-item">
              <i class="pi pi-pencil"></i> Editar
            </button>
            <button class="dropdown-item danger">
              <i class="pi pi-trash"></i> Deletar
            </button>
          </div>
        </div>

        <div class="dropdown-wrapper" ref="filterRef">
          <Button 
            type="button" 
            icon="pi pi-filter" 
            :label="filterStatus ? `Status: ${filterStatus}` : 'Filtrar por'" 
            @click="toggleFilter" 
            class="btn-filter-custom"
          />
          <div v-if="showFilter" class="dropdown">
            <button class="dropdown-item" @click="applyFilter('ativo')">Ativo</button>
            <button class="dropdown-item" @click="applyFilter('desativado')">Desativado</button>
            <button class="dropdown-item link-clear-dropdown" @click="clearFilters">
              Limpar filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <DataTable
      v-if="!loading && fornecedoresFiltrados.length > 0"
      :value="fornecedoresPaginados"
      dataKey="id_fornecedor"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="Fornecedor">
        <template #body="{ data }">
          <span class="font-bold text-dark">{{ data.nome_fornecedor }}</span>
        </template>
      </Column>

      <Column header="CNPJ">
        <template #body="{ data }">
          <span class="barcode-text">{{ data.cnpj || '--' }}</span>
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag 
            :value="data.status" 
            :severity="data.status === 'ativo' ? 'success' : 'danger'"
          />
        </template>
      </Column>

      <Column header="Criado em">
        <template #body="{ data }">
          <span class="text-sm text-muted">{{ data.criado_em_formatado }}</span>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div class="details-grid">
            
            <div class="option-card">
              <h4 class="option-title title-1">Dados Cadastrais</h4>
              <div class="info-group">
                <span class="label">Razão Social</span>
                <span class="value">{{ data.razao_social || 'N/A' }}</span>
              </div>
              <div class="info-group mt-3">
                <span class="label">Nome Fantasia</span>
                <span class="value">{{ data.nome_fantasia || 'N/A' }}</span>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-2">Contato e Comunicação</h4>
              <div class="info-group">
                <span class="label">E-mail Principal</span>
                <span class="value">{{ data.email_principal || 'N/A' }}</span>
              </div>
              <div class="info-group mt-3">
                <span class="label">Telefone</span>
                <span class="value">{{ data.telefone_principal || 'N/A' }}</span>
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
      <span class="muted mt-2">Carregando fornecedores...</span>
    </div>

    <div v-else-if="!loading && (fornecedores.length === 0 || fornecedoresFiltrados.length === 0)" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Não foram encontrados resultados para a sua busca...</div>
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
  name: 'TabelaFornecedores',
  components: { ProgressSpinner, DataTable, Column, Tag, Button },
  data() {
    return {
      search: '',
      filterStatus: null,
      loading: false,
      showActions: false,
      showFilter: false,
      expandedRows: [],
      selectedIds: [],
      fornecedores: [],
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 15
    }
  },
  computed: {
    fornecedoresFiltrados() {
      const searchLower = this.search.toLowerCase()
      return this.fornecedores.filter(f => {
        const matchSearch = f.nome_fornecedor.toLowerCase().includes(searchLower) || (f.cnpj || '').includes(searchLower)
        const matchStatus = !this.filterStatus || f.status === this.filterStatus
        return matchSearch && matchStatus
      })
    },
    fornecedoresPaginados() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.fornecedoresFiltrados.slice(inicio, inicio + this.itensPorPagina)
    },
    totalPaginas() {
      return Math.ceil(this.fornecedoresFiltrados.length / this.itensPorPagina) || 1
    },
    allSelected() {
      return this.fornecedoresPaginados.length > 0 && this.selectedIds.length === this.fornecedoresPaginados.length
    }
  },
  methods: {
    toggleActions() { this.showActions = !this.showActions },
    toggleFilter() { this.showFilter = !this.showFilter },
    applyFilter(status) {
      this.filterStatus = status
      this.showFilter = false
      this.paginaAtual = 1
    },
    clearFilters() {
      this.filterStatus = null
      this.search = ''
      this.showFilter = false
      this.paginaAtual = 1
    },
    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.fornecedoresPaginados.map(f => f.id_fornecedor) : []
    },
    handleClickOutside(event) {
      if (this.$refs.filterRef && !this.$refs.filterRef.contains(event.target)) this.showFilter = false
      if (this.$refs.actionsRef && !this.$refs.actionsRef.contains(event.target)) this.showActions = false
    },
    formatarData(timestamp) {
      const date = new Date(Number(timestamp))
      return date.toLocaleDateString('pt-BR')
    },
    async receberTodos() {
      try {

        this.loading = true
        this.auth = useAuthStore()
        const {data}  = await api.get(`/mvpu/produto/consultarFornecedores/${this.auth.id_loja}`)
        console.log(data)

        if(!Array.isArray(data.data)){
          return
        }

        if(!data.data.length){
          return
        }

        this.fornecedores = data.data.map(f => ({
          ...f,
          status: f.status === 'ativo' ? 'ativo' : 'desativado',
          criado_em_formatado: this.formatarData(f.criado_em)
        }))
      } catch (e) {
        exibeErro(e, this.$toast)
        this.fornecedores = []
      } finally {
        this.loading = false
      }

    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    this.receberTodos()
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.card { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 400px; }

/* HEADER */
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 10px; }
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 450px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: #1e293b; }
.search-box i { color: #94a3b8; }

.actions-right { display: flex; align-items: center; gap: 12px; }

/* BOTAO FILTRAR */
.btn-filter-custom { background: #f97316 !important; border: none !important; border-radius: 10px !important; padding: 10px 20px !important; height: 42px; font-weight: 600 !important; }

/* DROPDOWN */
.dropdown-wrapper { position: relative; }
.dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); min-width: 170px; z-index: 100; border: 1px solid #f1f5f9; overflow: hidden; }
.dropdown-item { width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 10px; color: #475569; }
.dropdown-item:hover { background: #f8fafc; color: #5A0F83; }
.dropdown-item.danger { color: #ef4444; }
.dropdown-item.link-clear-dropdown { border-top: 1px solid #f1f5f9; color: #5A0F83; font-weight: 600; }

/* TABELA */
.barcode-text { font-family: monospace; font-weight: 600; color: #222; }
.text-dark { color: #1e293b; }
.text-muted { color: #64748b; font-size: 13px; }

/* EXPANSÃO EM CARDS */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #5A0F83; }
.title-2 { color: #0284c7; }

.info-group { display: flex; flex-direction: column; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 14px; color: #1e293b; font-weight: 500; }

/* PAGINAÇÃO CIRCULAR (LARANJA) */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content { display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px; border: 1px solid #e2e8f0; }
.nav-btn { 
  width: 40px !important; height: 40px !important; 
  background: #f97316 !important; border: none !important; 
  border-radius: 50% !important; color: #ffffff !important; 
  display: flex !important; align-items: center !important; justify-content: center !important; 
  transition: all 0.2s ease; cursor: pointer; 
}
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; cursor: not-allowed; opacity: 0.7; }
.page-info { font-size: 14px; color: #64748b; user-select: none; }
.current-page { font-weight: 700; color: #1e293b; padding: 0 4px; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.mt-3 { margin-top: 1rem; }

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  /* Define a animação: nome | duração | timing | repetição */
  animation: pulse-subtle 2s infinite ease-in-out;
}

/* Cor Verde (Sync) */
.dot-green {
  background-color: #22c55e;
  box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
}

/* Cor Vermelha (Not Sync) */
.dot-red {
  background-color: #ef4444;
  box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
}

/* Animação de aumentar e diminuir sutilmente */
@keyframes pulse-subtle {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.15); /* Aumenta sutilmente */
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}
</style>