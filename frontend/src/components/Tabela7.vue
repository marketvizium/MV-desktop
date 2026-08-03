<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por nome, localização ou ID do terminal..."
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
          <option value="online">Online</option>
          <option value="manutencao">Manutenção</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && terminaisFiltrados.length > 0"
      :value="terminaisPaginados"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      dataKey="id_terminal"
    >
      <Column header="ID Terminal">
        <template #body="{ data }">
          <span class="id-text">#{{ data.id_terminal }}</span>
        </template>
      </Column>

      <Column header="Nome">
        <template #body="{ data }">
          <span class="font-bold text-dark">{{ data.nome }}</span>
        </template>
      </Column>

      <Column header="Localização">
        <template #body="{ data }">
          <span class="text-sm loc-tag">
            <i class="pi pi-map-marker"></i> {{ data.localizacao }}
          </span>
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

      <Column header="Criado em">
        <template #body="{ data }">
          <span class="text-sm text-muted">{{ formatarDataHora(data.criado_em) }}</span>
        </template>
      </Column>

      <Column header="Atualizado em">
        <template #body="{ data }">
          <span class="text-sm text-muted">
            {{ data.atualizado_em ? formatarDataHora(data.atualizado_em) : '--' }}
          </span>
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
          aria-label="Voltar Página"
        />
        
        <div class="page-info">
          Página <span class="current-page">{{ paginaAtual }}</span> de <b>{{ totalPaginas }}</b>
        </div>

        <Button 
          icon="pi pi-chevron-right" 
          @click="paginaAtual++" 
          :disabled="paginaAtual === totalPaginas" 
          class="nav-btn"
          aria-label="Próxima Página"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Buscando terminais...</span>
    </div>

    <div v-else-if="!loading && terminaisFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Não foram encontrados terminais para a sua busca...</div>
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
  name: 'TabelaTerminais',
  components: { ProgressSpinner, DataTable, Column, Tag, Button },
  data() {
    return {
      search: '',
      loading: false,
      showFilters: false,
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      filtros: {
        status: ''
      },
      terminais: []
    }
  },
  computed: {
    terminaisFiltrados() {
      const termo = this.search.toLowerCase().trim()
      return this.terminais.filter(t => {
        const textoBase = `
          ${t.id_terminal ?? ''}
          ${t.nome ?? ''}
          ${t.localizacao ?? ''}
        `.toLowerCase()

        return (
          (!termo || textoBase.includes(termo)) &&
          (!this.filtros.status || t.status === this.filtros.status)
        )
      })
    },
    totalPaginas() {
      return Math.ceil(this.terminaisFiltrados.length / this.itensPorPagina) || 1
    },
    terminaisPaginados() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.terminaisFiltrados.slice(inicio, inicio + this.itensPorPagina)
    }
  },
  watch: {
    search() { this.paginaAtual = 1 },
    filtros: { deep: true, handler() { this.paginaAtual = 1 } }
  },
  methods: {
    getSeverityStatus(status) {
      const map = { 
        online: 'success', 
        manutencao: 'warn', 
        offline: 'secondary' // ou danger se preferir destacar
      }
      return map[status.toLowerCase()] || 'info'
    },
    formatarDataHora(valor) {
      const data = new Date(Number(valor))
      if (isNaN(data.getTime())) return '--'
      return data.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    },
    limparFiltros() {
      this.filtros = { status: '' }
    },
    async receberTodos() {
      try {
        this.loading = true
        const response = await api.get(`/mvpu/loja/terminal/consultar/${this.auth.id_loja}`)
        this.terminais = response.data.data || []
      } catch (e) {
        this.terminais = []
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.auth = useAuthStore()
    this.receberTodos()
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
.custom-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: white; outline: none; min-width: 180px; }
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 500; }

/* TABELA */
.id-text { font-family: monospace; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.text-dark { color: #1e293b; }
.text-sm { font-size: 13px; }
.text-muted { color: #64748b; }
.loc-tag { color: #0284c7; font-weight: 500; display: flex; align-items: center; gap: 4px; }

/* PAGINAÇÃO */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content {
  display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px;
  border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.nav-btn {
  width: 40px !important;
  height: 40px !important;
  background: #f97316 !important; /* LARANJA */
  border: none !important;
  border-radius: 50% !important;
  color: #ffffff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; color: #ffffff !important; cursor: not-allowed; opacity: 0.7; }

:deep(.nav-btn .p-button-icon) { font-size: 1.2rem !important; font-weight: bold !important; }

.page-info { font-size: 14px; color: #64748b; user-select: none; }
.current-page { font-weight: 700; color: #1e293b; padding: 0 4px; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.poppins-regular { color: #64748b; font-size: 15px; }
.mt-2 { margin-top: 0.5rem; }
</style>