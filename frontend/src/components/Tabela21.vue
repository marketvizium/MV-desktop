<template>
  <div class="card">
    <div class="summary-container" v-if="cabecalho">
      <div class="summary-header">
        <div>
          <h2 class="summary-title">{{ cabecalho.nome_cotacao }}</h2>
          <span class="muted">ID: #{{ cabecalho.id_cotacao }}</span>
        </div>
        <Tag 
          :value="cabecalho.status_cotacao" 
          :severity="getStatusSeverity(cabecalho.status_cotacao)"
          class="status-tag"
        />
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Período</span>
          <span>{{ formatarData(cabecalho.inicio_cotacao) }} — {{ formatarData(cabecalho.final_cotacao) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total de Itens</span>
          <span>{{ itens.length }} produtos</span>
        </div>
      </div>
    </div>

    <div class="table-header-actions">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar produto, código ou vendedor..."
          v-model="search"
        />
      </div>

      <div class="action-buttons">
        <Button
          v-if="existePendente"
          label="Concluir Cotação"
          icon="pi pi-check-circle"
          class="btn-sbmt"
          :loading="loadingButtonConcluir"
          @click="concluirCotacao"
        />
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
      dataKey="id_solicitado"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >
      <Column expander style="width: 3rem" />

      <Column header="Produto">
        <template #body="{ data }">
          <div class="product-info">
            <span class="nome-prod">{{ data.nome }}</span>
            <span class="codigo-prod">{{ data.codigo_barra }}</span>
          </div>
        </template>
      </Column>

      <Column field="quantidade" header="Qtd" />

      <Column header="Valores">
        <template #body="{ data }">
          <div class="price-stack">
            <span><small class="muted">Custo:</small> R$ {{ data.preco_custo.toFixed(2) }}</span>
            <span><small class="muted">Venda:</small> R$ {{ data.preco_venda.toFixed(2) }}</span>
          </div>
        </template>
      </Column>

      <Column header="Margem">
        <template #body="{ data }">
          <b :class="data.margem > 0 ? 'text-success' : 'text-danger'">{{ data.margem }}%</b>
        </template>
      </Column>

      <Column header="Status Seleção">
        <template #body="{ data }">
          <Tag 
            :value="data.status_fechamento ? formatarStatus(data.status_fechamento) : 'Não Selecionado'" 
            :severity="getFechamentoSeverity(data.status_fechamento)"
          />
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div v-for="oferta in data.ofertas" :key="oferta.id_oferta" class="oferta-card">
            <div class="oferta-header">
              <span><i class="pi pi-user mr-2"></i> <b>{{ oferta.nome }}</b> ({{ oferta.email }})</span>
            </div>

            <div class="oferta-body-grid">
              <div class="opcao-box">
                <div class="opcao-header">1ª Opção</div>
                <div class="opcao-content">
                  <p><b>Qtd:</b> {{ oferta.primeiro_quantidade || "--" }}</p>
                  <p><b>Preço unitário:</b> {{ oferta.primeiro_preco ? 'R$ ' + oferta.primeiro_preco : "--" }}</p>
                  <p><b>Unidade por Caixa/Fardo/etc..:</b> {{ oferta.primeiro_unid_composicao || "--" }}</p>
                  <p><b>Tipo:</b> {{ oferta.primeiro_tipo || "--" }}</p>
                  
                  <div class="opcao-actions" style="margin-top: 44px;">
                    <Button
                      v-if="!oferta.opcao_1 && cabecalho.status_cotacao === 'finalizada' && oferta.primeiro_quantidade != null && data.status_fechamento !== 'concluido'"
                      label="Selecionar" icon="pi pi-check" size="small" class="btn-sbmt"
                      @click="SelecionarOfertas(oferta, 1, null)"
                    />
                    <Button
                      v-if="oferta.opcao_1 && cabecalho.status_cotacao === 'finalizada' && data.status_fechamento !== 'concluido'"
                      label="Remover" icon="pi pi-times" size="small" severity="danger"
                      @click="removerPendente(oferta, 1, null)"
                    />
                    <span v-if="oferta.opcao_1 && data.status_fechamento === 'concluido'" class="badge-chosen">
                      <i class="pi pi-check-circle"></i> Escolhido
                    </span>
                  </div>
                </div>
              </div>

              <div class="opcao-box">
                <div class="opcao-header">2ª Opção (Equivalente)</div>
                <div class="opcao-content">
                  <p><b>Qtd:</b> {{ oferta.segundo_quantidade || "--" }}</p>
                  <p><b>Preço:</b> {{ oferta.segundo_preco ? 'R$ ' + oferta.segundo_preco : "--" }}</p>
                  <p><b>Tipo:</b> {{ oferta.segundo_tipo || "--" }}</p>
                  <p><b>Unidade por Caixa/Fardo/etc...:</b> {{ oferta.segundo_unid_composicao || "--" }}</p>
                  <p><b>Código de barras:</b> {{ oferta.codigo_barra || "--" }}</p>
                  
                  <div class="opcao-actions">
                    <Button
                      v-if="!oferta.opcao_2 && cabecalho.status_cotacao === 'finalizada' && oferta.segundo_quantidade != null && data.status_fechamento !== 'concluido'"
                      label="Selecionar" icon="pi pi-check" size="small" class="btn-sbmt"
                      @click="SelecionarOfertas(oferta, null, 2)"
                    />
                    <Button
                      v-if="oferta.opcao_2 && cabecalho.status_cotacao === 'finalizada' && data.status_fechamento !== 'concluido'"
                      label="Remover" icon="pi pi-times" size="small" severity="danger"
                      @click="removerPendente(oferta, null, 2)"
                    />
                    <span v-if="oferta.opcao_2 && data.status_fechamento === 'concluido'" class="badge-chosen">
                      <i class="pi pi-check-circle"></i> Escolhido
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="oferta-obs" v-if="oferta.mensagem">
              <b>Observação:</b> {{ oferta.mensagem }}
            </div>
          </div>
        </div>
      </template>
    </DataTable>

    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <Button icon="pi pi-chevron-left" @click="paginaAtual--" :disabled="paginaAtual === 1" text />
      <span class="poppins-regular">Página <b>{{ paginaAtual }}</b> de {{ totalPaginas }}</span>
      <Button icon="pi pi-chevron-right" @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" text />
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <div v-else-if="!loading && itensFiltrados.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Nenhum item encontrado nesta cotação...</div>
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
  name: 'HistoricoCotacao',
  components: { ProgressSpinner, DataTable, Column, Tag, Button },
  props: { id_cotacao: Number },

  data() {
    return {
      search: '',
      loading: false,
      showFilters: false,
      expandedRows: [],
      paginaAtual: 1,
      auth: null,
      loadingButtonConcluir: false,
      itensPorPagina: 10,
      cabecalho: null,
      loadingSelecionar: null,
      loadingRemover: null,
      filtros: {
        tipoOferta: '',
        tipoVenda: '',
        qtdMin: null,
        qtdMax: null,
        precoMin: null,
        precoMax: null
      },
      itens: []
    }
  },

  computed: {
    itensFiltrados() {
      const termo = this.search.toLowerCase()
      return this.itens.filter(i => {
        const texto = `${i.nome} ${i.codigo_barra} ${i.categoria || ''}`.toLowerCase()
        return !termo || texto.includes(termo)
      })
    },
    totalPaginas() {
      return Math.ceil(this.itensFiltrados.length / this.itensPorPagina)
    },
    existePendente() {
      return this.itens.some(item => item.status_fechamento === 'pendente')
    },
    itensPaginados() {
      const ini = (this.paginaAtual - 1) * this.itensPorPagina
      return this.itensFiltrados.slice(ini, ini + this.itensPorPagina)
    }
  },

  methods: {
    getStatusSeverity(status) {
      switch(status) {
        case 'aberta': return 'success';
        case 'fechada': return 'secondary';
        case 'finalizada': return 'info';
        default: return 'info';
      }
    },
    getFechamentoSeverity(status) {
      if (!status) return 'secondary'; // Para quando for null
      
      switch(status.toLowerCase()) {
        case 'pendente': return 'warn';  // Laranja
        case 'concluido': return 'success'; // Verde
        default: return 'secondary';        // Cinza
      }
    },

    formatarStatus(status) {
      if (!status) return '';
      // Apenas para deixar a primeira letra maiúscula no visual da Tag
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    formatarData(v) {
      return new Date(Number(v)).toLocaleDateString('pt-BR')
    },
    limparFiltros() {
      this.filtros = { tipoOferta: '', tipoVenda: '', qtdMin: null, qtdMax: null, precoMin: null, precoMax: null }
    },
    async carregar() {
      try {
        this.loading = true
        const res = await api.get(`/mvpu/cotacao/historicoCotacao/${this.auth.id_loja}/${this.id_cotacao}`)
        if (res.data.data) {
          this.cabecalho = res.data.data.cabecalho_cotacao
          this.itens = res.data.data.conteudo_cotacao || []
        }
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    },
    async SelecionarOfertas(oferta, op1, op2) {
      try {
        this.loadingSelecionar = oferta.id_oferta
        const payload = {
          pendentes: [{
            id_solicitado: oferta.id_solicitado,
            id_oferta: oferta.id_oferta,
            opcao_1: !!op1,
            opcao_2: !!op2
          }]
        }
        await api.post(`/mvpu/cotacao/confirmarPendente/${this.auth.id_loja}/${this.id_cotacao}`, payload)
        this.$toast.success("Produto selecionado!")
        this.carregar()
      } catch (e) { exibeErro(e, this.$toast) }
    },
    async removerPendente(oferta, v1, v2) {
      try {
        const payload = { pendentes: [] }
        if (v1) payload.pendentes.push([oferta.id_resultado, v1])
        if (v2) payload.pendentes.push([oferta.id_resultado, v2])
        await api.delete(`/mvpu/cotacao/deletarPendente/${this.auth.id_loja}/${this.id_cotacao}`, { data: payload })
        this.$toast.success("Seleção removida!")
        this.carregar()
      } catch (e) { exibeErro(e, this.$toast) }
    },
    async concluirCotacao() {
      this.loadingButtonConcluir = true
      try {
        await api.put(`/mvpu/cotacao/confirmarCotacao/${this.auth.id_loja}/${this.id_cotacao}`)
        this.$toast.success("Cotação concluída!")
        this.carregar()
      } catch (e) { exibeErro(e, this.$toast) }
      finally { this.loadingButtonConcluir = false }
    }
  },

  mounted() {
    this.auth = useAuthStore()
    setTimeout(()=>{
      this.carregar()
    }, 500)
  }
}
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* SUMMARY BOX */
.summary-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}
.summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.summary-title { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 700; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.summary-item { display: flex; flex-direction: column; }
.label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }

/* TABLE HEADER */
.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}
.search-box {
  display: flex; align-items: center; background: #f1f5f9;
  border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;
  gap: 10px; flex: 1; max-width: 500px;
}
.search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
.action-buttons { display: flex; gap: 10px; }

/* FILTERS */
.filters-panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 15px; margin-bottom: 15px;
}
.filters-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
.custom-select, .custom-input {
  padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-size: 13px;
}
.link-clear { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; }

/* TABLE ELEMENTS */
.product-info { display: flex; flex-direction: column; }
.nome-prod { font-weight: 600; color: #334155; }
.codigo-prod { font-size: 12px; color: #64748b; }
.price-stack { display: flex; flex-direction: column; font-size: 13px; }
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }

/* EXPANSION DESIGN */
.expansion-container { padding: 10px 20px 20px 20px; background: #f8fafc; }
.oferta-card {
  background: white; border: 1px solid #e2e8f0; border-radius: 8px;
  margin-bottom: 10px; overflow: hidden;
}
.oferta-header { background: #475569; color: white; padding: 8px 15px; font-size: 13px; }
.oferta-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 15px; }
.opcao-box { border: 1px solid #f1f5f9; border-radius: 6px; overflow: hidden; }
.opcao-header { background: #f1f5f9; padding: 6px 12px; font-weight: 700; font-size: 12px; color: #475569; }
.opcao-content { padding: 12px; font-size: 13px; }
.opcao-actions { margin-top: 10px; }
.badge-chosen { color: #059669; font-weight: 700; display: flex; align-items: center; gap: 5px; }
.oferta-obs { padding: 0 15px 15px 15px; font-size: 12px; color: #64748b; font-style: italic; }

/* BUTTON CUSTOMS */
:deep(.btn-sbmt) { background: #FF8049 !important; border: none !important; }
:deep(.btn-sbmt:hover) { background: #e67342 !important; }

/* LOADING & EMPTY */
.loading-container, .empty-container {
  display: flex; flex-direction: column; align-items: center; padding: 50px 0;
}
.empty-img { max-width: 200px; opacity: 0.8; }
.pagination-container { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; }

:deep(.p-tag-warning) {
    background-color: rgba(239, 108, 0, 0.15) !important;
    color: #EF6C00 !important;
    font-weight: 600;
}

:deep(.p-tag-success) {
    background-color: rgba(46, 125, 50, 0.15) !important;
    color: #2E7D32 !important;
    font-weight: 600;
}

</style>