<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por código, vendedor ou mensagem..."
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
        <select v-model="filtros.tipoOferta" class="custom-select">
          <option value="">Tipo de oferta</option>
          <option value="primeira">Primeira</option>
          <option value="segunda">Segunda</option>
          <option value="mista">Mista</option>
        </select>

        <select v-model="filtros.tipoVenda" class="custom-select">
          <option value="">Tipo de venda</option>
          <option value="unidade">Unidade</option>
          <option value="caixa">Caixa</option>
        </select>

        <input type="number" placeholder="Qtd mín." v-model.number="filtros.qtdMin" class="custom-input" />
        <input type="number" placeholder="Preço máx." v-model.number="filtros.precoMax" class="custom-input" />
      </div>
      <button class="link-clear" @click="limparFiltros">Limpar todos os filtros</button>
    </div>

    <DataTable
      v-if="!loading && itensFiltrados.length > 0"
      :value="itensPaginados"
      dataKey="id_oferta"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="Data">
        <template #body="{ data }">
          <span class="text-sm">{{ formatarData(data.ofertado_em) }}</span>
        </template>
      </Column>

      <Column header="Vendedor">
        <template #body="{ data }">
          <span class="vendedor-id">#{{ data.id_vendedor }}</span>
        </template>
      </Column>

      <Column header="Tipo Oferta">
        <template #body="{ data }">
          <Tag 
            :value="identificarTipoOferta(data)" 
            :severity="getSeverityOferta(identificarTipoOferta(data))"
          />
        </template>
      </Column>

      <Column header="Qtd">
        <template #body="{ data }">
          <span class="font-bold">{{ obterQuantidade(data) }}</span>
        </template>
      </Column>

      <Column header="Preço">
        <template #body="{ data }">
          <span class="text-success font-bold">R$ {{ obterPreco(data).toFixed(2) }}</span>
        </template>
      </Column>

      <Column header="Tipo">
        <template #body="{ data }">
          <span class="text-muted text-sm">{{ obterTipo(data) }}</span>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div class="message-banner" v-if="data.mensagem">
            <span class="label">Mensagem do Vendedor</span>
            <p class="message-text">"{{ data.mensagem }}"</p>
          </div>

          <div class="details-grid">
            <div class="option-card">
              <h4 class="option-title title-1">1ª Opção (Principal)</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Quantidade</span>
                  <span class="value">{{ data.primeiro_quantidade || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Preço</span>
                  <span class="value">{{ data.primeiro_preco ? 'R$ ' + Number(data.primeiro_preco).toFixed(2) : '--' }}</span>
                </div>
              </div>
              <div class="info-group">
                <span class="label">Tipo de Unidade</span>
                <span class="value">{{ data.primeiro_tipo || '--' }}</span>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-2">2ª Opção (Substituta)</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Quantidade</span>
                  <span class="value">{{ data.segundo_quantidade || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Preço</span>
                  <span class="value">{{ data.segundo_preco ? 'R$ ' + Number(data.segundo_preco).toFixed(2) : '--' }}</span>
                </div>
              </div>
              <div class="info-row mt-2">
                <div class="info-group">
                  <span class="label">Tipo de Unidade</span>
                  <span class="value">{{ data.segundo_tipo || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Código de Barras</span>
                  <span class="value barcode">{{ data.codigo_barra || '--' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataTable>

    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <Button icon="pi pi-chevron-left" @click="paginaAtual--" :disabled="paginaAtual === 1" text rounded />
      <span class="poppins-regular">Página <b>{{ paginaAtual }}</b> de {{ totalPaginas }}</span>
      <Button icon="pi pi-chevron-right" @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" text rounded />
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Buscando ofertas...</span>
    </div>

    <div v-else-if="!loading && itensFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Nenhuma oferta encontrada...</div>
    </div>
  </div>
</template>

<script>
// ... (Mesmo script anterior sem alterações na lógica)
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

export default {
  name: 'TabelaOfertasCotacao',
  components: { ProgressSpinner, DataTable, Column, Tag, Button },
  props: { id_cotacao: Number },
  data() {
    return {
      search: '',
      loading: false,
      showFilters: false,
      expandedRows: [],
      auth: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      filtros: { tipoOferta: '', tipoVenda: '', qtdMin: null, qtdMax: null, precoMin: null, precoMax: null },
      itens: []
    }
  },
  computed: {
    itensFiltrados() {
      const termo = this.search.toLowerCase()
      return this.itens.filter(i => {
        const texto = `${i.codigo_barra || ''} ${i.mensagem || ''} ${i.id_vendedor}`.toLowerCase()
        const quantidade = this.obterQuantidade(i)
        const preco = this.obterPreco(i)
        return (!termo || texto.includes(termo)) &&
               (!this.filtros.tipoOferta || this.identificarTipoOferta(i) === this.filtros.tipoOferta) &&
               (this.filtros.qtdMin == null || quantidade >= this.filtros.qtdMin) &&
               (this.filtros.precoMax == null || preco <= this.filtros.precoMax)
      })
    },
    totalPaginas() { return Math.ceil(this.itensFiltrados.length / this.itensPorPagina) },
    itensPaginados() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.itensFiltrados.slice(inicio, inicio + this.itensPorPagina)
    }
  },
  methods: {
    getSeverityOferta(tipo) {
      const map = { primeira: 'info', segunda: 'warning', mista: 'success' }
      return map[tipo] || 'secondary'
    },
    identificarTipoOferta(i) {
      if (i.primeiro_preco && i.segundo_preco) return 'mista'
      return i.primeiro_preco ? 'primeira' : 'segunda'
    },
    obterQuantidade(i) { return Number(i.primeiro_quantidade || i.segundo_quantidade || 0) },
    obterPreco(i) { return Number(i.primeiro_preco || i.segundo_preco || 0) },
    obterTipo(i) { return i.primeiro_tipo || i.segundo_tipo || '--' },
    formatarData(ts) { return new Date(Number(ts)).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) },
    limparFiltros() { this.filtros = { tipoOferta: '', tipoVenda: '', qtdMin: null, qtdMax: null, precoMin: null, precoMax: null } },
    async carregarItens() {
      try {
        this.loading = true
        const res = await api.get(`/mvpu/cotacao/consultarOfertas/${this.auth.id_loja}/${this.id_cotacao}`)
        this.itens = res.data.data?.reverse() || []
      } catch (e) { exibeErro(e, this.$toast) } finally { this.loading = false }
    }
  },
  mounted() {
    this.auth = useAuthStore()

    this.loading = true

    setTimeout(()=>{
      this.carregarItens()
    }, 500)
  }
}
</script>

<style scoped>
.card { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 400px; }

/* HEADER */
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 450px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; }

/* FILTROS */
.filters-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.filters-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
.custom-select, .custom-input { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; }
.link-clear { background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; font-weight: 500; }

/* TABELA */
.text-sm { font-size: 13px; }
.text-muted { color: #64748b; }
.text-success { color: #10b981; }
.vendedor-id { font-weight: 600; color: #4f46e5; }

/* DESIGN DA EXPANSÃO REFORMULADO */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }

.message-banner { background: #eef2ff; padding: 12px 16px; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #4f46e5; }
.message-text { margin: 4px 0 0; color: #3730a3; font-style: italic; font-size: 14px; }

.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }

.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }

.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #0284c7; }
.title-2 { color: #d97706; }

.info-row { display: flex; gap: 20px; margin-bottom: 12px; }
.info-group { display: flex; flex-direction: column; flex: 1; }

.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 14px; color: #1e293b; font-weight: 500; }
.barcode { font-family: monospace; color: #4f46e5; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.pagination-container { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 24px; }

.mt-2 { margin-top: 0.5rem; }
</style>