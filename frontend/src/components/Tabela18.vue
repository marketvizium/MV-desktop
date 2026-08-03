<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <span class="material-symbols-outlined">
          search
        </span>
        <input
          type="text"
          placeholder="Pesquisar por código, lote, responsável ou status..."
          v-model="search"
        />
      </div>

      <div class="actions">
        <Button 
          type="button" 
          label="Filtros" 
          style="color: #222;"
          outlined 
          @click="showFilters = !showFilters" 
          
        >

          Filtros
        
          <span class="material-symbols-outlined">
            filter_list
          </span>
        </Button>
      </div>
    </div>

    <div v-if="showFilters" class="filters-panel">
      <div class="filters-grid">

        <select v-model="filtros.comLote" class="custom-select">
          <option value="">Lote (Todos)</option>
          <option value="sim">Com lote</option>
          <option value="nao">Sem lote</option>
        </select>

        <input type="number" placeholder="Qtd mín." v-model.number="filtros.qtdMin" class="custom-input" />
        <input type="number" placeholder="Qtd máx." v-model.number="filtros.qtdMax" class="custom-input" />
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && itensFiltrados.length > 0"
      :value="paginaAtualItens"
      dataKey="_rowId"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="Código de barras">
        <template #body="{ data }">
          <span class="barcode-text" style="font-family: 'Poppins'; color: #222; font-family: 300;">{{ data.codigo_barra }}</span>
        </template>
      </Column>

      <Column header="Qtd">
        <template #body="{ data }">
          <span class="font-bold">{{ data.quantidade }}</span>
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
          <span class="text-sm">{{ formatarData(data.data_validade) }}</span>
        </template>
      </Column>

      <Column header="Responsável entrada">
        <template #body="{ data }">
          <span class="text-sm font-medium">{{ data.responsavel }}</span>
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

            <!-- ================= PRODUTO ================= -->
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
                Dados do Produto
              </div>

              <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <tbody>
                  <tr>
                    <td style="color:#6b7280; padding:6px 0; width:40%;">
                      Nome do Produto
                    </td>
                    <td style="font-weight:500;">
                      {{ data.nome }}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#6b7280; padding:6px 0;">
                      Código de Barras
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
                </tbody>
              </table>
            </div>

            <!-- ================= LOGISTICA ================= -->
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
                Logística e Controle
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

    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <Button
        text
        style="background-color: #ff8049;"
        
        :disabled="paginaAtual === 1"
        @click="irPaginaAnterior"
      >
        <span class="material-symbols-outlined pagination-icon">
          chevron_left
        </span>
      </Button>

      <span class="poppins-regular">
        Página <b>{{ paginaAtual }}</b> de {{ totalPaginas }}
      </span>

      <Button
        text
        
        style="background-color: #ff8049;"
        :disabled="paginaAtual === totalPaginas"
        @click="irProximaPagina"
      >
        <span class="material-symbols-outlined pagination-icon">
          chevron_right
        </span>
      </Button>
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Buscando estoque...</span>
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

      itensBrutos: [],
      paginaAtualItens: [] // ✅ estado REAL da tabela
    }
  },

  /* =========================
     COMPUTED (LEVE)
  ========================= */

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
          (!this.filtros.comValidade ||
            (this.filtros.comValidade === 'sim'
              ? i.data_validade
              : !i.data_validade))
        )
      })
    },

    totalPaginas() {
      return Math.max(
        1,
        Math.ceil(this.itensFiltrados.length / this.itensPorPagina)
      )
    }
  },

  /* =========================
     WATCHERS (SINCRONIZAÇÃO)
  ========================= */

  watch: {
    search() {
      this.resetarPagina()
    },

    filtros: {
      deep: true,
      handler() {
        this.resetarPagina()
      }
    },

    itensFiltrados: {
      immediate: true,
      handler() {
        if (this.paginaAtual > this.totalPaginas) {
          this.paginaAtual = this.totalPaginas
        }
        this.atualizarPagina()
      }
    },

    paginaAtual() {
      this.atualizarPagina()
    }
  },

  /* =========================
     METHODS
  ========================= */

  methods: {

    /* ---------- CORE PAGINAÇÃO ---------- */

    resetarPagina() {
      this.paginaAtual = 1
    },

    atualizarPagina() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina

      // ✅ array estável entregue ao DataTable
      this.paginaAtualItens =
        this.itensFiltrados.slice(inicio, fim)
    },

    /* ---------- HELPERS ---------- */

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

    irPaginaAnterior() {
      if (this.paginaAtual > 1) {
        this.paginaAtual--
      }
    },

    irProximaPagina() {
      if (this.paginaAtual < this.totalPaginas) {
        this.paginaAtual++
      }
    },

    /* ---------- API ---------- */

    async carregarItens() {
      try {
        this.loading = true

        const res = await window.electronAPI.getProximos()

        if(res.length==0){
          this.itensBrutos = []
          return
        }

        // ✅ chave única REAL (NUNCA muda)
        this.itensBrutos = res.map((i, index) => ({
          ...i,
          _rowId: `${i.codigo_barra}-${i.lote || '0'}-${i.data_validade || '0'}-${index}`
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
.custom-input:focus, .custom-select:focus { border-color: #5A0F83; }
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 500; }

/* TABELA */
.barcode-text { font-family: monospace; font-weight: 600; color: #222; }
.text-sm { font-size: 13px; }
.text-muted { color: #64748b; }
.font-medium { font-weight: 500; }

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

/* CORES DE STATUS DENTRO DO CARD */
.value.vencido { color: #ef4444 !important; }
.value.alerta { color: #f59e0b !important; }
.value.ativo { color: #10b981 !important; }

.barcode { font-family: monospace; color: #4f46e5; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; width: fit-content; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.pagination-container { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 24px; }
.mt-3 { margin-top: 0.75rem; }
.pagination-icon {
  font-family: 'Material Symbols Outlined';
  font-size: 26px;
  color: #FFF;
  line-height: 1;
  display: flex;
  align-items: center;
}

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