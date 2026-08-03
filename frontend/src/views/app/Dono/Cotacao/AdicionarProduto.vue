<template>
  <div class="dashboard-container">
    <header class="page-header">
      <div class="header-content">
        <h1>Painel de Cotações </h1>
        <p style="font-size: 16px;">Consulte suas cotações</p>
      </div>
      <div class="header-actions">
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

      <div class="filter-group">
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
              :value="data.status_cotacao.toUpperCase()" 
              :severity="getStatusSeverity(data.status_cotacao)"
              class="custom-tag"
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
              :disabled="data.status_cotacao !== 'aberta'"
              :class="['p-button-rounded p-button-text action-btn', data.status_cotacao === 'aberta' ? 'active-btn' : 'disabled-btn']"
              @click="irParaAdicionarProdutos(data)"
              v-tooltip.left="data.status_cotacao === 'aberta' ? 'Gerenciar Cotação' : 'Apenas leitura'"
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
      filtroStatus: null, // Pode ser 'aberta', 'finalizada' ou null
    }
  },

  computed: {
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

      // 2. Filtro por Status (Abertas / Finalizadas)
      if (this.filtroStatus) {
        lista = lista.filter(c => c.status_cotacao === this.filtroStatus);
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
        this.cotacoes = response.data.data || []
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
      this.filtroAtivo = null;   // Reseta botões Hoje/Semana/Mês
      this.filtroStatus = null;  // Reseta botões Aberta/Fechada
    },

    getStatusSeverity(status) {
      switch (status) {
        case 'aberta': return 'success'
        case 'finalizada': return 'info'
        case 'cancelada': return 'danger'
        default: return 'warning'
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
      if (cotacao.status_cotacao !== 'fechada') return
      
      this.$router.push({
        name: 'AdicionarItensCotacao',
        query: {
          nome_cotacao: cotacao.nome_cotacao,
          id_cotacao: cotacao.id_cotacao,
          id_usuario: cotacao.id_usuario
        }
      })
    },
    
    // Define classes customizadas para a linha (ex: desabilitar visualmente)
    rowClass(data) {
      return data.status_cotacao !== 'fechada' ? 'row-disabled' : 'row-clickable';
    },

    // Gerencia o clique na linha
    onRowClick(event) {
      const cotacao = event.data;
      
      // Só permite o clique se o status for 'aberta'
      if (cotacao.status_cotacao === 'fechada') {
        this.irParaAdicionarProdutos(cotacao);
      }
    },
  
    toggleFiltroAbertas() {
      this.mostrarApenasAbertas = !this.mostrarApenasAbertas;
    },
    
    // No seu método limparFiltros, adicione:
    limparFiltros() {
      this.filtros.busca = ''
      this.filtros.datas = null
      this.filtroAtivo = null
      this.filtroStatus = null;
    },

    definirFiltroStatus(status) {
      // Se clicar no que já está ativo, ele limpa o filtro (toggle)
      this.filtroStatus = this.filtroStatus === status ? null : status;
    },

  },

  mounted() {
    this.auth = useAuthStore()
    this.buscarCotacoes()
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

/* HEADER */
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
  opacity: 0.3;
  cursor: not-allowed !important;
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
}

.p-inputtext-sm{
  position: relative;
  width: 450px;
  padding-left: 40px;
}


.position-search-icon{
  position: relative;
  transform: translate(35px, 8px);
  z-index: 1;
}

.search-box{
  position: relative;
}

.p-button-sm-filter{
  color: #ff8049; 
  background-color: #F1F5F9;
  cursor: pointer;
}


.button-filter-disable{
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

/* Customização do Hover (Usando sua cor #ff8049 de forma sutil) */
:deep(.p-datatable-hoverable-rows .p-selectable-row:hover) {
  background: rgba(255, 128, 73, 0.04) !important; /* Laranja claríssimo no fundo */
  transition: background 0.2s ease;
}

/* Opcional: Uma borda esquerda laranja no hover para um look premium */
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
  font-size: 14px; /* Ajustado para harmonia visual */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn-toggle span {
  font-size: 20px;
  transition: transform 0.2s ease;
}

/* Estado quando o filtro está ATIVO */
.filter-btn-toggle.active {
  background-color: #fff1eb; /* Fundo laranja claríssimo */
  border-color: #ff8049;
  color: #ff8049;
}

.filter-btn-toggle.active span {
  color: #ff8049;
  font-variation-settings: 'FILL' 1; /* Preenche o ícone se o símbolo suportar */
}

/* Hover suave */
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

/* Estado ATIVO (Laranja da Marca) */
.filter-btn-toggle.active {
  background-color: #fff1eb;
  border-color: #ff8049;
  color: #ff8049;
  box-shadow: 0 1px 2px rgba(255, 128, 73, 0.1);
}

.filter-btn-toggle.active span {
  font-variation-settings: 'FILL' 1;
}

/* Hover para botões não ativos */
.filter-btn-toggle:hover:not(.active) {
  background-color: #f9fafb;
  border-color: #98a2b3;
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