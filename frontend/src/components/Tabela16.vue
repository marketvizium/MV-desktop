<template>
  <div class="card">

    <!-- HEADER -->
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          id="search-input"
          type="text"
          placeholder="Pesquisar por código, lote, responsável ou status..."
          v-model="search"
        />
      </div>

      <div class="actions">
        <Button
          id="btn-filtros"
          icon="pi pi-filter"
          label="Filtros"
          outlined
          @click="showFilters = !showFilters"
          class="btn-filter"
        />
      </div>
    </div>

    <!-- FILTROS -->
    <div v-if="showFilters" class="filters-panel">

      <div class="filters-grid">

        <select id="filtro-status" v-model="filtros.status" class="custom-select">
          <option value="">Status (Todos)</option>
          <option value="ativo">Ativo</option>
          <option value="vencido">Vencido</option>
          <option value="alerta">Alerta</option>
        </select>

        <select id="filtro-lote" v-model="filtros.comLote" class="custom-select">
          <option value="">Lote (Todos)</option>
          <option value="sim">Com lote</option>
          <option value="nao">Sem lote</option>
        </select>

        <select id="filtro-validade" v-model="filtros.comValidade" class="custom-select">
          <option value="">Validade (Todos)</option>
          <option value="sim">Com validade</option>
          <option value="nao">Sem validade</option>
        </select>

        <input id="qtd-min" type="number" placeholder="Qtd mín."
          v-model.number="filtros.qtdMin" class="custom-input" />

        <input id="qtd-max" type="number" placeholder="Qtd máx."
          v-model.number="filtros.qtdMax" class="custom-input" />

      </div>

      <button id="limpar-filtros" class="link-clear" @click="limparFiltros">
        Limpar todos os filtros
      </button>
    </div>

    <!-- TABELA -->
    <DataTable
      v-if="!loading && paginaAtualItens.length"
      :value="paginaAtualItens"
      dataKey="_rowId"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >

      <Column expander style="width:3rem" />

      <Column header="Código de barras">
        <template #body="{ data }">
          <span :id="`codigo-${data._rowId}`" class="barcode-text" style="font-family: 'Poppins'; color: #222; font-size: 13px;">
            {{ data.codigo_barra }}
          </span>
        </template>
      </Column>

      <Column header="Qtd">
        <template #body="{ data }">
          <span :id="`qtd-${data._rowId}`" class="font-bold">
            {{ data.quantidade }}
          </span>
        </template>
      </Column>

      <Column header="Sincronização">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <!-- Bolinha com classe dinâmica -->
            <span :class="['status-dot', data.status_interno === 'sync' ? 'dot-green' : 'dot-red']"></span>
            
            <span class="text-sm text-muted" style=" margin-left: 10px;">
              {{ data.status_interno === 'sync' ? 'Sincronizado' : 'Pendente' }}
            </span>
          </div>
        </template>
      </Column>

      <Column header="Validade">
        <template #body="{ data }">
          {{ formatarData(data.data_validade) }}
        </template>
      </Column>

      <Column header="Responsável entrada">
        <template #body="{ data }">
          {{ data.responsavel }}
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

      <!-- EXPANSÃO -->
      <template #expansion="{ data }">
        <div
          style="
            background:#fafafa;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:18px;
            margin:8px 0;
          "
        >

          <!-- GRID PRINCIPAL -->
          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:20px;
            "
          >

            <!-- ================= IDENTIFICAÇÃO ================= -->
            <div>
              <div
                style="
                  font-weight:600;
                  font-size:14px;
                  margin-bottom:10px;
                  color:#374151;
                  border-bottom:1px solid #e5e7eb;
                  padding-bottom:6px;
                "
              >
                Identificação do Item
              </div>

              <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <tbody>

                  <tr>
                    <td style="color:#6b7280; padding:6px 0; width:40%;">
                      Código de barras
                    </td>
                    <td
                      style="
                        font-family:monospace;
                        letter-spacing:.5px;
                        font-weight:600;
                      "
                    >
                      {{ data.codigo_barra }}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#6b7280; padding:6px 0;">
                      Responsável entrada
                    </td>
                    <td style="font-weight:500;">
                      {{ data.responsavel }}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            <!-- ================= LOGÍSTICA ================= -->
            <div>
              <div
                style="
                  font-weight:600;
                  font-size:14px;
                  margin-bottom:10px;
                  color:#374151;
                  border-bottom:1px solid #e5e7eb;
                  padding-bottom:6px;
                "
              >
                Logística e Prazo
              </div>

              <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <tbody>

                  <tr>
                    <td style="color:#6b7280; padding:6px 0; width:40%;">
                      Lote
                    </td>
                    <td style="font-weight:500;">
                      {{ data.lote || 'N/A' }}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#6b7280; padding:6px 0;">
                      Quantidade
                    </td>
                    <td style="font-weight:600;">
                      {{ data.quantidade }}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#6b7280; padding:6px 0;">
                      Validade
                    </td>
                    <td>
                      {{ formatarData(data.data_validade) }}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#6b7280; padding:6px 0;">
                      Status
                    </td>
                    <td>
                      <span
                        :style="{
                          padding:'4px 10px',
                          borderRadius:'6px',
                          fontSize:'12px',
                          fontWeight:'600',
                          background:
                            data.status.toLowerCase()==='ativo' ? '#dcfce7' :
                            data.status.toLowerCase()==='alerta' ? '#fef9c3' :
                            '#fee2e2',
                          color:
                            data.status.toLowerCase()==='ativo' ? '#166534' :
                            data.status.toLowerCase()==='alerta' ? '#854d0e' :
                            '#991b1b'
                        }"
                      >
                        {{ data.status }}
                      </span>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        </div>
      </template>

    </DataTable>

    <!-- PAGINAÇÃO -->
    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <div class="pagination-content">

        <button
          id="btn-prev"
          class="nav-btn"
          @click="paginaAtual--"
          :disabled="paginaAtual === 1"
        >&#10094;</button>

        <div class="page-info">
          Página <span class="current-page">{{ paginaAtual }}</span>
          de <b>{{ totalPaginas }}</b>
        </div>

        <button
          id="btn-next"
          class="nav-btn"
          @click="paginaAtual++"
          :disabled="paginaAtual === totalPaginas"
        >&#10095;</button>

      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <span class="muted mt-2">Buscando estoque...</span>
    </div>

    <!-- EMPTY -->
    <div v-else-if="!loading && !paginaAtualItens.length" class="empty-container">
      <img src="../assets/img/Programming.gif" class="empty-img" />
      <div>Nenhum item encontrado no estoque...</div>
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
      paginaAtual: 1,
      itensPorPagina: 20,
      auth: null,

      filtros: {
        status: '',
        qtdMin: null,
        qtdMax: null,
        comLote: '',
        comValidade: ''
      },

      itensBrutos: []
    }
  },

  computed: {
    itensFiltrados() {
      const termo = this.search.toLowerCase()

      return this.itensBrutos.filter(i => {
        const texto =
          `${i.codigo_barra} ${i.lote ?? ''} ${i.responsavel} ${i.status}`
          .toLowerCase()

        return (
          (!termo || texto.includes(termo)) &&
          (!this.filtros.status || i.status.toLowerCase() === this.filtros.status) &&
          (this.filtros.qtdMin == null || i.quantidade >= this.filtros.qtdMin) &&
          (this.filtros.qtdMax == null || i.quantidade <= this.filtros.qtdMax) &&
          (!this.filtros.comLote || (this.filtros.comLote === 'sim' ? i.lote : !i.lote)) &&
          (!this.filtros.comValidade || (this.filtros.comValidade === 'sim'
            ? i.data_validade
            : !i.data_validade))
        )
      })
    },

    matrizItens() {
      const matriz = []
      for (let i = 0; i < this.itensFiltrados.length; i += this.itensPorPagina) {
        matriz.push(this.itensFiltrados.slice(i, i + this.itensPorPagina))
      }
      return matriz
    },

    paginaAtualItens() {
      return this.matrizItens[this.paginaAtual - 1] || []
    },

    totalPaginas() {
      return this.matrizItens.length
    }
  },

  methods: {
    formatarData(ts) {
      if (!ts) return '--'
      return new Date(Number(ts)).toLocaleDateString('pt-BR')
    },

    getSeverityStatus(status) {
      return {
        ativo: 'success',
        alerta: 'warning',
        vencido: 'danger'
      }[status.toLowerCase()] || 'secondary'
    },

    limparFiltros() {
      this.filtros = {
        status: '',
        qtdMin: null,
        qtdMax: null,
        comLote: '',
        comValidade: ''
      }
    },

    async carregarItens() {
      try {
        this.loading = true
        //const res = await api.get(`/mvpu/estoque/consultarEstoque/${this.auth.id_loja}`)
        
        const res = await window.electronAPI.getTodosItensEstoque()


        this.itensBrutos = res.map((i, index) => ({
          ...i,
          _rowId: `${i.codigo_barra}-${index}` // ID único real
        }))

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    this.auth = useAuthStore()
    this.carregarItens()
  }
}
</script>

<style scoped>
/* TODO O SEU CSS ORIGINAL MANTIDO ABAIXO */
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
.barcode-text { font-family: monospace; font-weight: 600; color: #4f46e5; }
.text-sm { font-size: 13px; }
.text-muted { color: #64748b; }

/* EXPANSÃO */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #5A0F83; }
.title-2 { color: #0284c7; }

.info-row { display: flex; gap: 20px; }
.info-group { display: flex; flex-direction: column; flex: 1; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 14px; color: #1e293b; font-weight: 500; }
.value.vencido { color: #ef4444 !important; }
.value.alerta { color: #f59e0b !important; }
.value.ativo { color: #10b981 !important; }
.barcode { font-family: monospace; color: #4f46e5; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }

/* PAGINAÇÃO REESTRUTURADA E CORRIGIDA */
.pagination-container { 
  display: flex; 
  justify-content: center; 
  margin-top: 32px; 
  padding-bottom: 10px;
}
.pagination-content {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.page-info {
  font-size: 14px;
  color: #64748b;
  user-select: none;
}
.current-page {
  font-weight: 700;
  color: #1e293b;
  padding: 0 4px;
}

.nav-btn {
  width: 40px !important;
  height: 40px !important;
  background: #f97316 !important; /* LARANJA */
  border: none !important;
  border-radius: 50% !important;
  color: #ffffff !important; /* ÍCONE BRANCO */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 1.2rem !important;
  font-weight: bold !important;
}

/* Efeito ao passar o mouse */
.nav-btn:hover:not(:disabled) {
  background: #ea580c !important; /* Laranja mais escuro no hover */
  transform: scale(1.05);
}

/* Quando desabilitado (primeira ou última página) */
.nav-btn:disabled {
  background: #fed7aa !important; /* Laranja bem clarinho */
  color: #ffffff !important;
  cursor: not-allowed;
  opacity: 0.7;
}

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.mt-3 { margin-top: 1rem; }

/* Base da bolinha */
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


.text-muted { color: #64748b; font-size: 13px; }

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