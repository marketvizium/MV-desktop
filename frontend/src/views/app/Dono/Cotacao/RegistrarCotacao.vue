<template>
  <div class="totalPage">
    <TitileSubtitle
      title="Registrar Cotação"
      subtitle="Crie uma nova cotação informando nome e período de validade."
      style="flex-shrink: 0;"
    />

    <!-- LINHA 1: Nome -->
    <div style="width: 100%; display: flex; margin-top: 20px; flex-shrink: 0;">
      <div style="width: 100%;">
        <inputDesktop
          maxlength="27"
          placeholder="Nome da cotação"
          v-model="cotacao.nome_cotacao"
        />
      </div>
    </div>

    <!-- LINHA 2: Datas -->
    <div style="width: 100%; display: flex; margin-top: 20px; flex-shrink: 0;">
      <div style="width: 50%; padding-right: 5px;">
        <Calendar
          v-model="inicioCotacaoDate"
          showIcon
          showTime
          hourFormat="24"
          dateFormat="dd/mm/yy"
          placeholder="Início da cotação"
          class="calendar-custom w-full"
        />
      </div>
      <div style="width: 50%; padding-left: 5px;">
        <Calendar
          v-model="fimCotacaoDate"
          showIcon
          showTime
          hourFormat="24"
          dateFormat="dd/mm/yy"
          placeholder="Final da cotação"
          class="calendar-custom w-full"
          panelClass="calendar-right"
        />
      </div>
    </div>

    <!-- LINHA 3: Observação -->
    <div style="width: 100%; margin-top: 20px; flex-shrink: 0;">
      <div class="obs-header">
        <label class="obs-label">Observação (opcional)</label>
        <span class="obs-contador" :class="{ limite: (cotacao.observacao || '').length >= 255 }">
          {{ (cotacao.observacao || '').length }}/255
        </span>
      </div>
      <textarea
        v-model="cotacao.observacao"
        maxlength="255"
        rows="2"
        class="obs-textarea"
        placeholder="Deixe uma observação para os vendedores sobre esta cotação..."
      />
    </div>

    <!-- LINHA 4: Condição de pagamento (boletos) -->
    <div style="width: 100%; margin-top: 20px; flex-shrink: 0;">
      <label class="obs-label" style="margin-bottom: 8px; display: block;">Condição de pagamento (opcional)</label>
      <button type="button" class="condicao-btn" @click="abrirModalBoletos">
        <div class="condicao-btn-info">
          <span class="material-symbols-outlined condicao-btn-icon">receipt_long</span>
          <span class="condicao-btn-texto" :class="{ vazio: !cotacao.prazo_boleto }">
            {{ resumoCondicaoPagamento }}
          </span>
        </div>
        <span class="material-symbols-outlined condicao-btn-seta">chevron_right</span>
      </button>
    </div>

    <!-- MODAL: Condição de pagamento -->
    <transition name="fade">
      <div v-if="modalBoletoAberto" class="boleto-modal-overlay" @click.self="fecharModalBoletos">
        <div class="boleto-modal">
          <div class="boleto-modal-header">
            <h3>Condição de pagamento</h3>
            <button type="button" class="boleto-modal-close" @click="fecharModalBoletos">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="boleto-modal-body">
            <!-- Passo 1: quantidade de boletos -->
            <p class="boleto-step-title">1. Quantos boletos?</p>
            <div class="qtd-boletos-group">
              <button
                v-for="qtd in [1, 2, 3]"
                :key="qtd"
                type="button"
                class="qtd-boleto-btn"
                :class="{ active: qtdBoletosTemp === qtd }"
                @click="selecionarQtdBoletos(qtd)"
              >
                {{ qtd }} {{ qtd === 1 ? 'boleto' : 'boletos' }}
              </button>
            </div>

            <!-- Passo 2: prazo (combinação já pronta) -->
            <div v-if="qtdBoletosTemp">
              <p class="boleto-step-title">2. Selecione o prazo</p>
              <div class="prazo-radio-list">
                <div
                  v-for="opcao in opcoesPrazoAtual"
                  :key="opcao"
                  class="prazo-radio-item"
                  @click="selecionarPrazo(opcao)"
                >
                  <span>{{ opcao }} dias</span>
                  <span class="radio-circle" :class="{ checked: prazoSelecionadoTemp === opcao }" />
                </div>
              </div>
            </div>
          </div>

          <div class="boleto-modal-footer">
            <p class="boleto-resumo">{{ resumoModal }}</p>
            <div class="boleto-modal-actions">
              <button type="button" class="boleto-btn-cancelar" @click="fecharModalBoletos">
                Cancelar
              </button>
              <button
                type="button"
                class="boleto-btn-confirmar"
                :disabled="!qtdBoletosTemp || !prazoSelecionadoTemp"
                @click="confirmarCondicaoPagamento"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="switch-row" style="margin-top: 24px; flex-shrink: 0;">
      <div class="switch-wrapper" @click="adicionarItensNaoRespondidos = !adicionarItensNaoRespondidos">
        <div class="switch-track" :class="{ active: adicionarItensNaoRespondidos }">
          <div class="switch-thumb" :class="{ active: adicionarItensNaoRespondidos }" />
        </div>
        <span class="switch-label">
          Adicionar produtos não respondido da cotação anteror
        </span>
      </div>
    </div>

    <!-- SEÇÃO: Vendedores -->
    <div class="vendedores-section" style="margin-top: 28px; flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;">

      <div class="vendedores-header">
        <div>
          <p class="section-title">Vendedores participantes</p>
          <p class="section-subtitle">
            {{ vendedoresSelecionados.length }} de {{ vendedoresFiltrados.length }} selecionado(s)
          </p>
        </div>

        <div class="vendedores-header-actions">
          <!-- Search -->
          <div class="search-box">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="busca"
              class="search-input"
              placeholder="Buscar por nome, empresa, CNPJ..."
            />
          </div>

          <!-- Selecionar / Deselecionar todos -->
          <button
            class="btn-sel-todos"
            @click="toggleSelecionarTodos"
          >
            {{ todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos' }}
          </button>
        </div>
      </div>

      <!-- Loading vendedores -->
      <div v-if="loadingVendedores" class="loading-vendedores">
        <span>Carregando vendedores...</span>
      </div>

      <!-- Lista paginada -->
      <div v-else class="vendedores-list">
        <div
          v-for="vendedor in vendedoresPaginados"
          :key="vendedor.id_vendedor"
          class="vendedor-card"
          :class="{ selecionado: vendedoresSelecionados.includes(vendedor.id_vendedor) }"
          @click="toggleVendedor(vendedor.id_vendedor)"
        >
          <!-- Check -->
          <div class="check-circle" :class="{ checked: vendedoresSelecionados.includes(vendedor.id_vendedor) }">
            <svg v-if="vendedoresSelecionados.includes(vendedor.id_vendedor)" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <!-- Info -->
          <div class="vendedor-info">
            <div class="vendedor-top">
              <span class="vendedor-nome">{{ vendedor.nome }}</span>
              <span class="vendedor-empresa">{{ vendedor.nome_empresa }}</span>
            </div>
            <div class="vendedor-bottom">
              <span class="vendedor-cnpj">CNPJ: {{ formatarCNPJ(vendedor.cnpj) }}</span>
              <span v-if="vendedor.cidade" class="vendedor-cidade">{{ vendedor.cidade }}{{ vendedor.estado ? ` / ${vendedor.estado}` : '' }}</span>
            </div>
          </div>

          <!-- Taxa resposta -->
          <div class="vendedor-taxa" :title="`Taxa de resposta: ${vendedor.taxa_resposta ?? 0}%`">
            <span class="taxa-valor">{{ vendedor.taxa_resposta ?? 0 }}%</span>
            <span class="taxa-label">resposta</span>
          </div>
        </div>

        <!-- Sem resultados -->
        <div v-if="vendedoresFiltrados.length === 0" class="sem-vendedores">
          Nenhum vendedor encontrado.
        </div>
      </div>

      <!-- Paginação -->
      <div v-if="totalPaginas > 1" class="paginacao">
        <button class="btn-pag" :disabled="paginaAtual === 1" @click="paginaAtual--">‹</button>
        <span class="pag-info">{{ paginaAtual }} / {{ totalPaginas }}</span>
        <button class="btn-pag" :disabled="paginaAtual === totalPaginas" @click="paginaAtual++">›</button>
      </div>
    </div>

    <!-- AÇÕES -->
    <div style="display: flex; margin-top: 20px; padding-bottom: 20px; flex-shrink: 0;">
      <button
        @click="limparTudo"
        style="width: 100%; margin-right: 8px; background-color: #888; color: #FFF; border-radius: 5px; border: none; height: 50px; cursor: pointer;"
      >
        Limpar tudo
      </button>

      <Button
        type="button"
        label="Cadastrar cotação"
        class="poppins-regular btn-sbmt"
        :loading="loading"
        :disabled="loading || vendedoresSelecionados.length === 0"
        @click="cadastrarCotacao"
      />
    </div>
  </div>
</template>

<script>
import TitileSubtitle from '@/components/TitileSubtitle.vue'
import inputDesktop from '@/components/inputDesktop.vue'
import { Button } from 'primevue'
import Calendar from 'primevue/calendar'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import { mapState } from 'pinia'

const POR_PAGINA = 10

export default {
  name: 'RegistrarCotacao',

  components: {
    TitileSubtitle,
    inputDesktop,
    Button,
    Calendar
  },

  data () {
    return {
      loading: false,
      loadingVendedores: false,
      auth: null,

      cotacao: {
        nome_cotacao: null,
        observacao: '',
        qtd_boletos: null,
        prazo_boleto: null
      },

      inicioCotacaoDate: null,
      fimCotacaoDate: null,

      // Modal condição de pagamento (boletos)
      modalBoletoAberto: false,
      qtdBoletosTemp: null,
      prazoSelecionadoTemp: null,

      // Flag itens não respondidos
      adicionarItensNaoRespondidos: false,

      // Vendedores
      vendedores: [],
      vendedoresSelecionados: [],
      busca: '',
      paginaAtual: 1
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user', 'id_loja']),

    vendedoresFiltrados () {
      const termo = this.busca.toLowerCase().trim()
      if (!termo) return this.vendedores
      return this.vendedores.filter(v =>
        (v.nome         || '').toLowerCase().includes(termo) ||
        (v.nome_empresa || '').toLowerCase().includes(termo) ||
        (v.cnpj         || '').replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
        (v.email        || '').toLowerCase().includes(termo) ||
        (v.cidade       || '').toLowerCase().includes(termo)
      )
    },

    totalPaginas () {
      return Math.max(1, Math.ceil(this.vendedoresFiltrados.length / POR_PAGINA))
    },

    vendedoresPaginados () {
      const inicio = (this.paginaAtual - 1) * POR_PAGINA
      return this.vendedoresFiltrados.slice(inicio, inicio + POR_PAGINA)
    },

    todosSelecionados () {
      if (this.vendedoresFiltrados.length === 0) return false
      return this.vendedoresFiltrados.every(v => this.vendedoresSelecionados.includes(v.id_vendedor))
    },

    // Bases de prazo (múltiplos de 7) usadas para montar as combinações, até ~80 dias
    basesPrazo () {
      const bases = []
      for (let dias = 7; dias <= 70; dias += 7) {
        bases.push(dias)
      }
      return bases
    },

    // Combinações prontas de prazo para a quantidade de boletos escolhida no modal
    // Ex.: 1 boleto → ['7', '14', '21', ...] | 2 boletos → ['7/14', '14/21', '21/28', ...]
    opcoesPrazoAtual () {
      if (!this.qtdBoletosTemp) return []
      return this.basesPrazo.map(base => {
        const combinacao = []
        for (let i = 0; i < this.qtdBoletosTemp; i++) {
          combinacao.push(base + (i * 7))
        }
        return combinacao.join('/')
      })
    },

    // Texto exibido no botão da tela principal
    resumoCondicaoPagamento () {
      if (!this.cotacao.qtd_boletos || !this.cotacao.prazo_boleto) {
        return 'Selecionar condição de pagamento'
      }
      const qtd = this.cotacao.qtd_boletos
      const label = qtd === 1 ? 'boleto' : 'boletos'
      return `${qtd} ${label} • ${this.cotacao.prazo_boleto.split('/').join('/')} dias`
    },

    // Texto exibido no rodapé do modal enquanto o usuário seleciona
    resumoModal () {
      if (!this.qtdBoletosTemp) {
        return 'Selecione a quantidade de boletos para começar.'
      }
      if (!this.prazoSelecionadoTemp) {
        return 'Selecione o prazo desejado.'
      }
      const qtd = this.qtdBoletosTemp
      const label = qtd === 1 ? 'boleto' : 'boletos'
      const dias = this.prazoSelecionadoTemp.split('/').join(' e ')
      return `Condição de pagamento: ${qtd} ${label} — ${dias} dias`
    }
  },

  watch: {
    busca () {
      this.paginaAtual = 1
    }
  },

  methods: {
    formatarCNPJ (cnpj) {
      if (!cnpj) return '—'
      const s = cnpj.replace(/\D/g, '')
      if (s.length !== 14) return cnpj
      return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    },

    toggleVendedor (id) {
      const idx = this.vendedoresSelecionados.indexOf(id)
      if (idx === -1) {
        this.vendedoresSelecionados.push(id)
      } else {
        this.vendedoresSelecionados.splice(idx, 1)
      }
    },

    toggleSelecionarTodos () {
      if (this.todosSelecionados) {
        // Remove todos os filtrados da seleção
        const idsFiltrados = this.vendedoresFiltrados.map(v => v.id_vendedor)
        this.vendedoresSelecionados = this.vendedoresSelecionados.filter(id => !idsFiltrados.includes(id))
      } else {
        // Adiciona todos os filtrados
        this.vendedoresFiltrados.forEach(v => {
          if (!this.vendedoresSelecionados.includes(v.id_vendedor)) {
            this.vendedoresSelecionados.push(v.id_vendedor)
          }
        })
      }
    },

    abrirModalBoletos () {
      // Pré-carrega o modal com a condição já salva, se houver
      this.qtdBoletosTemp        = this.cotacao.qtd_boletos || null
      this.prazoSelecionadoTemp  = this.cotacao.prazo_boleto || null
      this.modalBoletoAberto = true
    },

    fecharModalBoletos () {
      this.modalBoletoAberto = false
    },

    selecionarQtdBoletos (qtd) {
      this.qtdBoletosTemp = qtd
      // Ao trocar a quantidade, a combinação anterior não é mais válida
      this.prazoSelecionadoTemp = null
    },

    selecionarPrazo (opcao) {
      this.prazoSelecionadoTemp = opcao
    },

    confirmarCondicaoPagamento () {
      if (!this.qtdBoletosTemp || !this.prazoSelecionadoTemp) return

      this.cotacao.qtd_boletos  = this.qtdBoletosTemp
      this.cotacao.prazo_boleto = this.prazoSelecionadoTemp

      this.modalBoletoAberto = false
    },

    limparTudo () {
      this.cotacao.nome_cotacao         = null
      this.cotacao.observacao           = ''
      this.cotacao.qtd_boletos          = null
      this.cotacao.prazo_boleto         = null
      this.inicioCotacaoDate            = null
      this.fimCotacaoDate               = null
      this.adicionarItensNaoRespondidos = false
      this.vendedoresSelecionados       = []
      this.busca                        = ''
      this.paginaAtual                  = 1
      this.qtdBoletosTemp               = null
      this.prazoSelecionadoTemp         = null
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

    async cadastrarCotacao () {
      this.loading = true

      try {
        if (!this.cotacao.nome_cotacao || !this.inicioCotacaoDate || !this.fimCotacaoDate) {
          this.$toast.info('Dados obrigatórios não preenchidos')
          return
        }

        if (this.vendedoresSelecionados.length === 0) {
          this.$toast.info('Selecione ao menos um vendedor para criar a cotação.')
          return
        }

        const agora = new Date()

        if (this.inicioCotacaoDate < agora) {
          this.$toast.info('A data inicial precisa ser igual ou maior que a data atual.')
          this.inicioCotacaoDate = null
          this.fimCotacaoDate    = null
          return
        }

        if (this.inicioCotacaoDate > this.fimCotacaoDate) {
          this.$toast.info('A data final precisa ser maior que a data inicial.')
          this.fimCotacaoDate = null
          return
        }

        const payload = {
          nome_cotacao:                this.cotacao.nome_cotacao,
          observacao:                  this.cotacao.observacao || null,
          qtd_boletos:                 this.cotacao.qtd_boletos || null,
          prazo_boleto:                this.cotacao.prazo_boleto || null,
          inicio_cotacao:              new Date(this.inicioCotacaoDate).getTime(),
          final_cotacao:               new Date(this.fimCotacaoDate).getTime(),
          adicionarItensNaoRespondidos: this.adicionarItensNaoRespondidos,
          arrayVendedores:             this.vendedoresSelecionados
        }

        await api.post(
          `/mvpu/cotacao/criarCotacao/${this.auth.id_loja}`,
          payload
        )

        this.$toast.success('Cotação cadastrada com sucesso!')
        this.limparTudo()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted () {
    this.auth = useAuthStore()
    this.carregarVendedores()
  }
}
</script>

<style scoped>
.totalPage {
  width: 100%;
  min-height: 800px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ===== SWITCH ===== */
.switch-row {
  display: flex;
  align-items: center;
}

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
  color: #444;
  font-family: 'Poppins', sans-serif;
  line-height: 1.4;
}

/* ===== VENDEDORES SECTION ===== */
.vendedores-section {
  border-top: 1px solid #eee;
  padding-top: 4px;
}

.vendedores-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.section-subtitle {
  font-size: 12px;
  color: #999;
  margin: 2px 0 0;
  font-family: 'Poppins', sans-serif;
}

.vendedores-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 12px;
  height: 38px;
  min-width: 220px;
}

.search-icon {
  color: #aaa;
  flex-shrink: 0;
  margin-right: 8px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  color: #333;
  width: 100%;
}

.search-input::placeholder {
  color: #bbb;
}

/* Botão selecionar todos */
.btn-sel-todos {
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid #FF8049;
  color: #FF8049;
  background: transparent;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.btn-sel-todos:hover {
  background: #FF8049;
  color: #fff;
}

/* Lista */
.vendedores-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 2px;
}

/* Card vendedor */
.vendedor-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  user-select: none;
}

.vendedor-card:hover {
  border-color: #FF8049;
  background: #fff8f5;
}

.vendedor-card.selecionado {
  border-color: #FF8049;
  background: #fff3ee;
}

/* Check circle */
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

/* Info */
.vendedor-info {
  flex: 1;
  min-width: 0;
}

.vendedor-top {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.vendedor-nome {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  font-family: 'Poppins', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-empresa {
  font-size: 13px;
  font-weight: 600;
  color: #FF8049;
  font-family: 'Poppins', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-bottom {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 3px;
}

.vendedor-cnpj {
  font-size: 12px;
  color: #777;
  font-family: 'Poppins', sans-serif;
}

.vendedor-cidade {
  font-size: 12px;
  color: #aaa;
  font-family: 'Poppins', sans-serif;
}

/* Taxa */
.vendedor-taxa {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.taxa-valor {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  font-family: 'Poppins', sans-serif;
  line-height: 1;
}

.taxa-label {
  font-size: 10px;
  color: #aaa;
  font-family: 'Poppins', sans-serif;
  margin-top: 2px;
}

/* Loading / sem resultados */
.loading-vendedores,
.sem-vendedores {
  text-align: center;
  color: #aaa;
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  padding: 32px 0;
}

/* Paginação */
.paginacao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 0 4px;
  flex-shrink: 0;
}

.btn-pag {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, color 0.2s;
  line-height: 1;
}

.btn-pag:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-pag:not(:disabled):hover {
  border-color: #FF8049;
  color: #FF8049;
}

.pag-info {
  font-size: 13px;
  color: #666;
  font-family: 'Poppins', sans-serif;
  min-width: 50px;
  text-align: center;
}

/* ===== OBSERVAÇÃO ===== */
.obs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.obs-label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  font-family: 'Poppins', sans-serif;
}

.obs-contador {
  font-size: 12px;
  color: #aaa;
  font-family: 'Poppins', sans-serif;
}

.obs-contador.limite {
  color: #e74c3c;
  font-weight: 600;
}

.obs-textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #333;
  resize: vertical;
  min-height: 44px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.obs-textarea:focus {
  border-color: #FF8049;
}

.obs-textarea::placeholder {
  color: #777;
}

/* ===== CONDIÇÃO DE PAGAMENTO (botão) ===== */
.condicao-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #fff;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.condicao-btn:hover {
  border-color: #FF8049;
  background: #fff8f5;
}

.condicao-btn-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.condicao-btn-icon {
  color: #FF8049;
  font-size: 20px;
}

.condicao-btn-texto {
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  color: #333;
  font-weight: 600;
}

.condicao-btn-texto.vazio {
  color: #777;
  font-weight: 400;
}

.condicao-btn-seta {
  color: #bbb;
  font-size: 20px;
}

/* ===== MODAL BOLETOS ===== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.boleto-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.boleto-modal {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.boleto-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.boleto-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  color: #222;
}

.boleto-modal-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  padding: 4px;
}

.boleto-modal-close:hover {
  color: #555;
}

.boleto-modal-body {
  padding: 18px 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.boleto-step-title {
  font-size: 16px;
  font-weight: 600;
  color: #444;
  font-family: 'Poppins', sans-serif;
  margin: 0 0 10px;
}

.boleto-modal-body > div:not(:last-child) {
  margin-bottom: 22px;
}

/* Passo 1: quantidade de boletos */
.qtd-boletos-group {
  display: flex;
  gap: 8px;
}

.qtd-boleto-btn {
  flex: 1;
  padding: 10px 8px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.qtd-boleto-btn:hover {
  border-color: #FF8049;
}

.qtd-boleto-btn.active {
  border-color: #FF8049;
  background: #FF8049;
  color: #fff;
}

/* Passo 2: lista de rádio de prazos */
.prazo-radio-list {
  border: 1px solid #eee;
  border-radius: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.prazo-radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #333;
  transition: background 0.15s;
}

.prazo-radio-item:last-child {
  border-bottom: none;
}

.prazo-radio-item:hover {
  background: #fff8f5;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ccc;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.2s;
}

.radio-circle.checked {
  border-color: #FF8049;
}

.radio-circle.checked::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FF8049;
}

.radio-circle.disabled {
  opacity: 0.6;
}

.boleto-modal-footer {
  padding: 14px 20px 18px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.boleto-resumo {
  font-size: 12.5px;
  color: #000;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  margin: 0 0 12px;
  text-align: center;
}

.boleto-modal-actions {
  display: flex;
  gap: 10px;
}

.boleto-btn-cancelar {
  flex: 1;
  height: 42px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  color: #666;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.boleto-btn-cancelar:hover {
  border-color: #999;
}

.boleto-btn-confirmar {
  flex: 2;
  height: 42px;
  border-radius: 6px;
  border: none;
  background: #FF8049;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.boleto-btn-confirmar:hover:not(:disabled) {
  background: #ce673b;
}

.boleto-btn-confirmar:disabled {
  background: #ffb894;
  cursor: not-allowed;
}

/* ===== BOTÃO PRIME ===== */
:deep(.btn-sbmt.p-button),
:deep(.btn-sbmt.p-button:hover),
:deep(.btn-sbmt.p-button:focus),
:deep(.btn-sbmt.p-button:active) {
  background-color: #FF8049 !important;
  color: #FFF !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  cursor: pointer;
  width: 100%;
  margin-left: 8px;
}

:deep(.btn-sbmt.p-button:hover) {
  background-color: #ce673b;
  transition: 0.5s;
}

:deep(.btn-sbmt.p-button:disabled) {
  background-color: #ffb894 !important;
  cursor: not-allowed;
}

/* ===== CALENDAR ===== */
:deep(.calendar-custom .p-inputtext) {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 50px;
  width: 100%;
  font-family: 'Poppins', sans-serif;
}

:deep(.calendar-custom .p-button) {
  background: transparent;
  border: none;
}

:deep(.calendar-custom),
:deep(.calendar-custom .p-inputtext),
:deep(.calendar-custom .p-datepicker-trigger) {
  width: 100% !important;
}

:deep(.calendar-custom .p-inputtext) {
  display: block;
}
</style>