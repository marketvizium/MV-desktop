<template>
  <div class="console-page">

    <div class="console-content">
      <div class="form-container" style="padding-bottom: 100px;">

        <!-- ═══ BUSCA ═══ -->
        <div class="search-box margin-top-20">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="busca"
            class="search-input poppins-regular"
            placeholder="Pesquisar por nome do pedido..."
          />
        </div>

        <!-- ═══ ABAS: EM ANDAMENTO / FINALIZADOS ═══ -->
        <div class="segment-tabs margin-top-12">
          <button
            class="segment-btn poppins-medium"
            :class="{ active: abaPedidoDireto === 'indisponivel' }"
            @click="trocarAbaPedidoDireto('indisponivel')"
          >
            <span class="material-symbols-outlined">schedule</span>
            Em andamento
            <span class="segment-badge">{{ countEmAndamento }}</span>
          </button>
          <button
            class="segment-btn poppins-medium"
            :class="{ active: abaPedidoDireto === 'finalizada' }"
            @click="trocarAbaPedidoDireto('finalizada')"
          >
            <span class="material-symbols-outlined">verified</span>
            Finalizados
            <span class="segment-badge">{{ countFinalizados }}</span>
          </button>
        </div>

        <!-- ═══ PAINEL DE FILTROS (PERÍODO) ═══ -->
        <div class="filtros-painel margin-top-12">
          <div class="filtros-painel-header">
            <span class="filtros-painel-label poppins-medium">Período</span>
            <button
              v-if="filtroPeriodoAtivo"
              class="filtros-limpar poppins-medium"
              @click="limparFiltros"
            >
              <span class="material-symbols-outlined" style="font-size:14px">filter_alt_off</span>
              Limpar
            </button>
          </div>
          <div class="periodo-filtros">
            <button
              class="chip-btn poppins-medium"
              :class="{ active: filtroPeriodoAtivo === 'hoje' }"
              @click="definirFiltroData('hoje')"
            >
              Hoje
            </button>
            <button
              class="chip-btn poppins-medium"
              :class="{ active: filtroPeriodoAtivo === 'semana' }"
              @click="definirFiltroData('semana')"
            >
              Esta semana
            </button>
            <button
              class="chip-btn poppins-medium"
              :class="{ active: filtroPeriodoAtivo === 'mes' }"
              @click="definirFiltroData('mes')"
            >
              Este mês
            </button>
          </div>
        </div>

        <!-- ═══ AÇÕES: CRIAR / SELECIONAR ═══ -->
        <div class="acoes-linha margin-top-12">
          <button class="btn-primario poppins-medium" @click="$router.push({name: 'CriarPedidoDireto'})">
            <span class="material-symbols-outlined">add</span>
            Criar pedido direto
          </button>

          <button
            v-if="abaPedidoDireto === 'indisponivel' && pedidosDiretosProcessados.length > 0"
            class="btn-secundario poppins-medium"
            @click="alternarModoSelecao"
          >
            <span class="material-symbols-outlined">{{ modoSelecao ? 'close' : 'checklist' }}</span>
            {{ modoSelecao ? 'Cancelar' : 'Selecionar' }}
          </button>
        </div>


        <!-- ═══════════════════════════════════════════
             LISTA: PEDIDOS DIRETOS
        ═══════════════════════════════════════════ -->
        <div class="lista-section margin-top-20">
          <div v-if="loadingPedidosDiretos" class="loading-lista poppins-regular">
            Carregando pedidos diretos...
          </div>

          <!-- ═══ EM ANDAMENTO: lista simples (com seleção) ═══ -->
          <template v-else-if="abaPedidoDireto === 'indisponivel'">
            <div class="lista-cards">
              <div
                v-for="pedido in pedidosDiretosPaginados"
                :key="pedido.id_pedido_direto"
                class="item-card"
                :class="{
                  'item-card-selecionavel': modoSelecao,
                  'item-card-selecionado': idsSelecionados.includes(pedido.id_pedido_direto)
                }"
                @click="modoSelecao ? alternarSelecao(pedido) : irParaPedidoDireto(pedido)"
              >
                <div v-if="modoSelecao" class="item-card-checkbox">
                  <span class="material-symbols-outlined">
                    {{ idsSelecionados.includes(pedido.id_pedido_direto) ? 'check_box' : 'check_box_outline_blank' }}
                  </span>
                </div>

                <div class="item-card-avatar">
                  <img
                    v-if="pedido.foto_perfil"
                    :src="pedido.foto_perfil"
                    class="item-card-avatar-img"
                    alt="Foto do vendedor"
                  />
                  <div v-else class="item-card-avatar-placeholder">
                    <span class="material-symbols-outlined">person</span>
                  </div>
                </div>

                <div class="item-card-main">
                  <div class="item-card-top">
                    <span class="item-nome poppins-medium">{{ pedido.nome || pedido.nome_pedido_direto || pedido.nome_usuario }}</span>
                    <span
                      class="status-tag poppins-medium"
                      :class="'tag-' + (pedido.status_pedido_direto === 'finalizada' ? 'finalizada' : 'indisponivel')"
                    >
                      {{ pedido.status_pedido_direto === 'finalizada' ? 'Finalizado' : 'Em andamento' }}
                    </span>
                  </div>
                  <div class="item-card-empresa poppins-regular">
                    <span class="material-symbols-outlined" style="font-size:13px">storefront</span>
                    {{ pedido.nome_empresa || '-' }}
                  </div>
                  <div class="item-card-cnpj poppins-regular">
                    <span class="material-symbols-outlined" style="font-size:13px">badge</span>
                    {{ formatarCnpj(pedido.cnpj) }}
                  </div>
                  <div class="item-card-bottom">
                    <span class="item-data poppins-regular">
                      <span class="material-symbols-outlined" style="font-size:14px">event</span>
                      Criado em {{ formatarData(pedido.criado_em) }}
                    </span>
                  </div>
                </div>
                <span v-if="!modoSelecao" class="material-symbols-outlined item-card-chevron">chevron_right</span>
              </div>

              <div v-if="pedidosDiretosProcessados.length === 0" class="sem-itens poppins-regular">
                Nenhum pedido direto encontrado.
              </div>
            </div>

            <div v-if="totalPaginasPedidosDiretos > 1" class="paginacao">
              <button class="btn-pag" :disabled="paginaPedidosDiretos === 1" @click="paginaPedidosDiretos--">‹</button>
              <span class="pag-info poppins-regular">{{ paginaPedidosDiretos }} / {{ totalPaginasPedidosDiretos }}</span>
              <button class="btn-pag" :disabled="paginaPedidosDiretos === totalPaginasPedidosDiretos" @click="paginaPedidosDiretos++">›</button>
            </div>
          </template>

          <!-- ═══ FINALIZADOS: agrupado por vendedor ═══ -->
          <template v-else>
            <div class="lista-vendedores">
              <div
                v-for="grupo in vendedoresAgrupados"
                :key="grupo.chave"
                class="vendedor-group"
              >
                <div
                  class="vendedor-group-header"
                  :class="{ expandido: vendedorEstaExpandido(grupo.chave) }"
                  @click="alternarExpandirVendedor(grupo.chave)"
                >
                  <div class="item-card-avatar">
                    <img
                      v-if="grupo.foto_perfil"
                      :src="grupo.foto_perfil"
                      class="item-card-avatar-img"
                      alt="Foto do vendedor"
                    />
                    <div v-else class="item-card-avatar-placeholder">
                      <span class="material-symbols-outlined">person</span>
                    </div>
                  </div>

                  <div class="vendedor-group-info">
                    <div class="vendedor-group-top">
                      <span class="item-nome poppins-medium">{{ grupo.nome_usuario || 'Vendedor' }}</span>
                      <span class="vendedor-group-badge poppins-medium">
                        {{ grupo.pedidos.length }} pedido{{ grupo.pedidos.length > 1 ? 's' : '' }}
                      </span>
                    </div>
                    <div class="item-card-empresa poppins-regular">
                      <span class="material-symbols-outlined" style="font-size:13px">storefront</span>
                      {{ grupo.nome_empresa || '-' }}
                    </div>
                    <div class="item-card-cnpj poppins-regular">
                      <span class="material-symbols-outlined" style="font-size:13px">badge</span>
                      {{ formatarCnpj(grupo.cnpj) }}
                    </div>
                  </div>

                  <span class="material-symbols-outlined vendedor-group-chevron">
                    {{ vendedorEstaExpandido(grupo.chave) ? 'expand_less' : 'expand_more' }}
                  </span>
                </div>

                <transition name="expand-fade">
                  <div v-if="vendedorEstaExpandido(grupo.chave)" class="vendedor-group-body">
                    <div
                      v-for="pedido in pedidosPaginadosVendedor(grupo)"
                      :key="pedido.id_pedido_direto"
                      class="item-card item-card-sub"
                      @click="irParaPedidoDireto(pedido)"
                    >
                      <div class="item-card-main">
                        <div class="item-card-top">
                          <span class="item-nome poppins-medium">{{ pedido.nome || pedido.nome_pedido_direto || pedido.nome_usuario }}</span>
                          <span class="status-tag poppins-medium tag-finalizada">Finalizado</span>
                        </div>
                        <div class="item-card-bottom">
                          <span class="item-data poppins-regular">
                            <span class="material-symbols-outlined" style="font-size:14px">event</span>
                            Criado em {{ formatarData(pedido.criado_em) }}
                          </span>
                        </div>
                        <div class="item-card-bottom">
                          <span class="item-data poppins-regular">
                            <span class="material-symbols-outlined" style="font-size:14px">event_available</span>
                            Finalizado em {{ formatarData(pedido.finalizado_em) }}
                          </span>
                        </div>
                      </div>
                      <span class="material-symbols-outlined item-card-chevron">chevron_right</span>
                    </div>

                    <div v-if="totalPaginasVendedor(grupo) > 1" class="paginacao paginacao-vendedor">
                      <button
                        class="btn-pag"
                        :disabled="paginaVendedor(grupo.chave) === 1"
                        @click.stop="irParaPaginaVendedor(grupo.chave, paginaVendedor(grupo.chave) - 1)"
                      >‹</button>
                      <span class="pag-info poppins-regular">
                        {{ paginaVendedor(grupo.chave) }} / {{ totalPaginasVendedor(grupo) }}
                      </span>
                      <button
                        class="btn-pag"
                        :disabled="paginaVendedor(grupo.chave) === totalPaginasVendedor(grupo)"
                        @click.stop="irParaPaginaVendedor(grupo.chave, paginaVendedor(grupo.chave) + 1)"
                      >›</button>
                    </div>
                  </div>
                </transition>
              </div>

              <div v-if="vendedoresAgrupados.length === 0" class="sem-itens poppins-regular">
                Nenhum pedido direto finalizado encontrado.
              </div>
            </div>
          </template>
        </div>

      </div>
    </div>

    <!-- ═══ BARRA FLUTUANTE DE SELEÇÃO ═══ -->
    <transition name="modal-fade">
      <div v-if="modoSelecao && idsSelecionados.length > 0" class="selecao-barra">
        <span class="selecao-barra-texto poppins-medium">
          {{ idsSelecionados.length }} selecionado{{ idsSelecionados.length > 1 ? 's' : '' }}
        </span>
        <button
          class="btn-finalizar-selecao poppins-medium"
          :disabled="loadingEnviar"
          @click="abrirConfirmacaoFinalizar"
        >
          <span class="material-symbols-outlined">send</span>
          Finalizar
        </button>
      </div>
    </transition>

    <!-- ═══ MODAL: CONFIRMAR FINALIZAÇÃO ═══ -->
    <transition name="modal-fade">
      <div v-if="modalConfirmacaoVisivel" class="modal-overlay" @click.self="fecharConfirmacaoFinalizar">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-header-icon">
              <span class="material-symbols-outlined">help</span>
            </div>
            <div>
              <p class="modal-title poppins-medium">Finalizar pedidos diretos</p>
              <p class="modal-subtitle poppins-regular">
                Certeza que você deseja finalizar {{ idsSelecionados.length }}
                pedido{{ idsSelecionados.length > 1 ? 's' : '' }} direto{{ idsSelecionados.length > 1 ? 's' : '' }}?
              </p>
            </div>
            <button class="modal-close-btn" @click="fecharConfirmacaoFinalizar">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-footer">
            <button class="btn-nunca-mais poppins-regular" :disabled="loadingEnviar" @click="fecharConfirmacaoFinalizar">
              Cancelar
            </button>
            <button class="btn-entendi poppins-medium" :disabled="loadingEnviar" @click="confirmarFinalizacao">
              <span class="material-symbols-outlined">{{ loadingEnviar ? 'hourglass_top' : 'check' }}</span>
              {{ loadingEnviar ? 'Enviando...' : 'Sim, finalizar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import { mapState } from 'pinia'

const LS_KEY_MODAL_STATUS = 'mvsgdb_modal_status_oculto'
const POR_PAGINA = 10

export default defineComponent({
  name: 'ConsultarCotacoesMobile',

  data() {
    return {
      auth: null as any,

      // Aba ativa: 'cotacoes' | 'pedidos_diretos'
      abaAtiva: 'pedidos_diretos',

      // Cotações
      cotacoes: [] as any[],
      loadingCotacoes: true,
      paginaCotacoes: 1,

      // Pedidos diretos
      pedidosDiretos: [] as any[],
      loadingPedidosDiretos: true,
      paginaPedidosDiretos: 1,

      // Filtros (compartilhados entre as duas abas)
      busca: '',
      filtroPeriodoAtivo: null as string | null,
      filtroDatas: null as [Date, Date] | null,
      filtroStatus: null as string | null,              // cotações: aberta | fechada | finalizada | indisponivel

      // Aba de pedidos diretos: 'indisponivel' (em andamento) | 'finalizada'
      abaPedidoDireto: 'indisponivel' as 'indisponivel' | 'finalizada',

      // Seleção múltipla p/ finalizar vários pedidos diretos de uma vez
      modoSelecao: false,
      idsSelecionados: [] as number[],
      modalConfirmacaoVisivel: false,
      loadingEnviar: false,

      // Aba "Finalizados": agrupamento por vendedor (expansão + paginação por grupo)
      vendedoresExpandidos: [] as string[],
      paginaPorVendedor: {} as Record<string, number>,

      modalStatusVisivel: false
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user']),

    cotacoesProcessadas(): any[] {
      let lista = [...this.cotacoes]

      if (this.busca) {
        const termo = this.busca.toLowerCase()
        lista = lista.filter((c: any) => (c.nome_cotacao || '').toLowerCase().includes(termo))
      }

      if (this.filtroStatus) {
        lista = lista.filter((c: any) => this.getStatusKey(c) === this.filtroStatus)
      }

      if (this.filtroDatas && this.filtroDatas[0] && this.filtroDatas[1]) {
        const [inicio, fim] = this.filtroDatas
        lista = lista.filter((c: any) => {
          const data = new Date(Number(c.inicio_cotacao))
          return data >= inicio && data <= fim
        })
      }

      lista.sort((a: any, b: any) => Number(b.inicio_cotacao) - Number(a.inicio_cotacao))

      return lista
    },

    totalPaginasCotacoes(): number {
      return Math.max(1, Math.ceil(this.cotacoesProcessadas.length / POR_PAGINA))
    },

    cotacoesPaginadas(): any[] {
      const inicio = (this.paginaCotacoes - 1) * POR_PAGINA
      return this.cotacoesProcessadas.slice(inicio, inicio + POR_PAGINA)
    },

    pedidosDiretosProcessados(): any[] {
      let lista = [...this.pedidosDiretos]

      if (this.busca) {
        const termo = this.busca.toLowerCase()
        lista = lista.filter((p: any) => {
          const nome = p.nome || p.nome_pedido_direto || p.nome_usuario || ''
          return nome.toLowerCase().includes(termo)
        })
      }

      lista = lista.filter((p: any) =>
        this.abaPedidoDireto === 'finalizada'
          ? p.status_pedido_direto === 'finalizada'
          : p.status_pedido_direto !== 'finalizada'
      )

      if (this.filtroDatas && this.filtroDatas[0] && this.filtroDatas[1]) {
        const [inicio, fim] = this.filtroDatas
        lista = lista.filter((p: any) => {
          const data = new Date(Number(p.criado_em))
          return data >= inicio && data <= fim
        })
      }

      lista.sort((a: any, b: any) => Number(b.criado_em) - Number(a.criado_em))

      return lista
    },

    totalPaginasPedidosDiretos(): number {
      return Math.max(1, Math.ceil(this.pedidosDiretosProcessados.length / POR_PAGINA))
    },

    pedidosDiretosPaginados(): any[] {
      const inicio = (this.paginaPedidosDiretos - 1) * POR_PAGINA
      return this.pedidosDiretosProcessados.slice(inicio, inicio + POR_PAGINA)
    },

    // Contagens exibidas nas abas (independem de busca/filtro de período)
    countEmAndamento(): number {
      return this.pedidosDiretos.filter((p: any) => p.status_pedido_direto !== 'finalizada').length
    },

    countFinalizados(): number {
      return this.pedidosDiretos.filter((p: any) => p.status_pedido_direto === 'finalizada').length
    },

    // Agrupa os pedidos diretos finalizados por vendedor (aba "Finalizados").
    // Cada grupo carrega os dados do vendedor (nome, empresa, cnpj, foto) +
    // a lista completa de pedidos daquele vendedor, que é paginada à parte
    // quando o grupo é expandido (ver pedidosPaginadosVendedor).
    vendedoresAgrupados(): any[] {
      if (this.abaPedidoDireto !== 'finalizada') return []

      const mapa = new Map<string, any>()

      for (const pedido of this.pedidosDiretosProcessados) {
        const chave = String(pedido.id_vendedor ?? pedido.cnpj ?? pedido.nome_usuario ?? 'sem-vendedor')

        if (!mapa.has(chave)) {
          mapa.set(chave, {
            chave,
            id_vendedor: pedido.id_vendedor,
            nome_usuario: pedido.nome,
            foto_perfil: pedido.foto_perfil,
            nome_empresa: pedido.nome_empresa,
            cnpj: pedido.cnpj,
            pedidos: [] as any[]
          })
        }

        mapa.get(chave).pedidos.push(pedido)
      }

      return Array.from(mapa.values()).sort((a: any, b: any) => b.pedidos.length - a.pedidos.length)
    }
  },

  watch: {
    busca() {
      this.paginaCotacoes = 1
      this.paginaPedidosDiretos = 1
    }
  },

  methods: {
    trocarAba(aba: string) {
      this.abaAtiva = aba
    },

    async buscarPedidosDiretos() {
      this.loadingPedidosDiretos = true
      try {
        const response = await api.get(`/mvpu/cotacao/consultarPedidosDiretos/${this.auth.id_loja}/0`)
        this.pedidosDiretos = response.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingPedidosDiretos = false
      }
    },

    definirFiltroData(tipo: string) {
      this.filtroPeriodoAtivo = tipo
      const hoje = new Date()
      let inicio = new Date()
      let fim = new Date()

      if (tipo === 'hoje') {
        inicio.setHours(0, 0, 0, 0)
        fim.setHours(23, 59, 59, 999)
      } else if (tipo === 'semana') {
        const diaSemana = hoje.getDay()
        inicio.setDate(hoje.getDate() - diaSemana)
        inicio.setHours(0, 0, 0, 0)
        fim.setHours(23, 59, 59, 999)
      } else if (tipo === 'mes') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        fim.setHours(23, 59, 59, 999)
      }

      this.filtroDatas = [inicio, fim]
      this.paginaCotacoes = 1
      this.paginaPedidosDiretos = 1
    },

    limparFiltros() {
      this.filtroDatas = null
      this.filtroPeriodoAtivo = null
      this.filtroStatus = null
      this.paginaCotacoes = 1
      this.paginaPedidosDiretos = 1
    },

    definirFiltroStatus(status: string) {
      this.filtroStatus = this.filtroStatus === status ? null : status
      this.paginaCotacoes = 1
    },

    // ── Abas: Em andamento / Finalizados ────────────────────────────
    trocarAbaPedidoDireto(aba: 'indisponivel' | 'finalizada') {
      this.abaPedidoDireto = aba
      this.paginaPedidosDiretos = 1
      this.sairModoSelecao()
      this.vendedoresExpandidos = []
      this.paginaPorVendedor = {}
    },

    // ── Seleção múltipla p/ finalizar vários pedidos diretos ────────
    alternarModoSelecao() {
      this.modoSelecao = !this.modoSelecao
      if (!this.modoSelecao) this.idsSelecionados = []
    },

    sairModoSelecao() {
      this.modoSelecao = false
      this.idsSelecionados = []
    },

    alternarSelecao(pedido: any) {
      const idx = this.idsSelecionados.indexOf(pedido.id_pedido_direto)
      if (idx === -1) {
        this.idsSelecionados.push(pedido.id_pedido_direto)
      } else {
        this.idsSelecionados.splice(idx, 1)
      }
    },

    abrirConfirmacaoFinalizar() {
      if (this.idsSelecionados.length === 0) return
      this.modalConfirmacaoVisivel = true
    },

    fecharConfirmacaoFinalizar() {
      if (this.loadingEnviar) return
      this.modalConfirmacaoVisivel = false
    },

    // Finaliza em lote — o backend aceita id_pedido_direto tanto
    // sozinho quanto em array, processando cada id individualmente.
    async confirmarFinalizacao() {
      this.loadingEnviar = true
      try {
        await api.post(
          `/mvpu/cotacao/finalizarPedDir/${this.auth.id_loja}/0`,
          {
            id_pedido_direto: [...this.idsSelecionados],
            id_colaborador: this.auth.user?.id_usuario
          }
        )

        this.pedidosDiretos.forEach((p: any) => {
          if (this.idsSelecionados.includes(p.id_pedido_direto)) {
            p.status_pedido_direto = 'finalizada'
            p.finalizado_em = Date.now()
          }
        })

        this.$toast.info('Os pedidos diretos enviados estão agora em "Finalizados"');

        this.modalConfirmacaoVisivel = false
        this.sairModoSelecao()
        this.abaPedidoDireto = 'finalizada'
        this.paginaPedidosDiretos = 1
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingEnviar = false
      }
    },

    // ── Modal de Status ──────────────────────────────────────────
    fecharModal() {
      this.modalStatusVisivel = false
    },

    fecharModalDefinitivamente() {
      localStorage.setItem(LS_KEY_MODAL_STATUS, 'true')
      this.modalStatusVisivel = false
    },

    verificarExibirModal() {
      const oculto = localStorage.getItem(LS_KEY_MODAL_STATUS)
      if (!oculto) {
        this.modalStatusVisivel = true
      }
    },

    // ── Status Derivado (Cotação) ──────────────────────────────────
    getStatusKey(cotacao: any): string {
      const s = cotacao.status_cotacao
      const f = cotacao.status_fechamento
      if (s === 'fechada') return 'indisponivel'
      if (s === 'aberta') return 'aberta'
      if (s === 'finalizada') {
        if (f === 'concluido') return 'finalizada'
        return 'fechada' // null ou 'pendente'
      }
      return 'aberta'
    },

    getLabelStatus(cotacao: any): string {
      const key = this.getStatusKey(cotacao)
      const labels: Record<string, string> = {
        aberta: 'Aberta',
        fechada: 'Fechada',
        finalizada: 'Finalizada',
        indisponivel: 'Indisponível'
      }
      return labels[key] || key
    },

    formatarData(timestamp: any): string {
      if (!timestamp) return '-'
      return new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatarCnpj(cnpj: any): string {
      if (!cnpj) return '-'
      const digitos = String(cnpj).replace(/\D/g, '')
      if (digitos.length !== 14) return String(cnpj)
      return digitos.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      )
    },

    // ── Aba "Finalizados": expandir/recolher grupo de vendedor ─────
    alternarExpandirVendedor(chave: string) {
      const idx = this.vendedoresExpandidos.indexOf(chave)
      if (idx === -1) {
        this.vendedoresExpandidos.push(chave)
      } else {
        this.vendedoresExpandidos.splice(idx, 1)
      }
    },

    vendedorEstaExpandido(chave: string): boolean {
      return this.vendedoresExpandidos.includes(chave)
    },

    // ── Aba "Finalizados": paginação independente dentro de cada grupo ─
    paginaVendedor(chave: string): number {
      return this.paginaPorVendedor[chave] || 1
    },

    totalPaginasVendedor(grupo: any): number {
      return Math.max(1, Math.ceil(grupo.pedidos.length / POR_PAGINA))
    },

    pedidosPaginadosVendedor(grupo: any): any[] {
      const pagina = this.paginaVendedor(grupo.chave)
      const inicio = (pagina - 1) * POR_PAGINA
      return grupo.pedidos.slice(inicio, inicio + POR_PAGINA)
    },

    irParaPaginaVendedor(chave: string, pagina: number) {
      const total = Math.max(1, pagina)
      this.paginaPorVendedor = { ...this.paginaPorVendedor, [chave]: total }
    },

    // ATENÇÃO: ajuste o "name" da rota abaixo caso a página de
    // gerenciamento/itens do pedido direto tenha outro nome de rota.
    //
    // Os dados do vendedor NÃO são enviados via `query` (o que os deixaria
    // visíveis na URL). Em vez disso, usamos o `state` do History API do
    // navegador, que o Vue Router 4 (>=4.1) aceita nativamente no `push`.
    // Esses dados ficam anexados à entrada do histórico do navegador e
    // não aparecem na barra de endereço nem em query string/params.
    irParaPedidoDireto(pedido: any) {
      this.$router.push({
        name: 'PedidoDireto',
        query: {
          id_pedido_direto: pedido.id_pedido_direto
        }
      })
    },

    // Ponto único de entrada na tela — chamado em mounted() e, quando
    // aplicável, em activated() (ver comentário no hook activated()).
    entrarNaTela() {
      this.auth = useAuthStore()
      this.buscarPedidosDiretos()
      this.verificarExibirModal()
      this.abaPedidoDireto = 'indisponivel'
      this.sairModoSelecao()
    }
  },

  mounted() {
    this.entrarNaTela()
  },

  // Cobre o caso de a página ser mantida viva por um <keep-alive> no
  // router-view (padrão comum em apps Vue "SPA" para simular o
  // comportamento de "entrar na tela novamente" que o Ionic dava via
  // ionViewDidEnter). Se o app não usar keep-alive, este hook
  // simplesmente nunca é chamado e mounted() já cobre tudo.
  activated() {
    this.entrarNaTela()
  }

})
</script>

<style scoped>
/* === CONTAINER & ESTRUTURA BASE === */
.console-page {
  background-color: #FFF !important;
  min-height: 100vh;
}

.console-content {
  background-color: #FFF !important;
  color: #000;
  min-height: 100vh;
  overflow-y: auto;
}

.form-container {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  min-height: 100%;
}

.title-section {
  margin-bottom: 8px;
}

.title-section h2 {
  font-size: 22px;
  margin: 0 0 6px 0;
  color: #000 !important;
}

.title-section p.muted {
  font-size: 14px;
  margin: 0;
  color: #525151 !important;
}

/* === UTILS === */
.margin-top-12 { margin-top: 12px; }
.margin-top-20 { margin-top: 20px; }

/* === ABAS === */
.segment-tabs {
  display: flex;
  background: #f0f0f0;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.segment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 13px;
  padding: 10px 0;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.segment-btn .material-symbols-outlined {
  font-size: 17px;
}

.segment-btn.active {
  background: #FF8049;
  color: #fff;
  box-shadow: 0 2px 6px rgba(255, 128, 73, 0.35);
}

.segment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
  font-size: 11px;
}

.segment-btn.active .segment-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* === BOTÃO AJUDA STATUS === */
.btn-ajuda-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff7f3;
  border: 1px solid #ffd4be;
  color: #FF8049 !important;
  font-size: 13px;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.btn-ajuda-status .material-symbols-outlined {
  font-size: 18px;
}

/* === BUSCA === */
.search-box {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border: 1px solid rgb(177, 177, 177);
  border-radius: 10px;
  padding: 0 12px;
  height: 46px;
}

.search-icon {
  color: #888;
  flex-shrink: 0;
  margin-right: 8px;
  font-size: 18px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #000 !important;
  width: 100%;
  height: 100%;
}

.search-input::placeholder {
  color: #888 !important;
}

/* === PAINEL DE FILTROS (PERÍODO) === */
.filtros-painel {
  border: 1px solid #ececec;
  border-radius: 12px;
  background: #fafafa;
  padding: 12px 14px;
}

.filtros-painel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.filtros-painel-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #888 !important;
}

.filtros-limpar {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: #FF8049 !important;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
}

/* === AÇÕES: CRIAR / SELECIONAR === */
.acoes-linha {
  display: flex;
  gap: 10px;
}

.btn-primario {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  border: none;
  border-radius: 10px;
  background-color: #FF8049;
  color: #fff !important;
  font-size: 14px;
  cursor: pointer;
}

.btn-primario .material-symbols-outlined {
  font-size: 19px;
}

.btn-secundario {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  padding: 0 16px;
  border: 1.5px solid #d0d5dd;
  border-radius: 10px;
  background: #fff;
  color: #475467 !important;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-secundario .material-symbols-outlined {
  font-size: 18px;
}

/* === FILTRO RÁPIDO DE PERÍODO (chips) === */
.periodo-filtros {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.chip-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #ddd;
  background: #fff;
  color: #555;
  font-size: 12.5px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

.chip-btn.active {
  background: #FF8049;
  border-color: #FF8049;
  color: #fff;
}

.chip-btn-limpar {
  color: #FF8049;
  background: #fff7f3;
  border-color: #ffd4be;
}

/* === FILTRO DE STATUS (toggle) === */
.status-filtros {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filter-btn-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  background-color: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  color: #475467;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-btn-toggle .material-symbols-outlined {
  font-size: 17px;
}

.filter-btn-toggle.active {
  background-color: #fff1eb;
  border-color: #FF8049;
  color: #FF8049;
}

/* === LISTA (cards) === */
.lista-section {
  display: flex;
  flex-direction: column;
}

.loading-lista,
.sem-itens {
  text-align: center;
  color: #aaa !important;
  font-size: 14px;
  padding: 32px 0;
}

.lista-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  border: 1.5px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.item-card:active {
  border-color: #FF8049;
  background: #fff7f3;
}

.item-card-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}

.item-card-avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 1px solid #eee;
}

.item-card-avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f1f3f5;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-card-avatar-placeholder .material-symbols-outlined {
  font-size: 24px;
  color: #9aa1a9 !important;
}

.item-card-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-card-empresa,
.item-card-cnpj {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #666 !important;
}

.item-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.item-nome {
  font-size: 14px;
  color: #000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-card-bottom {
  display: flex;
  align-items: center;
}

.item-data {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #888 !important;
}

.item-card-chevron {
  color: #ccc !important;
  flex-shrink: 0;
}

/* === AGRUPAMENTO POR VENDEDOR (aba Finalizados) === */
.lista-vendedores {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vendedor-group {
  border-radius: 10px;
  border: 1.5px solid #eee;
  background: #fff;
  overflow: hidden;
}

.vendedor-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.vendedor-group-header:active {
  background: #fff7f3;
}

.vendedor-group-header.expandido {
  background: #fff7f3;
  border-bottom: 1px solid #ffd4be;
}

.vendedor-group-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vendedor-group-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.vendedor-group-badge {
  font-size: 10.5px;
  font-weight: 600;
  color: #FF8049 !important;
  background: #fff1eb;
  padding: 3px 9px;
  border-radius: 20px;
  flex-shrink: 0;
  white-space: nowrap;
}

.vendedor-group-chevron {
  color: #FF8049 !important;
  flex-shrink: 0;
}

.vendedor-group-body {
  padding: 8px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fafafa;
}

.item-card-sub {
  border-color: #eee;
  background: #fff;
}

.paginacao-vendedor {
  padding: 6px 0 2px;
}

.expand-fade-enter-active,
.expand-fade-leave-active {
  transition: opacity 0.2s ease;
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  opacity: 0;
}

/* === SELEÇÃO MÚLTIPLA === */
.item-card-selecionavel {
  cursor: pointer;
}

.item-card-selecionado {
  border-color: #FF8049 !important;
  background: #fff7f3 !important;
}

.item-card-checkbox {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-card-checkbox .material-symbols-outlined {
  font-size: 22px;
  color: #FF8049 !important;
}

/* Barra flutuante de seleção */
.selecao-barra {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1e293b;
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 500;
}

.selecao-barra-texto {
  font-size: 13.5px;
  color: #fff !important;
}

.btn-finalizar-selecao {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  background: #FF8049;
  color: #fff !important;
  font-size: 13px;
  padding: 9px 14px;
  cursor: pointer;
}

.btn-finalizar-selecao:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tags de status */
.status-tag {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 3px 9px;
  border-radius: 20px;
  flex-shrink: 0;
}

.tag-fechada {
  background-color: #ff804930 !important;
  color: #FF8049 !important;
}

.tag-indisponivel {
  background-color: #94a3b830 !important;
  color: #64748b !important;
}

.tag-finalizada {
  background-color: #3b82f630 !important;
  color: #3b82f6 !important;
}

.tag-aberta {
  background-color: #22c55e30 !important;
  color: #16a34a !important;
}

/* Paginação */
.paginacao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 0 4px;
}

.btn-pag {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-pag:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pag-info {
  font-size: 12px;
  color: #666 !important;
  min-width: 46px;
  text-align: center;
}

/* === REGRAS DO HEADER MOBILE === */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #FFF !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.cc-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  background: none;
  border: none;
  color: #FF8049 !important;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.back-btn span {
  font-size: 20px;
}
.cotacao-identity {
  display: flex;
  flex-direction: column;
}
.cotacao-label {
  font-size: 10px;
  color: #FF8049 !important;
  letter-spacing: 1px;
}
.cotacao-name {
  font-size: 16px;
  color: #000 !important;
}

/* ════════════════════════════════════════════
   MODAL: Entendendo os Status
════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  padding: 0;
}

.modal-card {
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 620px;
  max-height: 88vh;
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.4rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-header-icon .material-symbols-outlined {
  color: #ffffff;
  font-size: 20px;
}

.modal-title {
  font-size: 0.98rem;
  color: #1e293b !important;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: #64748b !important;
  margin: 2px 0 0 0;
}

.modal-close-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 4px;
}

.modal-body {
  padding: 1.2rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.status-card {
  border-radius: 10px;
  padding: 0.9rem 1rem;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.status-card--indisponivel { background: #f8fafc; border-left-color: #94a3b8; }
.status-card--aberta       { background: #f0fdf4; border-left-color: #22c55e; }
.status-card--fechada      { background: #fff7f3; border-left-color: #FF8049; }
.status-card--finalizada   { background: #eff6ff; border-left-color: #3b82f6; }

.status-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-card-badge .material-symbols-outlined {
  font-size: 17px;
}

.status-card--indisponivel .status-card-badge { color: #64748b !important; }
.status-card--aberta      .status-card-badge { color: #16a34a !important; }
.status-card--fechada     .status-card-badge { color: #FF8049 !important; }
.status-card--finalizada  .status-card-badge { color: #2563eb !important; }

.status-card-desc {
  font-size: 0.82rem;
  color: #475569 !important;
  line-height: 1.55;
  margin: 0;
}

.modal-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.6rem;
  padding: 1rem 1.4rem 1.4rem;
  border-top: 1px solid #f1f5f9;
}

.btn-nunca-mais {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8 !important;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
}

.btn-nunca-mais .material-symbols-outlined {
  font-size: 16px;
}

.btn-entendi {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #ffffff !important;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.4rem;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
}

.btn-entendi .material-symbols-outlined {
  font-size: 18px;
}

.btn-entendi:disabled,
.btn-nunca-mais:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: translateY(20px);
  opacity: 0;
}

/* === RESPONSIVO (tablet/desktop) === */
@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
    padding: 1rem;
  }
  .modal-card {
    border-radius: 16px;
  }
}
</style>