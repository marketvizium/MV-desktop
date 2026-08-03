<template>
  <div class="dashboard-container">

    <!-- ════════════════════════════════════════════
         MODAL: Entendendo os Status de Cotação
    ════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modalStatusVisivel" class="modal-overlay" @click.self="fecharModal">
          <div class="modal-card" style="font-family: 'Poppins';">

            <!-- Cabeçalho -->
            <div class="modal-header">
              <div class="modal-header-icon">
                <span class="material-symbols-outlined">help</span>
              </div>
              <div>
                <h2 class="modal-title">Entendendo os Status de Cotação</h2>
                <p class="modal-subtitle">Saiba o que acontece em cada etapa do ciclo da cotação</p>
              </div>
              <button class="modal-close-btn" @click="fecharModal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Conteúdo: Cards de Status -->
            <div class="modal-body">

              <div class="status-card status-card--indisponivel">
                <div class="status-card-badge">
                  <span class="material-symbols-outlined">block</span>
                  Indisponível
                </div>
                <p class="status-card-desc">
                  Somente a <strong>loja</strong> tem acesso à cotação neste momento. Os vendedores ainda <strong>não conseguem visualizá-la</strong>. Este é o período reservado para a loja configurar e adicionar os produtos à cotação antes de disponibilizá-la ao mercado.
                </p>
              </div>

              <div class="status-card status-card--aberta">
                <div class="status-card-badge">
                  <span class="material-symbols-outlined">radio_button_unchecked</span>
                  Aberta
                </div>
                <p class="status-card-desc">
                  A cotação está <strong>disponível para os vendedores</strong>. Neste momento eles podem acessar os produtos solicitados e <strong>ofertar seus preços</strong>, competindo entre si para oferecer as melhores condições à loja.
                </p>
              </div>

              <div class="status-card status-card--fechada">
                <div class="status-card-badge">
                  <span class="material-symbols-outlined">lock</span>
                  Fechada
                </div>
                <p class="status-card-desc">
                  O prazo para oferta encerrou. Os vendedores <strong>não podem mais enviar preços</strong>. Agora a loja pode analisar todas as ofertas recebidas, comparar valores, cotar os mais baratos e até utilizar a <strong>ferramenta de seleção automática de preços</strong>.
                </p>
              </div>

              <div class="status-card status-card--finalizada">
                <div class="status-card-badge">
                  <span class="material-symbols-outlined">verified</span>
                  Finalizada
                </div>
                <p class="status-card-desc">
                  A loja <strong>concluiu a seleção</strong> e enviou os produtos para os vendedores contemplados. Cada vendedor recebe seu pedido e pode <strong>faturar e encaminhar</strong> para as empresas que representa.
                </p>
              </div>

            </div>

            <!-- Rodapé -->
            <div class="modal-footer">
              <button class="btn-nunca-mais" @click="fecharModalDefinitivamente">
                <span class="material-symbols-outlined">visibility_off</span>
                Não quero ver novamente
              </button>
              <button class="btn-entendi" @click="fecharModal">
                Entendi!
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ════════════════════════════════════════════
         HEADER
    ════════════════════════════════════════════ -->
    <header class="page-header">
      <div class="header-content">
        <h1>Painel de Cotações </h1>
        <p style="font-size: 16px;">Consulte suas cotações</p>
      </div>
      <div class="header-actions">
        <!-- Botão de Ajuda de Status -->
        <button class="btn-ajuda-status" @click="modalStatusVisivel = true">
          <span class="material-symbols-outlined">help_outline</span>
          Dúvidas sobre os status?
        </button>

        <span class="p-input-icon-left search-box">
          <span class="material-symbols-outlined position-search-icon">
          search
          </span>
          <InputText 
            v-model="filtros.busca" 
            placeholder="Pesquisar por nome..." 
            class="p-inputtext-sm custom-input" 
          />
        </span>
      </div>
    </header>

    <section class="filter-panel">
      <div class="filter-group">
        <label>Período Rápido</label>
        <div class="button-group">
          <Button 
            label="Hoje" 
            :class="['p-button-sm', { 'active-filter': filtroAtivo === 'hoje' }]" 
            @click="definirFiltroData('hoje')"
          />
          <Button 
            label="Esta Semana" 
            :class="['p-button-sm', { 'active-filter': filtroAtivo === 'semana' }]" 
            @click="definirFiltroData('semana')"
          />
          <Button 
            label="Este Mês" 
            :class="['p-button-sm', { 'active-filter': filtroAtivo === 'mes' }]" 
            @click="definirFiltroData('mes')"
          />
          <button
            class="p-button-sm-filter p-button-text" 
            :class="{ 'button-filter-disable': !filtroAtivo }"
            v-tooltip.top="'Limpar Filtros'"
            @click="limparFiltros"
            :disabled="!filtroAtivo"
          >
            <span class="material-symbols-outlined">
              filter_alt_off
            </span>
          </button>

        </div>
        
      </div>

      <div class="filter-group">
        <label>Intervalo Específico</label>
        <Calendar 
          v-model="filtros.datas" 
          selectionMode="range" 
          :manualInput="false" 
          placeholder="00/00/0000 - 00/00/0000"
          class="custom-calendar"
          dateFormat="dd/mm/yy"
          showIcon
        />
      </div>

      <div class="filter-group" v-if="user.nivel!=7">
        <label>Status da Cotação</label>
        <div class="toggle-group">
          <button 
            type="button"
            :class="['filter-btn-toggle', { 'active': filtroStatus === 'aberta' }]"
            @click="definirFiltroStatus('aberta')"
          >
            <span class="material-symbols-outlined">
              {{ filtroStatus === 'aberta' ? 'task_alt' : 'radio_button_unchecked' }}
            </span>
            Abertas
          </button>

          <button 
            type="button"
            :class="['filter-btn-toggle', { 'active': filtroStatus === 'fechada' }]"
            @click="definirFiltroStatus('fechada')"
          >
            <span class="material-symbols-outlined">
              {{ filtroStatus === 'fechada' ? 'lock' : 'lock_open' }}
            </span>
            Fechadas
          </button>

          <button 
            type="button"
            :class="['filter-btn-toggle', { 'active': filtroStatus === 'finalizada' }]"
            @click="definirFiltroStatus('finalizada')"
          >
            <span class="material-symbols-outlined">
              {{ filtroStatus === 'finalizada' ? 'verified' : 'new_releases' }}
            </span>
            Finalizadas
          </button>

          <button 
            type="button"
            :class="['filter-btn-toggle', { 'active': filtroStatus === 'indisponivel' }]"
            @click="definirFiltroStatus('indisponivel')"
          >
            <span class="material-symbols-outlined">
              {{ filtroStatus === 'indisponivel' ? 'block' : 'do_not_disturb_on' }}
            </span>
            Indisponíveis
          </button>
        </div>
      </div>
    </section>

    <main class="table-section">
      <DataTable 
        :value="cotacoesProcessadas" 
        :paginator="true" 
        :rows="15" 
        :rowHover="true"
        :rowClass="rowClass" @row-click="onRowClick"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords}"
        class="p-datatable-sm custom-table"
        :loading="loading"
        responsiveLayout="stack"
        dataKey="id_cotacao"
      >
        <Column field="nome_cotacao" header="NOME DA COTAÇÃO" sortable>
          <template #body="{ data }">
            <span class="font-medium text-dark">{{ data.nome_cotacao }}</span>
          </template>
        </Column>

        <Column field="status_cotacao" header="STATUS">
          <template #body="{ data }">
            <Tag 
              :value="getLabelStatus(data).toUpperCase()" 
              :severity="getStatusSeverity(data)"
              class="custom-tag"
              :class="'tag-' + getStatusKey(data)"
            />
          </template>
        </Column>

        <Column field="inicio_cotacao" header="DATA INICIAL" sortable>
          <template #body="{ data }">
            {{ formatarData(data.inicio_cotacao) }}
          </template>
        </Column>

        <Column field="final_cotacao" header="DATA FINAL">
          <template #body="{ data }">
            {{ formatarData(data.final_cotacao) }}
          </template>
        </Column>

        <Column header="AÇÕES" headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center">
          <template #body="{ data }">
            <Button 
              icon="pi pi-arrow-right" 
              :class="['p-button-rounded p-button-text action-btn', getStatusKey(data) === 'aberta' ? 'active-btn' : 'disabled-btn']"
              @click="irParaAdicionarProdutos(data)"
              v-tooltip.left="getStatusKey(data) === 'aberta' ? 'Gerenciar Cotação' : 'Apenas leitura'"
            />
          </template>
        </Column>
      </DataTable>
    </main>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

// PrimeVue Components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'
import { mapState } from 'pinia'

const LS_KEY_MODAL_STATUS = 'mvsgdb_modal_status_oculto'

export default {
  name: 'GerenciamentoCotacoesSaaS',
  components: {
    DataTable,
    Column,
    InputText,
    Button,
    Calendar,
    Tag
  },

  data() {
    return {
      cotacoes: [],
      loading: true,
      auth: null,
      filtroAtivo: null,
      filtros: {
        busca: '',
        datas: null
      },
      filtroStatus: null, // Pode ser 'aberta', 'fechada', 'finalizada', 'indisponivel' ou null
      modalStatusVisivel: false,
    }
  },


  computed: {
    ...mapState(useAuthStore, ['user', 'id_loja']),

    cotacoesFiltradas() {
      let lista = this.cotacoes

      // Filtro por Nome
      if (this.filtros.busca) {
        lista = lista.filter(c => 
          c.nome_cotacao.toLowerCase().includes(this.filtros.busca.toLowerCase())
        )
      }

      // Filtro por Data (Calendário)
      if (this.filtros.datas && this.filtros.datas[1]) {
        const [inicio, fim] = this.filtros.datas
        lista = lista.filter(c => {
          const dataCotacao = new Date(Number(c.inicio_cotacao))
          return dataCotacao >= inicio && dataCotacao <= fim
        })
      }

      return lista
    },

    cotacoesProcessadas() {
      let lista = [...this.cotacoes];

      // 1. Filtro por Nome (Busca)
      if (this.filtros.busca) {
        const termo = this.filtros.busca.toLowerCase();
        lista = lista.filter(c => c.nome_cotacao.toLowerCase().includes(termo));
      }

      // 2. Filtro por Status (usando status derivado)
      if (this.filtroStatus) {
        lista = lista.filter(c => this.getStatusKey(c) === this.filtroStatus);
      }

      // 3. Filtro por Período de Data
      if (this.filtros.datas && this.filtros.datas[0] && this.filtros.datas[1]) {
        const [inicio, fim] = this.filtros.datas;
        lista = lista.filter(c => {
          const dataCotacao = new Date(Number(c.inicio_cotacao));
          return dataCotacao >= inicio && dataCotacao <= fim;
        });
      }

      // 4. Ordenação (Mais recentes primeiro por padrão)
      lista.sort((a, b) => {
        return Number(b.inicio_cotacao) - Number(a.inicio_cotacao);
      });

      return lista;
    }
  },

  methods: {
    async buscarCotacoes() {
      this.loading = true
      try {
        const response = await api.get(`/mvpu/cotacao/consultarCotacao/${this.auth.id_loja}`)

        console.log(this.user.nivel)

        if(this.user.nivel!=7){
          this.cotacoes = response.data.data || []
        }else{
          const cotacoesFiltradas = []
  
  
          if(response.data){
            response.data.data.forEach((cotacao)=>{
              if(cotacao.status_cotacao == 'fechada'){
                  cotacoesFiltradas.push(cotacao)
              }
            })
          }

          this.cotacoes = cotacoesFiltradas || []
        }

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    },

    definirFiltroData(tipo) {
      this.filtroAtivo = tipo
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
      } else if (tipo === 'mes') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      }

      this.filtros.datas = [inicio, fim]
    },

    limparFiltros() {
      this.filtros.busca = '';
      this.filtros.datas = null;
      this.filtroAtivo = null;
      this.filtroStatus = null;
    },

    // ── Modal de Status ──────────────────────────────────────────
    fecharModal() {
      this.modalStatusVisivel = false;
    },

    fecharModalDefinitivamente() {
      localStorage.setItem(LS_KEY_MODAL_STATUS, 'true');
      this.modalStatusVisivel = false;
    },

    verificarExibirModal() {
      const oculto = localStorage.getItem(LS_KEY_MODAL_STATUS);
      if (!oculto) {
        this.modalStatusVisivel = true;
      }
    },

    // ── Status Derivado ──────────────────────────────────────────
    // - status_cotacao 'fechada'                                        → 'indisponivel'
    // - status_cotacao 'aberta'                                         → 'aberta'
    // - status_cotacao 'finalizada' + status_fechamento null|'pendente' → 'fechada'
    // - status_cotacao 'finalizada' + status_fechamento 'concluido'     → 'finalizada'
    getStatusKey(cotacao) {
      const s = cotacao.status_cotacao;
      const f = cotacao.status_fechamento;
      if (s === 'fechada') return 'indisponivel';
      if (s === 'aberta') return 'aberta';
      if (s === 'finalizada') {
        if (f === 'concluido') return 'finalizada';
        return 'fechada'; // null ou 'pendente'
      }
      return 'aberta';
    },

    getLabelStatus(cotacao) {
      const key = this.getStatusKey(cotacao);
      const labels = {
        aberta: 'Aberta',
        fechada: 'Fechada',
        finalizada: 'Finalizada',
        indisponivel: 'Indisponível'
      };
      return labels[key] || key;
    },

    getStatusSeverity(cotacao) {
      const key = this.getStatusKey(cotacao);
      switch (key) {
        case 'aberta':       return 'success'
        case 'fechada':      return 'warn'
        case 'finalizada':   return 'info'
        case 'indisponivel': return 'secondary'
        default:             return 'secondary'
      }
    },

    formatarData(timestamp) {
      if (!timestamp) return '-'
      return new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    irParaAdicionarProdutos(cotacao) {
      this.$router.push({
        name: 'consoleCotacao',
        query: {
          nome_cotacao: cotacao.nome_cotacao,
          id_cotacao: cotacao.id_cotacao,
          id_usuario: cotacao.id_usuario
        }
      })
    },

    rowClass(data) {
      return 'row-clickable';
    },

    onRowClick(event) {
      const cotacao = event.data;
      this.irParaAdicionarProdutos(cotacao);
    },

    toggleFiltroAbertas() {
      this.mostrarApenasAbertas = !this.mostrarApenasAbertas;
    },

    definirFiltroStatus(status) {
      this.filtroStatus = this.filtroStatus === status ? null : status;
    },
  },

  mounted() {
    this.auth = useAuthStore()
    this.buscarCotacoes()
    this.verificarExibirModal()
  }
}
</script>

<style scoped>
/* Importação da Fonte */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

.dashboard-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #334155;
}

/* ════════════════════════════════════════════
   MODAL
════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header do Modal */
.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-header-icon .material-symbols-outlined {
  color: #ffffff;
  font-size: 22px;
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.82rem;
  color: #64748b;
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
  transition: background 0.15s, color 0.15s;
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

/* Body do Modal */
.modal-body {
  padding: 1.4rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 65vh;
  overflow-y: auto;
}

/* Cards de Status */
.status-card {
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-card--indisponivel {
  background: #f8fafc;
  border-left-color: #94a3b8;
}

.status-card--aberta {
  background: #f0fdf4;
  border-left-color: #22c55e;
}

.status-card--fechada {
  background: #fff7f3;
  border-left-color: #ff8049;
}

.status-card--finalizada {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.status-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-card-badge .material-symbols-outlined {
  font-size: 18px;
}

.status-card--indisponivel .status-card-badge { color: #64748b; }
.status-card--aberta      .status-card-badge { color: #16a34a; }
.status-card--fechada     .status-card-badge { color: #ff8049; }
.status-card--finalizada  .status-card-badge { color: #2563eb; }

.status-card-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

/* Footer do Modal */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid #f1f5f9;
  gap: 0.75rem;
}

.btn-nunca-mais {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.btn-nunca-mais:hover {
  color: #64748b;
  background: #f8fafc;
}

.btn-nunca-mais .material-symbols-outlined {
  font-size: 17px;
}

.btn-entendi {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-entendi:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-entendi .material-symbols-outlined {
  font-size: 18px;
}

/* Animação de entrada/saída do modal */
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

/* ════════════════════════════════════════════
   BOTÃO DE AJUDA NO HEADER
════════════════════════════════════════════ */
.btn-ajuda-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff7f3;
  border: 1px solid #ffd4be;
  color: #ff8049;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-ajuda-status:hover {
  background: #fff1eb;
  border-color: #ff8049;
  box-shadow: 0 2px 8px rgba(255, 128, 73, 0.15);
}

.btn-ajuda-status .material-symbols-outlined {
  font-size: 18px;
}

/* ════════════════════════════════════════════
   HEADER
════════════════════════════════════════════ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.header-content p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0.2rem 0 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* BUSCA */
.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 300px;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  transition: all 0.2s;
}

.custom-input:focus {
  border-color: #ff8049;
  box-shadow: 0 0 0 2px rgba(255, 128, 73, 0.1);
}

/* FILTROS */
.filter-panel {
  display: flex;
  gap: 2rem;
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  margin-bottom: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.button-group .p-button {
  background: #f1f5f9;
  border: none;
  color: #475569;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  border-radius: 6px;
}

.button-group .p-button:hover {
  background: #e2e8f0;
}

.button-group .active-filter {
  background: #ff8049 !important;
  color: white !important;
}

.custom-calendar {
  height: 38px;
}

/* TABELA */
.table-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.custom-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.custom-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px solid #f8fafc;
}

/* CORES DAS TAGS DE STATUS */
/* Laranja — Fechada */
:deep(.tag-fechada.p-tag) {
  font-size: 13px;
  background-color: #ff804930 !important;
  color: #ff8049 !important;
}

/* Cinza — Indisponível */
:deep(.tag-indisponivel.p-tag) {
  font-size: 13px;
  background-color: #94a3b830 !important;
  color: #94a3b8 !important;
}

/* Azul — Finalizada */
:deep(.tag-finalizada.p-tag) {
  font-size: 13px;
  background-color: #3b82f630 !important;
  color: #3b82f6 !important;
}

/* Verde — Aberta */
:deep(.tag-aberta.p-tag) {
  font-size: 13px;
  background-color: #22c55e30 !important;
  color: #22c55e !important;
}

/* ESTILO STATUS / AÇÕES */
.custom-tag {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.action-btn {
  transition: all 0.2s;
}

.active-btn {
  color: #ff8049 !important;
}

.active-btn:hover {
  background: rgba(255, 128, 73, 0.1) !important;
}

.disabled-btn {
  opacity: 1;
  cursor: not-pointer;
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .custom-input {
    width: 100%;
  }
  
  .filter-panel {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .btn-ajuda-status {
    width: 100%;
    justify-content: center;
  }
}

.p-inputtext-sm {
  position: relative;
  width: 450px;
  padding-left: 40px;
}

.position-search-icon {
  position: relative;
  transform: translate(35px, 8px);
  z-index: 1;
}

.search-box {
  position: relative;
}

.p-button-sm-filter {
  color: #ff8049; 
  background-color: #F1F5F9;
  cursor: pointer;
}

.button-filter-disable {
  color: #a7a2a2; 
  background-color: #dce0e4;
  cursor: not-allowed;
}

:deep(.row-clickable) {
  cursor: pointer;
}

/* Estilo para as linhas desabilitadas */
:deep(.row-disabled) {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Customização do Hover */
:deep(.p-datatable-hoverable-rows .p-selectable-row:hover) {
  background: rgba(255, 128, 73, 0.04) !important;
  transition: background 0.2s ease;
}

:deep(.row-clickable:hover td:first-child) {
  box-shadow: inset 4px 0 0 0 #ff8049;
}

.filter-btn-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  background-color: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  color: #475467;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn-toggle span {
  font-size: 20px;
  transition: transform 0.2s ease;
}

/* Estado ATIVO (Laranja da Marca) */
.filter-btn-toggle.active {
  background-color: #fff1eb;
  border-color: #ff8049;
  color: #ff8049;
  box-shadow: 0 1px 2px rgba(255, 128, 73, 0.1);
}

.filter-btn-toggle.active span {
  color: #ff8049;
  font-variation-settings: 'FILL' 1;
}

/* Hover para botões não ativos */
.filter-btn-toggle:hover:not(.active) {
  background-color: #f9fafb;
  border-color: #98a2b3;
}

/* Efeito de clique */
.filter-btn-toggle:active {
  transform: scale(0.98);
}

/* Container para alinhar os botões de toggle lado a lado */
.toggle-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Responsividade para telas pequenas */
@media (max-width: 640px) {
  .toggle-group {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-btn-toggle {
    width: 100%;
    justify-content: center;
  }
}
</style>