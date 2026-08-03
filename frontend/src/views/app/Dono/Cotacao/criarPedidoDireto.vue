<template>
  <div class="console-page">

    <header class="ion-no-border">
      <div class="cc-header">
        <div class="cc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="cotacao-identity">
            <span class="cotacao-label">GESTÃO</span>
            <span class="cotacao-name">Registrar novo pedido direto</span>
          </div>
        </div>
      </div>
    </header>

    <div class="console-content">
      <div class="form-container" style="padding-bottom: 0;">
        <div class="title-section" style="flex-shrink: 0;">
          <h2 class="poppins-semibold">Criar pedido direto</h2>
          <p class="poppins-regular muted">Crie novos pedidos diretos. Selecione o vendedor e crie um novo pedido direto.</p>
        </div>

        <!-- SEÇÃO: Vendedores -->
        <div class="vendedores-section margin-top-20" style="flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;">
          <div class="vendedores-header" style="flex-shrink: 0;">
            <div>
              <p class="section-title poppins-semibold">Vendedores participantes</p>
              <p class="section-subtitle poppins-regular">
                {{ vendedoresSelecionados.length }} de {{ vendedoresFiltrados.length }} selecionado(s)
              </p>
            </div>

            <button class="btn-sel-todos poppins-medium" @click="toggleSelecionarTodos">
              {{ todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos' }}
            </button>
          </div>

          <div class="search-box" style="flex-shrink: 0;">
            <span class="material-symbols-outlined search-icon">search</span>
            <input
              v-model="busca"
              class="search-input poppins-regular"
              placeholder="Buscar por nome, empresa, CNPJ..."
            />
          </div>

          <!-- Loading -->
          <div v-if="loadingVendedores" class="loading-vendedores poppins-regular">
            Carregando vendedores...
          </div>

          <!-- Lista -->
          <div v-else class="vendedores-list">
            <div
              v-for="vendedor in vendedoresPaginados"
              :key="vendedor.id_vendedor"
              class="vendedor-card"
              :class="{ selecionado: vendedoresSelecionados.includes(vendedor.id_vendedor), desabilitado: (vendedoresSelecionados.length>0 && vendedoresSelecionados[0] !== vendedor.id_vendedor) }"
              @click="toggleVendedor(vendedor.id_vendedor)"
            >
              <div class="check-circle" :class="{ checked: vendedoresSelecionados.includes(vendedor.id_vendedor) }">
                <span v-if="vendedoresSelecionados.includes(vendedor.id_vendedor)" class="material-symbols-outlined check-icon">check</span>
              </div>

              <div class="vendedor-info">
                <div class="vendedor-top">
                  <span class="vendedor-nome poppins-medium">{{ vendedor.nome }}</span>
                  <span class="vendedor-empresa poppins-medium">{{ vendedor.nome_empresa }}</span>
                </div>
                <div class="vendedor-bottom">
                  <span class="vendedor-cnpj poppins-regular">CNPJ: {{ formatarCNPJ(vendedor.cnpj) }}</span>
                  <span v-if="vendedor.cidade" class="vendedor-cidade poppins-regular">{{ vendedor.cidade }}{{ vendedor.estado ? ` / ${vendedor.estado}` : '' }}</span>
                </div>
              </div>

              <div class="vendedor-taxa">
                <span class="taxa-valor poppins-semibold">{{ vendedor.taxa_resposta ?? 0 }}%</span>
                <span class="taxa-label poppins-regular">resposta</span>
              </div>
            </div>

            <div v-if="vendedoresFiltrados.length === 0" class="sem-vendedores poppins-regular">
              Nenhum vendedor encontrado.
            </div>
          </div>

          <!-- Paginação -->
          <div v-if="totalPaginas > 1" class="paginacao" style="flex-shrink: 0;">
            <button class="btn-pag" :disabled="paginaAtual === 1" @click="paginaAtual--">‹</button>
            <span class="pag-info poppins-regular">{{ paginaAtual }} / {{ totalPaginas }}</span>
            <button class="btn-pag" :disabled="paginaAtual === totalPaginas" @click="paginaAtual++">›</button>
          </div>
        </div>

        <div class="form-actions-row margin-top-30" style="flex-shrink: 0;">
          <button
            @click="limparTudo"
            class="action-btn btn-outline-gray poppins-medium full-w height-50"
            :disabled="loading"
          >
            Limpar tudo
          </button>

          <button
            @click="cadastrarCotacao"
            class="action-btn btn-primary poppins-medium full-w height-50"
            :disabled="loading || vendedoresSelecionados.length === 0"
          >
            <span class="spinner spinner-button" v-if="loading"></span>
            <span v-else>Criar pedido direto</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Calendar from 'primevue/calendar'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
const POR_PAGINA = 10

export default defineComponent({
  name: 'RegistrarCotacaoMobile',
  
  components: {
    Calendar,
  },

  data() {
    return {
      loading: false,
      loadingVendedores: false,
      auth: null as any,
      cotacao: {
        nome_cotacao: null as string | null
      },
      // Tipagem alterada para Date pois o PrimeVue retorna objetos Date
      inicioCotacaoDate: null as Date | null,
      fimCotacaoDate: null as Date | null,

      // Flag itens não respondidos
      adicionarItensNaoRespondidos: false,

      // Vendedores
      vendedores: [] as any[],
      vendedoresSelecionados: [] as number[],
      busca: '',
      paginaAtual: 1
    }
  },

  computed: {
    vendedoresFiltrados (): any[] {
      const termo = this.busca.toLowerCase().trim()
      if (!termo) return this.vendedores
      return this.vendedores.filter((v: any) =>
        (v.nome         || '').toLowerCase().includes(termo) ||
        (v.nome_empresa || '').toLowerCase().includes(termo) ||
        (v.cnpj         || '').replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
        (v.email        || '').toLowerCase().includes(termo) ||
        (v.cidade       || '').toLowerCase().includes(termo)
      )
    },

    totalPaginas (): number {
      return Math.max(1, Math.ceil(this.vendedoresFiltrados.length / POR_PAGINA))
    },

    vendedoresPaginados (): any[] {
      const inicio = (this.paginaAtual - 1) * POR_PAGINA
      return this.vendedoresFiltrados.slice(inicio, inicio + POR_PAGINA)
    },

    todosSelecionados (): boolean {
      if (this.vendedoresFiltrados.length === 0) return false
      return this.vendedoresFiltrados.every((v: any) => this.vendedoresSelecionados.includes(v.id_vendedor))
    }
  },

  watch: {
    busca () {
      this.paginaAtual = 1
    }
  },

  methods: {
    limparTudo() {
      this.cotacao.nome_cotacao = null
      this.inicioCotacaoDate = null
      this.fimCotacaoDate = null
      this.adicionarItensNaoRespondidos = false
      this.vendedoresSelecionados = []
      this.busca = ''
      this.paginaAtual = 1
    },

    formatarCNPJ (cnpj: string): string {
      if (!cnpj) return '—'
      const s = cnpj.replace(/\D/g, '')
      if (s.length !== 14) return cnpj
      return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    },

    toggleVendedor (id: number) {
      const idx = this.vendedoresSelecionados.indexOf(id)
      if (idx === -1) {
        if(!this.vendedoresSelecionados.length>0){
          this.vendedoresSelecionados.push(id)
        }
      } else {
        this.vendedoresSelecionados.splice(idx, 1)
      }
    },

    async carregarVendedores () {
      this.loadingVendedores = true
      try {
        const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.id_loja}`)
        this.vendedores = res.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingVendedores = false
      }
    },

    async cadastrarCotacao() {
      if (this.vendedoresSelecionados.length === 0) {
        this.$toast.info('Selecione ao menos um vendedor para criar o pedido direto');

        return
      }

      
      try {
        this.loading = true

        const payload = {
          id_vendedor: this.vendedoresSelecionados[0]
        }


        await api.post(
          `/mvpu/cotacao/criarPedidoDireto/${this.auth.id_loja}`,
          payload
        )

        if (this.$toast) {
          this.$toast.success('Novo pedido direto cadastrado com sucesso');
        }
        
        this.limparTudo()
        this.$router.back()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    this.auth = useAuthStore()
    this.carregarVendedores()
  }
})
</script>

<style scoped>

/* === CONTAINER & ESTRUTURA BASE (CORES FIXAS DARK) === */
.console-page {
  --background: #FFF !important;
  background-color: #FFF !important;
  height: calc(100vh - 220px);
}

.console-content {
  --background: #FFF !important;
  background-color: #FFF !important;
  color: #000;
  height: calc(100vh - 220px);
}

.form-container {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
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

/* === FORMULÁRIOS & CAMPOS MOBILE === */
.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 13px;
  color: #555 !important;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  background-color: #f0f0f0 !important;
  border: 1px solid rgb(177, 177, 177) !important;
  color: #000 !important;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  outline: none;
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #FF8049 !important;
}

@media(max-width: 576px){
    .calendar-section{
        display: flex;
        flex-direction: column;
    }
}

/* Forçar cor do placeholder no padrão dark */
.form-input::placeholder {
  color: #474747 !important;
}

.input-date {
  color: #525252 !important;
}

.input-date-wrapper {
  position: relative;
  width: 100%;
}

/* === PRIME VUE OVERRIDES === */
.w-full {
  width: 100%;
}

.prime-calendar {
  width: 100%;
}
:deep(.prime-calendar){
  background-color: #FFF !important;
}

/* Evitar que o PrimeVue crie bordas duplas já que aplicamos o form-input direto no inputClass */
:deep(.p-calendar) {
  width: 100%;
}

/* === BOTÕES E AÇÕES === */
.form-actions-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.action-btn {
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #FF8049 !important;
  color: #FFF !important;
}

.btn-primary:active {
  background-color: #ce673b !important;
}

.btn-outline-gray {
  background-color: rgb(88, 88, 88) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.btn-outline-gray:active {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

.full-w {
  width: 100%;
}

.height-50 {
  height: 50px;
}

.spinner-button {
  width: 24px;
  height: 24px;
  --color: #000 !important;
}

/* === UTILS === */
.margin-top-20 { margin-top: 20px; }
.margin-top-30 { margin-top: 30px; }

/* === SWITCH === */
.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.switch-track {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background-color: #ccc;
  position: relative;
  transition: background-color 0.25s;
  flex-shrink: 0;
}

.switch-track.active {
  background-color: #FF8049;
}

.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.25s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.switch-thumb.active {
  left: 23px;
}

.switch-label {
  font-size: 14px;
  color: #444 !important;
  line-height: 1.4;
}

/* === VENDEDORES SECTION === */
.vendedores-section {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.vendedores-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  color: #000 !important;
  margin: 0;
}

.section-subtitle {
  font-size: 12px;
  color: #888 !important;
  margin: 2px 0 0;
}

.btn-sel-todos {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #FF8049;
  color: #FF8049 !important;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-sel-todos:active {
  background: #FF8049;
  color: #fff !important;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  background-color: #FFF;
  border: 1px solid rgb(177, 177, 177);
  border-radius: 10px;
  padding: 0 12px;
  height: 46px;
  margin-bottom: 12px;
}

.search-icon {
  color: #888;
  flex-shrink: 0;
  margin-right: 8px;
  font-size: 18px;
}

.search-input {
  border: none;
  background: #FFF;
  outline: none;
  font-size: 14px;
  color: #000 !important;
  width: 100%;
  height: 100%;
}

.search-input::placeholder {
  color: #888 !important;
}

/* Lista */
.vendedores-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.vendedor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.vendedor-card.selecionado {
  border-color: #FF8049;
  background: #fff3ee;
}

.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ddd;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s;
}

.check-circle.checked {
  border-color: #FF8049;
  background: #FF8049;
}

.check-icon {
  font-size: 14px;
  color: #fff !important;
}

.vendedor-info {
  flex: 1;
  min-width: 0;
}

.vendedor-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.vendedor-nome {
  font-size: 14px;
  color: #000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-empresa {
  font-size: 12px;
  color: #FF8049 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 3px;
  flex-wrap: wrap;
}

.vendedor-cnpj {
  font-size: 11px;
  color: #777 !important;
}

.vendedor-cidade {
  font-size: 11px;
  color: #aaa !important;
}

.vendedor-taxa {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.taxa-valor {
  font-size: 14px;
  color: #333 !important;
  line-height: 1;
}

.taxa-label {
  font-size: 9px;
  color: #aaa !important;
  margin-top: 2px;
}

.loading-vendedores,
.sem-vendedores {
  text-align: center;
  color: #aaa !important;
  font-size: 14px;
  padding: 24px 0;
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

/* === REGRAS ESTILIZADAS DO HEADER MOBILE === */
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

/* Força o wrapper do calendário e o input interno do PrimeVue a ocuparem 100% da largura */
:deep(.p-calendar),
:deep(.p-datepicker) { /* .p-datepicker caso esteja usando PrimeVue v4 */
  width: 100% !important;
  display: flex !important;
}

:deep(.p-calendar .p-inputtext),
:deep(.p-datepicker .p-inputtext) {
  width: 100% !important;
  flex: 1 1 auto !important;
}

.desabilitado{
  background: #eee;
  cursor: default;
}
</style>