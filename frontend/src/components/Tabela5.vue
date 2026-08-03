<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por CNPJ ou Nome Fantasia..."
          v-model="search"
        />
      </div>

      <div class="actions">
        <div v-if="selectedIds.length > 0" class="dropdown-wrapper" ref="actionsRef">
          <Button 
            icon="pi pi-ellipsis-v" 
            @click="toggleActions" 
            rounded 
            text 
            severity="secondary" 
          />
          <div v-if="showActions" class="dropdown">
            <button v-if="selectedIds.length === 1">
              <i class="pi pi-pencil"></i> Editar
            </button>
            <button class="danger">
              <i class="pi pi-trash"></i> Deletar
            </button>
          </div>
        </div>
      </div>
    </div>

    <DataTable
      v-if="!loading && lojasFiltradas.length > 0"
      :value="lojasPaginadas"
      dataKey="id_loja"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column style="width: 3rem">
        <template #header>
          <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
        </template>
        <template #body="{ data }">
          <input type="checkbox" :value="data.id_loja" v-model="selectedIds" />
        </template>
      </Column>

      <Column expander style="width: 3rem" />

      <Column header="Nome Fantasia">
        <template #body="{ data }">
          <span class="font-bold text-dark">{{ data.nome_fantasia }}</span>
        </template>
      </Column>

      <Column header="CNPJ">
        <template #body="{ data }">
          <span class="cnpj-text">{{ data.cnpj }}</span>
        </template>
      </Column>

      <Column header="CEP" field="cep" />

      <Column header="Email Empresa">
        <template #body="{ data }">
          <span class="text-sm text-muted">{{ data.email_empresa }}</span>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div class="details-grid">
            <div class="option-card">
              <h4 class="option-title title-1">Documentação e Registro</h4>
              <div class="info-group">
                <span class="label">Razão Social</span>
                <span class="value">{{ data.razao_social || '--' }}</span>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Inscrição Estadual</span>
                  <span class="value">{{ data.inscricao_estadual || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Código Login</span>
                  <span class="value barcode">{{ data.cod_login || '--' }}</span>
                </div>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-2">Localização e Contato</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Telefone</span>
                  <span class="value">{{ data.telefone || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Celular</span>
                  <span class="value">{{ data.celular || '--' }}</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Endereço</span>
                  <span class="value">{{ data.rua || '--' }}, {{ data.cidade }} - {{ data.estado }}</span>
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
      <span class="muted mt-2">Buscando lojas...</span>
    </div>

    <div v-else-if="!loading && lojasFiltradas.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Não foram encontrados resultados para a sua busca...</div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'
import exibeErro from '@/utils/ExibeErro'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

export default {
  name: 'TabelaLojas',
  components: { ProgressSpinner, DataTable, Column, Button },
  data() {
    return {
      search: '',
      loading: false,
      showActions: false,
      expandedRows: [],
      selectedIds: [],
      lojas: [],
      paginaAtual: 1,
      itensPorPagina: 8
    }
  },
  computed: {
    lojasFiltradas() {
      const termo = this.search.toLowerCase()
      return this.lojas.filter(l =>
        l.nome_fantasia.toLowerCase().includes(termo) ||
        l.cnpj.includes(termo)
      )
    },
    totalPaginas() {
      return Math.ceil(this.lojasFiltradas.length / this.itensPorPagina) || 1
    },
    lojasPaginadas() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.lojasFiltradas.slice(inicio, inicio + this.itensPorPagina)
    },
    allSelected() {
      return this.lojasPaginadas.length > 0 && this.selectedIds.length === this.lojasPaginadas.length
    }
  },
  watch: {
    search() {
      this.paginaAtual = 1
      this.selectedIds = []
    }
  },
  methods: {
    toggleActions() { this.showActions = !this.showActions },
    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.lojasPaginadas.map(l => l.id_loja) : []
    },
    handleClickOutside(event) {
      if (this.$refs.actionsRef && !this.$refs.actionsRef.contains(event.target)) {
        this.showActions = false
      }
    },
    async receberTodos() {
      try {
        this.loading = true
        const response = await api.get('/mvpu/usuario/consultarLojas')
        this.lojas = response.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
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
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 450px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: #1e293b; }
.search-box i { color: #94a3b8; }

/* DROPDOWN ACTIONS */
.dropdown-wrapper { position: relative; }
.dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); min-width: 150px; z-index: 100; border: 1px solid #f1f5f9; overflow: hidden; }
.dropdown button { width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; color: #475569; }
.dropdown button:hover { background: #f8fafc; color: #5A0F83; }
.dropdown .danger { color: #ef4444; }
.dropdown .danger:hover { background: #fef2f2; }

/* TABELA STYLES */
.cnpj-text { font-family: monospace; color: #64748b; font-weight: 500; }
.text-dark { color: #1e293b; }
.text-muted { color: #94a3b8; }
.font-bold { font-weight: 700; }

/* EXPANSÃO */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #5A0F83; }
.title-2 { color: #0284c7; }

.info-row { display: flex; gap: 20px; }
.info-group { display: flex; flex-direction: column; flex: 1; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 13px; color: #1e293b; font-weight: 500; }
.barcode { font-family: monospace; color: #4f46e5; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; }

/* PAGINAÇÃO */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; }
.pagination-content { display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px; border: 1px solid #e2e8f0; }
.nav-btn { width: 40px !important; height: 40px !important; background: #f97316 !important; border: none !important; border-radius: 50% !important; color: #fff !important; cursor: pointer; }
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; cursor: not-allowed; opacity: 0.7; }
.page-info { font-size: 14px; color: #64748b; }
.current-page { font-weight: 700; color: #1e293b; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.mt-3 { margin-top: 1rem; }
</style>