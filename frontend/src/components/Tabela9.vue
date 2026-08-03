<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por terminal, localização, responsável ou status..."
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
          <option value="aberto">Aberto</option>
        </select>

        <input 
          type="number" 
          placeholder="Valor inicial mín." 
          v-model.number="filtros.valorMin" 
          class="custom-input" 
        />
        
        <input 
          type="number" 
          placeholder="Valor inicial máx." 
          v-model.number="filtros.valorMax" 
          class="custom-input" 
        />
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && turnosFiltrados.length > 0"
      :value="turnosPaginados"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
      dataKey="inicio_em"
    >
      <Column expander style="width: 3rem" />

      <Column header="Terminal">
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

      <Column header="Responsável">
        <template #body="{ data }">
          <span class="text-sm font-medium user-text">{{ data.responsavel }}</span>
        </template>
      </Column>

      <Column header="Início">
        <template #body="{ data }">
          <span class="text-sm text-muted">{{ formatarDataHora(data.inicio_em) }}</span>
        </template>
      </Column>

      <Column header="Vlr. Inicial">
        <template #body="{ data }">
          <span class="font-bold">R$ {{ data.valor_inicial?.toFixed(2) }}</span>
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag 
            :value="data.status" 
            severity="success"
          />
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div class="details-grid">
            
            <div class="option-card">
              <h4 class="option-title title-1">Identificação</h4>
              <div class="info-group">
                <span class="label">ID Terminal</span>
                <span class="value">#{{ data.id_terminal }}</span>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Início em</span>
                  <span class="value">{{ formatarDataHora(data.inicio_em) }}</span>
                </div>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-2">Financeiro (Parcial)</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Valor Inicial</span>
                  <span class="value">R$ {{ data.valor_inicial?.toFixed(2) }}</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Suprimentos</span>
                  <span class="value text-success">+ R$ {{ data.valor_suprimentos ?? 0 }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Sangrias</span>
                  <span class="value text-danger">- R$ {{ data.valor_sangrias ?? 0 }}</span>
                </div>
              </div>
            </div>

            <div class="option-card full-width">
              <h4 class="option-title title-3">Observações</h4>
              <p class="value obs-text">{{ data.observacoes || 'Nenhuma observação registrada para este turno aberto.' }}</p>
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
      <span class="muted mt-2">Buscando turnos abertos...</span>
    </div>

    <div v-else-if="!loading && turnosFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Nenhum turno aberto encontrado...</div>
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
  name: 'TabelaTurnosAbertos',
  components: { ProgressSpinner, DataTable, Column, Tag, Button },
  data() {
    return {
      search: '',
      loading: false,
      showFilters: false,
      expandedRows: [],
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      filtros: {
        status: '',
        valorMin: null,
        valorMax: null
      },
      turnos: []
    }
  },
  computed: {
    turnosFiltrados() {
      const termo = this.search.toLowerCase().trim()
      return this.turnos.filter(t => {
        const texto = `${t.nome} ${t.localizacao} ${t.responsavel} ${t.status}`.toLowerCase()
        return (
          (!termo || texto.includes(termo)) &&
          (!this.filtros.status || t.status === this.filtros.status) &&
          (this.filtros.valorMin == null || t.valor_inicial >= this.filtros.valorMin) &&
          (this.filtros.valorMax == null || t.valor_inicial <= this.filtros.valorMax)
        )
      })
    },
    totalPaginas() { 
      return Math.ceil(this.turnosFiltrados.length / this.itensPorPagina) || 1
    },
    turnosPaginados() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.turnosFiltrados.slice(inicio, inicio + this.itensPorPagina)
    }
  },
  watch: {
    search() { this.paginaAtual = 1 },
    filtros: { deep: true, handler() { this.paginaAtual = 1 } }
  },
  methods: {
    formatarDataHora(valor) {
      const data = new Date(Number(valor))
      if (isNaN(data.getTime())) return '--'
      return data.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    },
    limparFiltros() {
      this.filtros = { status: '', valorMin: null, valorMax: null }
    },
    async receberTurnosAbertos() {
      try {
        this.loading = true
        const res = await api.get(`/mvpu/loja/turno/consultaTurno/${this.auth.id_loja}`)
        this.turnos = res.data.data?.aberto.reverse() || []
      } catch (e) {
        this.turnos = []
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.auth = useAuthStore()
    this.receberTurnosAbertos()
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
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 500; }

/* TABELA */
:deep(.p-datatable .p-datatable-tbody > tr > td) { padding: 1.1rem 1rem !important; }
.text-dark { color: #1e293b; }
.text-muted { color: #64748b; }
.loc-tag { color: #0284c7; font-weight: 500; background: #f0f9ff; padding: 4px 8px; border-radius: 6px; }
.user-text { color: #5A0F83; }

/* EXPANSÃO */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.option-card.full-width { grid-column: 1 / -1; }
.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #5A0F83; }
.title-2 { color: #0284c7; }
.title-3 { color: #f97316; }

.info-row { display: flex; gap: 20px; }
.info-group { display: flex; flex-direction: column; flex: 1; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 14px; color: #1e293b; font-weight: 500; }
.obs-text { font-style: italic; color: #475569; line-height: 1.5; }

/* PAGINAÇÃO */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content {
  display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px;
  border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.nav-btn {
  width: 40px !important; height: 40px !important; background: #f97316 !important; border: none !important;
  border-radius: 50% !important; color: #ffffff !important; display: flex !important;
  align-items: center !important; justify-content: center !important; cursor: pointer; transition: all 0.2s ease;
}
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; opacity: 0.7; cursor: not-allowed; }
.current-page { font-weight: 700; color: #1e293b; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.text-success { color: #10b981 !important; }
.text-danger { color: #ef4444 !important; }
.mt-3 { margin-top: 1rem; }
</style>