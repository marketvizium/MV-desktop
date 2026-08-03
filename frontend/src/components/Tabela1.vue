<template>
  <div class="card">
    <div class="table-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Pesquisar por nome, categoria ou código..."
          v-model="search"
          @input="onSearchInput"
        />
      </div>

      <div class="actions-right">
        <div class="dropdown-wrapper" ref="filterRef">
          <Button 
            type="button" 
            icon="pi pi-filter" 
            :label="labelFiltro" 
            @click="toggleFilter" 
            class="btn-filter-custom"
          />

          <div v-if="showFilter" class="dropdown">
            <button class="dropdown-item" @click="setStatus('ativo')">Ativos</button>
            <button class="dropdown-item" @click="setStatus('desativado')">Desativados</button>
            <hr />
            <button class="dropdown-item" @click="setPromo(true)">Com promoção</button>
            <button class="dropdown-item" @click="setPromo(false)">Sem promoção</button>
            <hr />
            <button class="dropdown-item link-clear-dropdown" @click="clearFilters">Limpar filtros</button>
          </div>
        </div>
      </div>
    </div>

    <DataTable
      v-if="!loading && produtos.length > 0"
      :value="produtos"
      dataKey="id_produto"
      responsiveLayout="scroll"
      stripedRows
      rowHover
      v-model:expandedRows="expandedRows"
    >

      <Column expander style="width: 3rem" />

      <Column header="Produto">
        <template #body="{ data }">
          <span class="font-bold text-dark">{{ data.nome }}</span>
        </template>
      </Column>

      <Column header="Código de Barras">
        <template #body="{ data }">
          <span style="color: #222;" class="barcode-text">{{ data.codigo_barra }}</span>
        </template>
      </Column>

      <Column header="Preço Custo">
        <template #body="{ data }">
          <span class="font-bold text-dark">R$ {{ Number(data.preco_custo).toFixed(2) }}</span>
        </template>
      </Column>

      <Column header="Preço Venda">
        <template #body="{ data }">
          <span class="font-bold text-dark">R$ {{ Number(data.preco_venda).toFixed(2) }}</span>
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag 
            :value="data.status" 
            :severity="data.status === 'ativo' ? 'success' : 'warn'"
          />
        </template>
      </Column>

      <Column header="Ações" style="width:140px">
        <template #body="{ data }">
          <div style="display:flex; gap:8px; justify-content:flex-start; padding-right: 20px;">
            <Button
              rounded
              text
              style="color: #555;"
              @click="editarProduto(data)"
            >
              <span class="material-symbols-outlined">edit</span>
            </Button>

            <Button
              rounded
              text
              style="color: #555;"
              @click="confirmarDelete(data)"
            >
              <span class="material-symbols-outlined">delete</span>
            </Button>
          </div>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="expansion-container">
          <div class="details-grid">
            
            <div class="option-card">
              <h4 class="option-title title-1">Precificação e Promoção</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Preço Custo</span>
                  <span class="value">R$ {{ data.preco_custo }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Margem</span>
                  <span class="value">{{ data.margem }}%</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">Promoção (%)</span>
                  <span class="value">{{ data.porcentagem_promo || '0' }}%</span>
                </div>
                <div class="info-group">
                  <span class="label">Último Reajuste</span>
                  <span class="value">{{ data.ultimo_reajuste }}</span>
                </div>
              </div>
              <div class="info-group mt-3">
                <div class="info-group">
                  <span class="label">Vigência Promoção</span>
                  <span class="value text-sm">{{ data.inicio_promo }} até {{ data.fim_promo }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Categoria</span>
                  <span class="value">{{ data.categoria }}</span>
                </div>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-2">Logística e Identificação</h4>
              <div class="info-row">
                <div class="info-group">
                  <span class="label">Gôndola Estoque</span>
                  <span class="value">{{ data.gondula_estoque || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Gôndola Loja</span>
                  <span class="value">{{ data.gondula_loja || '--' }}</span>
                </div>
              </div>
              <div class="info-row mt-3">
                <div class="info-group">
                  <span class="label">NCM</span>
                  <span class="value">{{ data.ncm || '--' }}</span>
                </div>
                <div class="info-group">
                  <span class="label">Busca Rápida</span>
                  <span class="value">{{ data.busca_rapida || '--' }}</span>
                </div>
              </div>
            </div>

            <div class="option-card">
              <h4 class="option-title title-3">Configurações de Estoque</h4>
              <div class="info-group">
                <span class="label">Ajuste Automático</span>
                <div class="mt-1">
                  <Tag 
                    :severity="data.ajuste_automatico ? 'info' : 'secondary'" 
                    :value="data.ajuste_automatico ? 'HABILITADO' : 'DESABILITADO'" 
                  />
                </div>
              </div>
              <div class="info-group mt-3">
                <span class="label">Controle por Lote</span>
                <div class="mt-1">
                  <Tag 
                    :severity="data.controle_lote ? 'info' : 'secondary'" 
                    :value="data.controle_lote ? 'HABILITADO' : 'DESABILITADO'" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </template>
    </DataTable>

    <!-- PAGINAÇÃO SERVER-SIDE -->
    <div v-if="totalPaginas > 1 && !loading" class="pagination-container">
      <div class="pagination-content">
        <Button 
          icon="pi pi-chevron-left" 
          @click="irParaPagina(paginaAtual - 1)" 
          :disabled="paginaAtual === 1" 
          class="nav-btn"
        />
        <div class="page-info">
          Página <span class="current-page">{{ paginaAtual }}</span> de <b>{{ totalPaginas }}</b>
          <span class="total-info"> · {{ totalRegistros }} produtos</span>
        </div>
        <Button 
          icon="pi pi-chevron-right" 
          @click="irParaPagina(paginaAtual + 1)" 
          :disabled="paginaAtual === totalPaginas" 
          class="nav-btn"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="muted mt-2">Buscando produtos...</span>
    </div>

    <div v-else-if="!loading && produtos.length === 0" class="empty-container">
      <img src="../assets/img/Programming.gif" alt="Sem dados" class="empty-img" />
      <div class="poppins-regular">Não foram encontrados resultados para a sua busca...</div>
    </div>

    <!-- MODAL DE CONFIRMAÇÃO DELETE -->
    <Dialog
      v-model:visible="showConfirmDelete"
      modal
      class="poppins-bold"
      header="Excluir produto"
      style="font-family: 'Poppins';"
      :style="{ width: '420px' }"
      :closable="false"
    >
      <div class="content">
        <div style="display: flex; justify-content: space-between; font-size: 13px; gap: 15px;">
          <div style="color: #333; width: 100%;">
            <div style="margin-bottom: 5px;"> Cód. Barras:</div>
            <div> Nome do prod:</div>
          </div>
          <div style="font-weight: 550; color: #333; width: 100%; text-align: end; text-wrap: inherit; text-overflow: ellipsis;">
            <div style="margin-bottom: 5px;"> {{ produtoSelecionado?.codigo_barra }} </div>
            <div> {{ produtoSelecionado?.nome }}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; margin: 0;">
          <img src="../assets/Thinking face-rafiki.png" width="310px" alt="">
        </div>

        <p class="message poppins-regular" style="text-align: center; margin: 0; margin-bottom: 20px; transform: translateY(-10px);">
          Tem certeza que deseja excluir o produto selecionado?
        </p>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          style="background-color: #555; border: none"
          @click="cancelarExcluir"
        />
        <Button
          label="Excluir"
          severity="danger"
          :loading="loadingDelete"
          @click="excluirProduto"
        />
      </template>
    </Dialog>

    <!-- MODAL EDITAR PRODUTO -->
    <Dialog
      v-model:visible="showEditarProduto"
      modal
      :draggable="false"
      :dismissableMask="true"
      class="saas-dialog"
      style="font-family: 'Poppins';"
      :style="{ width: '600px' }"
    >
      <template #header>
        <div style="display: flex; flex-direction: column;">
          <div style="font-weight: 600;">
            Edição de produto cadastrado
          </div>
          <div style="display: flex; font-size: 14px; color: #656565; margin-top: 5px;">
            <div style="margin-right: 15px;">
              ID: #{{ produtoSelecionado?.id_produto }}
            </div>
            <div>|</div>
            <div style="margin-left: 15px;">
              Cod. Barra: {{ produtoSelecionado?.codigo_barra }}
            </div>
          </div>
        </div>
      </template>

      <div style="font-size: 11px; color: #555; margin-bottom: 20px;">
        Todos os produtos marcados com (*) são obrigatórios e não podem deixar de ser preenchidos.
      </div>

      <div style="display: flex; flex-direction: column;">
        <label>Nome do produto (*)</label>
        <input style="width: 100%; height: 40px; padding: 8px; margin-top: 10px; border: solid 1px #CCC; border-radius: 5px;" placeholder="Digite o nome do produto" v-model="produtoSelecionado.nome" type="text">
      </div>

      <div style="display: flex; gap: 10px; margin-top: 15px; width: 100%;">
        <div style="display: flex; flex-direction: column;">
          <label>Preço de custo (*)</label>
          <input style="width: 100%; height: 40px; padding: 8px; margin-top: 10px; border: solid 1px #CCC; border-radius: 5px;" placeholder="Digite o preço de custo" v-model="produtoSelecionado.preco_custo" @input="atualizarVendaManual" type="number">
        </div>
        <div style="display: flex; flex-direction: column;">
          <label>Margem (%) (*)</label>
          <input style="width: 100%; height: 40px; padding: 8px; margin-top: 10px; border: solid 1px #CCC; border-radius: 5px;" placeholder="Digite a margem" v-model="produtoSelecionado.margem" @input="atualizarVendaManual" type="number">
        </div>
        <div style="display: flex; flex-direction: column;">
          <label>Preço de venda (*)</label>
          <input disabled style="width: 100%; height: 40px; padding: 8px; margin-top: 10px; border: solid 1px #CCC; border-radius: 5px;" :value="calculoPrecoCusto" type="number">
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <div style="display: flex; flex-direction: column;">
          <label>Gondula estoque (*)</label>
          <input style="width: 100%; height: 40px; padding: 8px; margin-top: 10px; border: solid 1px #CCC; border-radius: 5px;" placeholder="Localização no estoque" v-model="produtoSelecionado.gondula_estoque" type="text">
        </div>
        <div style="display: flex; flex-direction: column;">
          <label>Gondula loja (*)</label>
          <input style="width: 100%; height: 40px; padding: 8px; margin-top: 10px; border: solid 1px #CCC; border-radius: 5px;" placeholder="Localização na loja" v-model="produtoSelecionado.gondula_loja" type="text">
        </div>
      </div>

      <div style="display: flex; flex-direction: column; margin-top: 15px;">
        <label>NCM</label>
        <input style="width: 100%; height: 40px; padding: 8px; margin-top: 10px; border: solid 1px #CCC; border-radius: 5px;" placeholder="Digite o NCM do produto" v-model="produtoSelecionado.ncm" type="text">
      </div>

      <div style="flex: 1.5; display: flex; flex-direction: column; gap: 10px; padding-bottom: 5px;">
        <div style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 20px;">
          <Checkbox v-model="produtoSelecionado.controle_lote" :binary="true" inputId="loteControl" />
          <label for="loteControl" style="font-size: 0.85rem; font-weight: 500; color: #6F767E; cursor: pointer;">
            Habilitar controle por lote
          </label>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <Checkbox v-model="produtoSelecionado.ajuste_automatico" :binary="true" inputId="priceAuto" />
          <label for="priceAuto" style="font-size: 0.85rem; font-weight: 500; color: #6F767E; cursor: pointer;">
            Reajuste automático de preço na entrada de produtos no estoque
          </label>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <Checkbox v-model="produtoSelecionado.desativado" :binary="true" inputId="desativarProd" />
          <label for="desativarProd" style="font-size: 0.85rem; font-weight: 500; color: #6F767E; cursor: pointer;">
            Desativar produto
          </label>
        </div>
      </div>
      
      <template #footer>
        <div style="display: flex; justify-content: end;">
          <button 
            @click="editarConfirmarProduto"
            :disabled="loadingEdit"
            style="background-color: #ff8049; padding: 10px; color: #FFF; border: none; border-radius: 10px; cursor: pointer;">
            {{ loadingEdit ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </template>
    </Dialog>
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
import { Checkbox, Dialog, InputNumber, InputText } from 'primevue'

export default {
  name: 'TabelaProdutos',
  components: { ProgressSpinner, DataTable, Column, Tag, Button, Dialog, InputText, InputNumber, Checkbox },

  data() {
    return {
      // pesquisa e filtros
      search: '',
      searchTimer: null,
      filterStatus: null,
      filterPromo: null,

      // estado de UI
      loading: false,
      loadingDelete: false,
      loadingEdit: false,
      showFilter: false,
      expandedRows: [],

      // produtos vindos do servidor (apenas a página atual)
      produtos: [],

      // paginação server-side
      paginaAtual: 1,
      itensPorPagina: 15,
      totalRegistros: 0,

      // auth
      auth: null,

      // modais
      produtoSelecionado: null,
      showEditarProduto: false,
      showConfirmDelete: false,
    }
  },

  computed: {
    totalPaginas() {
      return Math.ceil(this.totalRegistros / this.itensPorPagina) || 1
    },

    labelFiltro() {
      if (this.filterPromo === true) return 'Com promoção'
      if (this.filterPromo === false) return 'Sem promoção'
      if (this.filterStatus === 'ativo') return 'Ativos'
      if (this.filterStatus === 'desativado') return 'Desativados'
      return 'Filtrar por'
    },

    calculoPrecoCusto() {
      if (!this.produtoSelecionado) return '0.00'
      const custo = parseFloat(this.produtoSelecionado.preco_custo) || 0
      const margem = parseFloat(this.produtoSelecionado.margem) || 0
      return (custo * (1 + margem / 100)).toFixed(2)
    }
  },

  methods: {
    toggleFilter() { this.showFilter = !this.showFilter },

    setStatus(status) {
      this.filterStatus = status
      this.showFilter = false
      this.paginaAtual = 1
      this.receberPaginado()
    },

    setPromo(valor) {
      this.filterPromo = valor
      this.showFilter = false
      this.paginaAtual = 1
      this.receberPaginado()
    },

    clearFilters() {
      this.filterStatus = null
      this.filterPromo = null
      this.search = ''
      this.showFilter = false
      this.paginaAtual = 1
      this.receberPaginado()
    },

    // Debounce para a busca por texto: aguarda 400ms após o usuário parar de digitar
    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.paginaAtual = 1
        this.receberPaginado()
      }, 400)
    },

    irParaPagina(pagina) {
      if (pagina < 1 || pagina > this.totalPaginas) return
      this.paginaAtual = pagina
      this.receberPaginado()
    },

    handleClickOutside(e) {
      if (this.$refs.filterRef && !this.$refs.filterRef.contains(e.target)) this.showFilter = false
    },

    formatarDataHora(v) {
      if (!v) return '--'
      const d = new Date(Number(v))
      return isNaN(d.getTime()) ? '--' : d.toLocaleString('pt-BR')
    },

    mapearProduto(p) {
      return {
        ...p,
        status: p.desativado ? 'desativado' : 'ativo',
        desativado: !!p.desativado,
        inicio_promo: p.inicio_promo ? this.formatarDataHora(p.inicio_promo) : '--',
        fim_promo: p.fim_promo ? this.formatarDataHora(p.fim_promo) : '--',
        backup_reajuste: p.ultimo_reajuste,
        ultimo_reajuste: this.formatarDataHora(p.ultimo_reajuste),
      }
    },

    // ─── CONSULTAR (server-side pagination) ───────────────────────────────────
    // GET /mvpu/produto/consultarProdutos/:id_loja
    // Query params: page, limit, search, status, promo
    async receberPaginado() {
      try {
        this.loading = true
        this.auth = useAuthStore()

        const params = {
          page:   this.paginaAtual,
          limit:  this.itensPorPagina,
          search: this.search || undefined,
          status: this.filterStatus || undefined,
          promo:  this.filterPromo !== null ? this.filterPromo : undefined,
        }

        console.log(params, 'AAAA')

        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.id_loja}`,
          { params }
        )

        console.log(res, "AAA")

        const d = res.data

        console.log(d, "BBB")
        this.produtos       = (d.data || []).map(p => this.mapearProduto(p))
        this.totalRegistros = d.total ?? this.produtos.length

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    },

    // ─── EDITAR ───────────────────────────────────────────────────────────────
    editarProduto(produto) {
      this.produtoSelecionado = { ...produto }
      this.showEditarProduto = true
    },

    async editarConfirmarProduto() {
      try {
        const camposObrigatorios = ['nome', 'codigo_barra', 'preco_custo', 'margem']

        for (const campo of camposObrigatorios) {
          if (!this.produtoSelecionado[campo] && this.produtoSelecionado[campo] !== 0) {
            this.$toast.info(`Campo obrigatório não preenchido: ${campo}`)
            return
          }
        }

        this.loadingEdit = true

        const payload = {
          nome:             this.produtoSelecionado.nome,
          codigo_barra:     this.produtoSelecionado.codigo_barra,
          busca_rapida:     this.produtoSelecionado.busca_rapida || null,
          preco_custo:      parseFloat(this.produtoSelecionado.preco_custo),
          margem:           parseFloat(this.produtoSelecionado.margem),
          ncm:              this.produtoSelecionado.ncm || null,
          gondula_estoque:  this.produtoSelecionado.gondula_estoque,
          gondula_loja:     this.produtoSelecionado.gondula_loja,
          controle_lote:    this.produtoSelecionado.controle_lote ? 1 : 0,
          ajuste_automatico: this.produtoSelecionado.ajuste_automatico ? 1 : 0,
          desativado:       this.produtoSelecionado.desativado ? Date.now() : null,
          id_loja:          this.auth.id_loja,
        }

        // PUT /mvpu/produto/editarProduto
        await api.put('/mvpu/produto/editarProduto', payload)

        this.$toast.success('Produto editado com sucesso!')
        this.showEditarProduto = false
        this.produtoSelecionado = null
        await this.receberPaginado()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingEdit = false
      }
    },

    // ─── DELETAR ──────────────────────────────────────────────────────────────
    confirmarDelete(produto) {
      this.produtoSelecionado = produto
      this.showConfirmDelete = true
    },

    cancelarExcluir() {
      this.showConfirmDelete = false
      this.produtoSelecionado = null
    },

    async excluirProduto() {
      try {
        this.loadingDelete = true
        this.auth = useAuthStore()

        const payload = {
          itens_deletados: [
            { codigo_barra: this.produtoSelecionado.codigo_barra }
          ]
        }

        // DELETE /mvpu/produto/deletarProduto/:id_loja
        await api.delete(`/mvpu/produto/deletarProduto/${this.auth.id_loja}`, { data: payload })

        this.$toast.success('Produto excluído com sucesso!')
        this.showConfirmDelete = false
        this.produtoSelecionado = null

        // Se era o último item da página, volta uma página
        if (this.produtos.length === 1 && this.paginaAtual > 1) {
          this.paginaAtual--
        }
        await this.receberPaginado()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingDelete = false
      }
    },
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    this.receberPaginado()
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    clearTimeout(this.searchTimer)
  }
}
</script>

<style scoped>
.card { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 400px; }

/* HEADER */
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 10px;}
.search-box { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; gap: 12px; width: 100%; max-width: 450px; }
.search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 14px; color: #1e293b; }
.search-box i { color: #94a3b8; }

.actions-right { display: flex; align-items: center; gap: 12px; }

/* BOTAO FILTRAR (LARANJA) */
.btn-filter-custom { background: #f97316 !important; border: none !important; border-radius: 10px !important; padding: 10px 20px !important; height: 42px; font-weight: 600 !important; }

/* DROPDOWN */
.dropdown-wrapper { position: relative; }
.dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); min-width: 180px; z-index: 100; border: 1px solid #f1f5f9; overflow: hidden; }
.dropdown-item { width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 10px; color: #475569; }
.dropdown-item:hover { background: #f8fafc; color: #5A0F83; }
.dropdown-item.link-clear-dropdown { border-top: 1px solid #f1f5f9; color: #5A0F83; font-weight: 600; }
.dropdown hr { border: none; height: 1px; background: #f1f5f9; margin: 0; }

/* TABELA */
.barcode-text { font-family: monospace; font-weight: 600; color: #4f46e5; }
.text-dark { color: #1e293b; }
.text-muted { color: #64748b; font-size: 13px; }

/* EXPANSÃO EM CARDS */
.expansion-container { padding: 1.5rem; background: #fcfcfd; border-radius: 0 0 12px 12px; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.option-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
.option-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.title-1 { color: #5A0F83; }
.title-2 { color: #0284c7; }
.title-3 { color: #10b981; }

.info-row { display: flex; gap: 20px; }
.info-group { display: flex; flex-direction: column; flex: 1; }
.label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.value { font-size: 14px; color: #1e293b; font-weight: 500; }

/* PAGINAÇÃO CIRCULAR (LARANJA) */
.pagination-container { display: flex; justify-content: center; margin-top: 32px; padding-bottom: 10px; }
.pagination-content { display: flex; align-items: center; gap: 16px; background: #f8fafc; padding: 6px 12px; border-radius: 50px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.nav-btn { 
  width: 40px !important; height: 40px !important; 
  background: #f97316 !important; border: none !important; 
  border-radius: 50% !important; color: #ffffff !important; 
  display: flex !important; align-items: center !important; justify-content: center !important; 
  transition: all 0.2s ease; cursor: pointer; 
}
.nav-btn:hover:not(:disabled) { background: #ea580c !important; transform: scale(1.05); }
.nav-btn:disabled { background: #fed7aa !important; color: #ffffff !important; cursor: not-allowed; opacity: 0.7; }
.page-info { font-size: 14px; color: #64748b; user-select: none; }
.current-page { font-weight: 700; color: #1e293b; padding: 0 4px; }
.total-info { font-size: 12px; color: #94a3b8; }

/* FEEDBACKS */
.loading-container, .empty-container { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-img { max-width: 180px; margin-bottom: 16px; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }

:deep(.saas-dialog) {
  --primary-color: #0066FF;
  --text-main: #1A1D1F;
  --text-sub: #6F767E;
  --bg-input: #F4F4F4;
  --border-color: #EFEFEF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0px 40px 64px -12px rgba(0, 0, 0, 0.08);
}

.status-dot {
  width: 10px; height: 10px; border-radius: 50%; display: inline-block;
  animation: pulse-subtle 2s infinite ease-in-out;
}
.dot-green { background-color: #22c55e; box-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
.dot-red   { background-color: #ef4444; box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }

@keyframes pulse-subtle {
  0%   { transform: scale(0.9); opacity: 0.7; }
  50%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}
</style>