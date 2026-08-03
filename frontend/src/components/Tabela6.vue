<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por ID, produto, código ou pagamento..."
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
        <select v-model="filtros.forma_pagamento" class="custom-select">
          <option value="">Todas as formas</option>
          <option value="pix">PIX</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="credito">Crédito</option>
          <option value="debito">Débito</option>
        </select>

        <input type="number" placeholder="Valor mín." v-model.number="filtros.valorMin" class="custom-input" />
        <input type="number" placeholder="Valor máx." v-model.number="filtros.valorMax" class="custom-input" />
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && vendasFiltradas.length > 0"
      :value="vendasPaginadas"
      dataKey="cabecalho.id_venda"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="ID Venda">
        <template #body="{ data }">
          <span class="id-venda">#{{ data.cabecalho.id_venda }}</span>
        </template>
      </Column>

      <Column header="Data / Hora">
        <template #body="{ data }">
          <span class="text-sm">{{ formatarDataHora(data.cabecalho.horario_venda) }}</span>
        </template>
      </Column>

      <Column header="Pagamento">
        <template #body="{ data }">
          <Tag 
            :value="data.cabecalho.forma_pagamento.toUpperCase()" 
            :severity="getPaymentSeverity(data.cabecalho.forma_pagamento)"
          />
        </template>
      </Column>

      <Column header="Nome do Caixa">
        <template #body="{ data }">
          <span class="font-bold text-dark">{{ data.cabecalho.terminal_nome || "--" }}</span>
        </template>
      </Column>

      <Column header="Valor Total">
        <template #body="{ data }">
          <span class="font-bold text-dark">R$ {{ data.cabecalho.valor_total.toFixed(2) }}</span>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <h4 class="expansion-title">Produtos desta Venda</h4>
          <div class="details-grid">
            <div 
              v-for="(item, index) in data.corpo" 
              :key="index" 
              class="option-card"
            >
              <h4 class="option-title title-1">{{ item.nome }}</h4>
              
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Código</span>
                  <span class="value barcode">{{ item.codigo_barra }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Quantidade</span>
                  <span class="value">{{ item.quantidade }} un.</span>
                </div>
              </div>

              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Preço Venda</span>
                  <span class="value">R$ {{ item.preco_venda.toFixed(2) }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Lote</span>
                  <span class="value">{{ item.lote || '--' }}</span>
                </div>
              </div>

              <div class="info-row mt-3 separator-top">
                <div class="info-group">
                  <span class="label">Margem</span>
                  <span class="value text-success">{{ item.margem }}%</span>
                </div>
                <div class="info-group">
                  <span class="label">Total</span>
                  <span class="value">R$ {{ (item.preco_venda * item.quantidade).toFixed(2) }}</span>
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
      <span class="muted mt-2">Buscando histórico...</span>
    </div>

    <div v-else-if="!loading && vendasFiltradas.length === 0" class="empty-container">
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
  name: 'TabelaHistoricoVendas',
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
        forma_pagamento: '',
        valorMin: null,
        valorMax: null
      },
      vendas: [] // Receberá o payload aninhado
    }
  },
  computed: {
    vendasFiltradas() {
      const termo = this.search.toLowerCase().trim()
      
      return this.vendas.filter(venda => {
        // Mapeamento seguro dos dados aninhados
        const c = venda.cabecalho || {}
        const itens = venda.corpo || []
        
        // Texto para busca (ID, Forma de Pagamento e Itens)
        const textoBuscaCabecalho = `${c.id_venda} ${c.forma_pagamento} ${c.valor_total}`.toLowerCase()
        const matchTexto = !termo || 
          textoBuscaCabecalho.includes(termo) || 
          itens.some(i => `${i.nome} ${i.codigo_barra}`.toLowerCase().includes(termo))

        // Filtros específicos
        const matchForma = !this.filtros.forma_pagamento || 
          c.forma_pagamento.toLowerCase() === this.filtros.forma_pagamento.toLowerCase()
        
        const matchMin = this.filtros.valorMin == null || c.valor_total >= this.filtros.valorMin
        const matchMax = this.filtros.valorMax == null || c.valor_total <= this.filtros.valorMax

        return matchTexto && matchForma && matchMin && matchMax
      })
    },
    totalPaginas() { 
      const total = Math.ceil(this.vendasFiltradas.length / this.itensPorPagina)
      return total > 0 ? total : 1
    },
    vendasPaginadas() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.vendasFiltradas.slice(inicio, inicio + this.itensPorPagina)
    }
  },
  watch: {
    search() { this.paginaAtual = 1 },
    filtros: { deep: true, handler() { this.paginaAtual = 1 } }
  },
  methods: {
    getPaymentSeverity(forma) {
      if (!forma) return 'secondary'
      const f = forma.toLowerCase()
      if (f === 'pix') return 'success'
      if (f === 'dinheiro') return 'info'
      if (f === 'credito') return 'warn'
      if (f === 'debito') return 'Constrast'
      return 'secondary'
    },
    formatarDataHora(ts) {
      if (!ts) return '--'
      const data = new Date(Number(ts))
      return isNaN(data.getTime()) ? '--' : data.toLocaleString('pt-BR')
    },
    limparFiltros() {
      this.filtros = { forma_pagamento: '', valorMin: null, valorMax: null }
    },
    async receberTodos() {
      try {
        this.loading = true
        const res = await api.get(`/mvpu/loja/historicoVenda/${this.auth.id_loja}`)
        // Certifique-se de que a resposta é um array
        this.vendas = res.data.data?.reverse() || []
      } catch (e) {
        exibeErro(e, this.$toast)
        this.vendas = []
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
.custom-select, .custom-input { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; background: white; outline: none; }
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 500; }

/* TABELA */
.id-venda { font-weight: 700; color: #64748b; font-family: monospace; font-size: 14px; }
.text-dark { color: #1e293b; }
.text-sm { font-size: 13px; }

/* EXPANSÃO */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.expansion-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 1rem; border-left: 4px solid #5A0F83; padding-left: 10px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.option-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; min-height: 38px; line-height: 1.4; }
.title-1 { color: #5A0F83; }

.info-row { display: flex; gap: 15px; }
.info-group { display: flex; flex-direction: column; flex: 1; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
.value { font-size: 13px; color: #1e293b; font-weight: 500; }
.barcode { font-family: monospace; color: #4f46e5; background: #f1f5f9; padding: 1px 4px; border-radius: 4px; }
.separator-top { border-top: 1px solid #f1f5f9; padding-top: 8px; }

/* PAGINAÇÃO */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; }
.pagination-content {
  display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px;
  border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.nav-btn {
  width: 40px !important; height: 40px !important; background: #f97316 !important; border: none !important;
  border-radius: 50% !important; color: #ffffff !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer;
}
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; opacity: 0.7; cursor: not-allowed; }
.page-info { font-size: 14px; color: #64748b; }
.current-page { font-weight: 700; color: #1e293b; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.text-success { color: #10b981 !important; }
.mt-3 { margin-top: 1rem; }
</style>