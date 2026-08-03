<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por nome ou categoria..."
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
            class="action-icon-btn"
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
      v-if="!loading && produtosFiltrados.length > 0"
      :value="produtosPaginados"
      dataKey="id_produto"
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
          <input type="checkbox" :value="data.id_produto" v-model="selectedIds" />
        </template>
      </Column>

      <Column expander style="width: 3rem" />

      <Column header="Produto">
        <template #body="{ data }">
          <span class="font-bold text-dark">{{ data.nome }}</span>
        </template>
      </Column>

      <Column header="Categoria">
        <template #body="{ data }">
          <span class="text-sm text-muted">{{ data.categoria }}</span>
        </template>
      </Column>

      <Column header="Código de barras">
        <template #body="{ data }">
          <span class="barcode-text">{{ data.codigo_barra }}</span>
        </template>
      </Column>

      <Column header="Preço venda">
        <template #body="{ data }">
          <span class="font-medium">R$ {{ data.preco_venda.toFixed(2) }}</span>
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag 
            :value="data.status" 
            :severity="data.status === 'ativo' ? 'success' : 'warning'"
          />
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div class="details-grid">
            <div class="option-card">
              <h4 class="option-title title-1">Gestão de Preços e Promoção</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Preço de Custo</span>
                  <span class="value">R$ {{ data.preco_custo }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Margem</span>
                  <span class="value">{{ data.margem }}%</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Promoção</span>
                  <span class="value">{{ data.porcentagem_promo }}%</span>
                </div>
                <div class="info-group">
                  <span class="label">Período Promo</span>
                  <span class="value text-xs">{{ data.inicio_promo }} até {{ data.fim_promo }}</span>
                </div>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-2">Logística e Dados Fiscais</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Gôndola (Estoque/Loja)</span>
                  <span class="value">{{ data.gondula_estoque }} / {{ data.gondula_loja }}</span>
                </div>
                <div class="info-group">
                  <span class="label">NCM</span>
                  <span class="value barcode">{{ data.ncm || 'N/A' }}</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Busca Rápida</span>
                  <span class="value">{{ data.busca_rapida || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Último Reajuste (IPCA)</span>
                  <span class="value text-xs">{{ data.ultimo_reajuste }}</span>
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
      <span class="muted mt-2">Carregando catálogo...</span>
    </div>

    <div v-else-if="!loading && (produtos.length === 0 || produtosFiltrados.length === 0)" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Não foram encontrados resultados para a sua busca...</div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import exibeErro from '@/utils/ExibeErro';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

export default {
  name: 'TabelaProdutos',
  components: { ProgressSpinner, DataTable, Column, Tag, Button },
  data() {
    return {
      search: '',
      filterStatus: null,
      loading: false,
      showActions: false,
      showFilter: false,
      expandedRows: [],
      auth: null,
      selectedIds: [],
      produtos: [],
      paginaAtual: 1,
      itensPorPagina: 15
    }
  },
  computed: {
    produtosFiltrados() {
      const searchLower = this.search.toLowerCase();
      return this.produtos.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(searchLower) || p.categoria.toLowerCase().includes(searchLower);
        const matchStatus = !this.filterStatus || p.status === this.filterStatus;
        return matchSearch && matchStatus;
      });
    },
    produtosPaginados() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
      return this.produtosFiltrados.slice(inicio, inicio + this.itensPorPagina);
    },
    totalPaginas() {
      return Math.ceil(this.produtosFiltrados.length / this.itensPorPagina) || 1;
    },
    allSelected() {
      return this.produtosPaginados.length > 0 && this.selectedIds.length === this.produtosPaginados.length;
    }
  },
  methods: {
    toggleActions() { this.showActions = !this.showActions; },
    toggleFilter() { this.showFilter = !this.showFilter; },
    applyFilter(status) {
      this.filterStatus = status;
      this.showFilter = false;
      this.paginaAtual = 1;
    },
    clearFilters() {
      this.filterStatus = null;
      this.search = '';
      this.showFilter = false;
      this.paginaAtual = 1;
    },
    toggleSelectAll(e) {
      this.selectedIds = e.target.checked ? this.produtosPaginados.map(p => p.id_produto) : [];
    },
    handleClickOutside(event) {
      if (this.$refs.filterRef && !this.$refs.filterRef.contains(event.target)) this.showFilter = false;
      if (this.$refs.actionsRef && !this.$refs.actionsRef.contains(event.target)) this.showActions = false;
    },
    formatarDataHora(valor) {
      if (!valor) return '--';
      const data = new Date(Number(valor));
      return isNaN(data.getTime()) ? '--' : data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    async receberTodos() {
      try {
        this.loading = true;
        this.auth = useAuthStore();
        const res = await api.get(`/mvpu/produto/consultarProdutos/${this.auth.id_loja}`);
        this.produtos = res.data.data.filter(p => p.porcentagem_promo != null).map(p => ({
          ...p,
          status: p.desativado ? 'desativado' : 'ativo',
          inicio_promo: this.formatarDataHora(p.inicio_promo),
          fim_promo: this.formatarDataHora(p.fim_promo),
          ultimo_reajuste: this.formatarDataHora(p.ultimo_reajuste)
        }));
      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    this.receberTodos();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
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

.actions-right { display: flex; align-items: center; gap: 12px; }

/* BOTÃO FILTRAR PERSONALIZADO */
.btn-filter-custom { background: #f97316 !important; border: none !important; border-radius: 10px !important; padding: 10px 20px !important; font-size: 14px !important; font-weight: 600 !important; }

/* DROPDOWN */
.dropdown-wrapper { position: relative; }
.dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); min-width: 170px; z-index: 100; border: 1px solid #f1f5f9; overflow: hidden; }
.dropdown-item { width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 10px; color: #475569; transition: background 0.2s; }
.dropdown-item:hover { background: #f8fafc; color: #5A0F83; }
.dropdown-item.danger { color: #ef4444; }
.dropdown-item.link-clear-dropdown { border-top: 1px solid #f1f5f9; color: #5A0F83; font-weight: 600; }

/* TABELA */
.barcode-text { font-family: monospace; font-weight: 600; color: #4f46e5; }
.text-dark { color: #1e293b; }
.text-muted { color: #64748b; }
.text-xs { font-size: 11px; }

/* EXPANSÃO EM CARDS */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #5A0F83; }
.title-2 { color: #0284c7; }

.info-row { display: flex; gap: 20px; }
.info-group { display: flex; flex-direction: column; flex: 1; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 14px; color: #1e293b; font-weight: 500; }
.barcode { font-family: monospace; color: #4f46e5; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; }

/* PAGINAÇÃO CIRCULAR (Laranja) */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content { display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px; border: 1px solid #e2e8f0; }
.nav-btn { width: 40px !important; height: 40px !important; background: #f97316 !important; border: none !important; border-radius: 50% !important; color: #ffffff !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: all 0.2s ease; cursor: pointer; }
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; cursor: not-allowed; opacity: 0.7; }
.page-info { font-size: 14px; color: #64748b; user-select: none; }
.current-page { font-weight: 700; color: #1e293b; padding: 0 4px; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.mt-3 { margin-top: 1rem; }
</style>