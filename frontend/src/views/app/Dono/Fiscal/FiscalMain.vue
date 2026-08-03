<template>
  <div class="dashboard-root">
    <div class="main-area">

      <!-- TOPBAR -->
      <div class="topbar">
        <div class="topbar-brand">
          <div class="brand-icon">
            <span class="material-symbols-outlined" style="font-size:17px;color:#fff">receipt_long</span>
          </div>
          <div>
            <div class="topbar-title">Dashboard Fiscal</div>
            <div class="topbar-sub">Monitor SEFAZ · NF-e · NFC-e · Tributário</div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="sefaz-status" :class="sefazOnline ? 'online' : 'offline'">
            <span class="sefaz-dot"></span>
            SEFAZ {{ sefazOnline ? 'Online' : 'Offline' }}
          </div>
          <div class="cert-chip" :class="certDaysLeft <= 30 ? 'cert-danger' : certDaysLeft <= 60 ? 'cert-warn' : 'cert-ok'">
            <span class="material-symbols-outlined" style="font-size:14px">verified_user</span>
            Cert. vence em {{ certDaysLeft }}d
          </div>
          <button class="tbtn" @click="refreshData">
            <span class="material-symbols-outlined" style="font-size:14px">refresh</span>
            Atualizar
          </button>
          <div class="user-avatar">CF</div>
        </div>
      </div>

      <div class="content">

        <!-- FILTER BAR -->
        <div class="filter-bar">
          <div class="filter-left">
            <span class="material-symbols-outlined" style="font-size:18px;color:var(--accent)">calendar_today</span>
            <span class="filter-label">Período:</span>
            <div class="period-tabs">
              <button
                v-for="p in periods"
                :key="p.key"
                class="ptab"
                :class="{ active: activePeriod === p.key }"
                @click="activePeriod = p.key"
              >{{ p.label }}</button>
            </div>
            <div class="custom-days" v-if="activePeriod === 'custom'">
              <span class="filter-label">Últimos</span>
              <input type="number" v-model.number="customDays" min="1" max="365" class="days-input" />
              <span class="filter-label">dias</span>
            </div>
          </div>
          <div class="filter-right">
            <span class="filter-sub">Exibindo: <strong>{{ periodLabel }}</strong> · Atualizado às {{ lastUpdate }}</span>
          </div>
        </div>

        <!-- ALERT BAR -->
        <div class="alert-bar" v-if="showAlert">
          <span class="material-symbols-outlined" style="color:var(--accent);font-size:18px">error</span>
          <span>
            <strong>{{ currentKpis.rejeicoes }} rejeições</strong> SEFAZ hoje ·
            <strong>{{ currentKpis.pendentes }} XMLs</strong> pendentes de envio ·
            <strong style="color:var(--accent)">{{ currentKpis.contingencia }} notas</strong> em modo contingência.
          </span>
          <span
            class="material-symbols-outlined"
            style="margin-left:auto;cursor:pointer;color:var(--muted);font-size:16px"
            @click="showAlert=false">close</span>
        </div>

        <!-- KPI GRID PRINCIPAL -->
        <div class="kpi-grid">
          <div v-for="kpi in mainKpis" :key="kpi.label" class="kpi-card" :class="kpi.accent">
            <div class="kpi-label">
              <span class="material-symbols-outlined" style="font-size:16px;margin-right:3px">{{ kpi.icon }}</span>
              {{ kpi.label }}
            </div>
            <div class="kpi-value">
              <span v-if="kpi.prefix" class="kpi-prefix">{{ kpi.prefix }}</span>
              {{ kpi.value }}
            </div>
            <div class="kpi-footer">
              <span :class="['kpi-delta', kpi.trendUp ? 'up' : 'down']">
                <span class="material-symbols-outlined" style="font-size:13px">{{ kpi.trendUp ? 'trending_up' : 'trending_down' }}</span>
                {{ kpi.trend }}
              </span>
              <span class="kpi-sub">vs período ant.</span>
            </div>
            <span class="material-symbols-outlined kpi-bg-icon">{{ kpi.icon }}</span>
          </div>
        </div>

        <!-- KPI MINI GRID -->
        <div class="kpi-mini-grid">
          <div v-for="m in miniKpis" :key="m.label" class="kpi-mini" :class="m.urgent ? 'mini-urgent' : ''">
            <div class="kpi-mini-icon" :style="{ background: m.color + '18', color: m.color }">
              <span class="material-symbols-outlined" style="font-size:15px">{{ m.icon }}</span>
            </div>
            <div class="kpi-mini-label">{{ m.label }}</div>
            <div class="kpi-mini-value" :style="m.urgent ? { color: 'var(--red)' } : {}">{{ m.value }}</div>
            <div class="kpi-mini-sub">{{ m.sub }}</div>
          </div>
        </div>

        <!-- CHARTS ROW 1 -->
        <div class="grid-2-1">
          <!-- FATURAMENTO FISCAL -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">monitoring</span>
              </div>
              <div>
                <div class="card-title">Faturamento Fiscal</div>
                <div class="card-sub">NF-e + NFC-e emitidas · {{ periodLabel }}</div>
              </div>
              <div class="card-actions">
                <span class="chip" :class="{ active: chartFilter === 'total' }" @click="chartFilter='total'">Total</span>
                <span class="chip" :class="{ active: chartFilter === 'nfe' }" @click="chartFilter='nfe'">NF-e</span>
                <span class="chip" :class="{ active: chartFilter === 'nfce' }" @click="chartFilter='nfce'">NFC-e</span>
              </div>
            </div>
            <div class="chart-wrap h240">
              <Line :data="faturamentoData" :options="lineOptions" />
            </div>
          </div>

          <!-- SEFAZ MONITOR -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon" :class="sefazOnline ? 'c-green' : 'c-red'">
                <span class="material-symbols-outlined">cloud_done</span>
              </div>
              <div>
                <div class="card-title">Monitor SEFAZ</div>
                <div class="card-sub">Status por UF · tempo real</div>
              </div>
            </div>
            <div class="sefaz-monitor">
              <div class="sefaz-main-status" :class="sefazOnline ? 'status-online' : 'status-offline'">
                <span class="material-symbols-outlined" style="font-size:32px">{{ sefazOnline ? 'check_circle' : 'cancel' }}</span>
                <div>
                  <div class="sefaz-status-label">{{ sefazOnline ? 'ONLINE' : 'OFFLINE' }}</div>
                  <div class="sefaz-status-sub">Última verificação: {{ lastUpdate }}</div>
                </div>
              </div>
              <div class="sefaz-uf-grid">
                <div v-for="uf in sefazUFs" :key="uf.uf" class="sefaz-uf" :class="uf.online ? 'uf-on' : 'uf-off'">
                  <span class="uf-dot"></span>
                  {{ uf.uf }}
                  <span class="uf-ms">{{ uf.ms }}ms</span>
                </div>
              </div>
              <div class="sefaz-stats">
                <div class="ss-item">
                  <div class="ss-val green">{{ sefazUptime }}%</div>
                  <div class="ss-lbl">Uptime 30d</div>
                </div>
                <div class="ss-item">
                  <div class="ss-val accent">{{ sefazAvgMs }}ms</div>
                  <div class="ss-lbl">Latência Méd.</div>
                </div>
                <div class="ss-item">
                  <div class="ss-val" :class="sefazIncidents > 0 ? 'red' : 'green'">{{ sefazIncidents }}</div>
                  <div class="ss-lbl">Incidentes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CHARTS ROW 2 -->
        <div class="grid-3">
          <!-- DOCUMENTOS POR TIPO -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue">
                <span class="material-symbols-outlined">pie_chart</span>
              </div>
              <div>
                <div class="card-title">Documentos Emitidos</div>
                <div class="card-sub">Distribuição por tipo</div>
              </div>
            </div>
            <div class="donut-wrap">
              <Doughnut :data="documentosData" :options="donutOptions" />
            </div>
            <div class="cat-list">
              <div v-for="doc in documentosTipos" :key="doc.name" class="cat-item">
                <span class="cat-dot" :style="{ background: doc.color }"></span>
                <span class="cat-name">{{ doc.name }}</span>
                <span class="cat-qty">{{ doc.qty }}</span>
                <div class="pb-wrap-sm">
                  <ProgressBar :value="doc.pct" :showValue="false" class="pb-custom pb-dyn"
                    :style="{ '--pb-color': doc.color }" />
                </div>
                <span class="cat-val">{{ doc.pct }}%</span>
              </div>
            </div>
          </div>

          <!-- STATUS SEFAZ BARRAS -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">bar_chart</span>
              </div>
              <div>
                <div class="card-title">Retornos SEFAZ</div>
                <div class="card-sub">Autorizadas vs Rejeitadas · {{ periodLabel }}</div>
              </div>
            </div>
            <div class="chart-wrap h200">
              <Bar :data="retornosData" :options="barOptions" />
            </div>
          </div>

          <!-- CONSUMO DE NUMERAÇÃO -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-yellow">
                <span class="material-symbols-outlined">tag</span>
              </div>
              <div>
                <div class="card-title">Consumo de Numeração</div>
                <div class="card-sub">NF-e · NFC-e · Série ativa</div>
              </div>
            </div>
            <div class="numeracao-list">
              <div v-for="num in numeracaoData" :key="num.tipo" class="num-item">
                <div class="num-header">
                  <span class="num-tipo">{{ num.tipo }}</span>
                  <span class="num-serie">Série {{ num.serie }}</span>
                  <span class="num-pct" :style="{ color: num.pct >= 80 ? 'var(--red)' : num.pct >= 60 ? 'var(--yellow)' : 'var(--green)' }">
                    {{ num.pct }}%
                  </span>
                </div>
                <ProgressBar :value="num.pct" :showValue="false" class="pb-custom"
                  :class="num.pct >= 80 ? 'pb-red' : num.pct >= 60 ? 'pb-yellow' : 'pb-green'" />
                <div class="num-detail">
                  <span>Último: <strong>{{ num.ultimo }}</strong></span>
                  <span>Limite: <strong>{{ num.limite }}</strong></span>
                  <span>Restam: <strong>{{ num.restam }}</strong></span>
                </div>
              </div>
            </div>
            <div class="num-footer">
              <span class="material-symbols-outlined" style="font-size:14px;color:var(--yellow)">warning</span>
              <span style="font-size:11px;color:var(--text2)">NF-e série 1 atingirá 80% em <strong>~18 dias</strong></span>
            </div>
          </div>
        </div>

        <!-- TABELAS -->
        <div class="grid-2">
          <!-- REJEIÇÕES SEFAZ -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-red">
                <span class="material-symbols-outlined">error</span>
              </div>
              <div>
                <div class="card-title">Rejeições SEFAZ</div>
                <div class="card-sub">Erros mais frequentes · {{ periodLabel }}</div>
              </div>
              <div class="card-actions">
                <span class="badge-count red">{{ currentKpis.rejeicoes }}</span>
              </div>
            </div>
            <DataTable :value="rejeicoes" class="dt-custom" size="small">
              <Column header="CÓD." style="width:60px">
                <template #body="{ data }">
                  <span class="code-badge">{{ data.codigo }}</span>
                </template>
              </Column>
              <Column header="DESCRIÇÃO">
                <template #body="{ data }">
                  <div class="cell-name">{{ data.descricao }}</div>
                  <div class="cell-sub">{{ data.causa }}</div>
                </template>
              </Column>
              <Column header="QTD." style="width:55px">
                <template #body="{ data }">
                  <span class="mono-bold" style="color:var(--red)">{{ data.qtd }}</span>
                </template>
              </Column>
              <Column header="CRITICIDADE" style="width:100px">
                <template #body="{ data }">
                  <Tag :value="data.criticidade"
                    :class="['tag-custom', data.criticidade === 'Alta' ? 'tag-red' : data.criticidade === 'Média' ? 'tag-orange' : 'tag-yellow']" />
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- NOTAS PENDENTES / EM PROCESSO -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-yellow">
                <span class="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <div class="card-title">Documentos Pendentes</div>
                <div class="card-sub">XMLs aguardando ação</div>
              </div>
              <div class="card-actions">
                <div class="tab-group">
                  <button v-for="t in pendenteTabs" :key="t.key" class="stab"
                    :class="{ active: activePendenteTab === t.key }"
                    @click="activePendenteTab = t.key">
                    {{ t.label }}
                    <span class="stab-badge" :class="t.color">{{ t.count }}</span>
                  </button>
                </div>
              </div>
            </div>
            <DataTable :value="currentPendentes" class="dt-custom" size="small">
              <Column header="NRO." style="width:70px">
                <template #body="{ data }">
                  <span class="mono-bold">{{ data.numero }}</span>
                </template>
              </Column>
              <Column header="DESTINATÁRIO">
                <template #body="{ data }">
                  <div class="cell-name">{{ data.destinatario }}</div>
                  <div class="cell-sub">{{ data.cnpj }}</div>
                </template>
              </Column>
              <Column header="VALOR" style="width:90px">
                <template #body="{ data }">
                  <span class="mono-bold">R$ {{ data.valor }}</span>
                </template>
              </Column>
              <Column header="SITUAÇÃO">
                <template #body="{ data }">
                  <Tag :value="data.situacao"
                    :class="['tag-custom', data.tagClass]" />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <!-- LINHA 3 -->
        <div class="grid-3">
          <!-- CANCELAMENTOS -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-red">
                <span class="material-symbols-outlined">cancel</span>
              </div>
              <div>
                <div class="card-title">Cancelamentos</div>
                <div class="card-sub">NF-e canceladas · {{ periodLabel }}</div>
              </div>
              <div class="card-actions">
                <span class="badge-count orange">{{ currentKpis.cancelamentos }}</span>
              </div>
            </div>
            <div class="mini-list">
              <div v-for="c in cancelamentos" :key="c.numero" class="mini-list-item">
                <div class="mli-icon c-red">
                  <span class="material-symbols-outlined" style="font-size:14px">cancel</span>
                </div>
                <div class="mli-info">
                  <div class="mli-title">NF-e {{ c.numero }}</div>
                  <div class="mli-sub">{{ c.destinatario }} · R$ {{ c.valor }}</div>
                </div>
                <div class="mli-right">
                  <div class="mli-time">{{ c.tempo }}</div>
                  <Tag :value="c.motivo" class="tag-custom tag-red" />
                </div>
              </div>
            </div>
          </div>

          <!-- CARTA DE CORREÇÃO -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue">
                <span class="material-symbols-outlined">edit_document</span>
              </div>
              <div>
                <div class="card-title">Carta de Correção</div>
                <div class="card-sub">CC-e pendentes de envio</div>
              </div>
              <div class="card-actions">
                <span class="badge-count blue">{{ currentKpis.cce }}</span>
              </div>
            </div>
            <div class="mini-list">
              <div v-for="cc in cartaCorrecao" :key="cc.numero" class="mini-list-item">
                <div class="mli-icon c-blue">
                  <span class="material-symbols-outlined" style="font-size:14px">edit_document</span>
                </div>
                <div class="mli-info">
                  <div class="mli-title">NF-e {{ cc.numero }} · CC-e {{ cc.seq }}</div>
                  <div class="mli-sub">{{ cc.campo }} → {{ cc.correcao }}</div>
                </div>
                <div class="mli-right">
                  <div class="mli-time">{{ cc.tempo }}</div>
                  <Tag :value="cc.status" class="tag-custom" :class="cc.status === 'Pendente' ? 'tag-yellow' : 'tag-green'" />
                </div>
              </div>
            </div>
          </div>

          <!-- MANIFESTAÇÃO DO DESTINATÁRIO -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <div>
                <div class="card-title">Manifestação Destinatário</div>
                <div class="card-sub">Notas aguardando ciência</div>
              </div>
              <div class="card-actions">
                <span class="badge-count orange">{{ currentKpis.manifestacao }}</span>
              </div>
            </div>
            <div class="manifestacao-stats">
              <div v-for="ms in manifestacaoStats" :key="ms.label" class="mstat">
                <div class="mstat-val" :style="{ color: ms.color }">{{ ms.value }}</div>
                <div class="mstat-label">{{ ms.label }}</div>
              </div>
            </div>
            <div class="mini-list">
              <div v-for="m in manifestacoes" :key="m.chave" class="mini-list-item">
                <div class="mli-icon c-orange">
                  <span class="material-symbols-outlined" style="font-size:14px">assignment</span>
                </div>
                <div class="mli-info">
                  <div class="mli-title">{{ m.emitente }}</div>
                  <div class="mli-sub">Chave: {{ m.chave }} · R$ {{ m.valor }}</div>
                </div>
                <div class="mli-right">
                  <Tag :value="m.status" class="tag-custom"
                    :class="m.status === 'Desconhecida' ? 'tag-yellow' : m.status === 'Ciência' ? 'tag-blue' : 'tag-orange'" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LINHA FINAL -->
        <div class="grid-2">
          <!-- INUTILIZAÇÕES -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-yellow">
                <span class="material-symbols-outlined">block</span>
              </div>
              <div>
                <div class="card-title">Inutilizações de Numeração</div>
                <div class="card-sub">Faixas inutilizadas · histórico</div>
              </div>
              <div class="card-actions">
                <span class="badge-count yellow">{{ currentKpis.inutilizacoes }}</span>
              </div>
            </div>
            <DataTable :value="inutilizacoes" class="dt-custom" size="small">
              <Column header="TIPO" style="width:70px">
                <template #body="{ data }">
                  <Tag :value="data.tipo" class="tag-custom tag-blue" />
                </template>
              </Column>
              <Column header="SÉRIE" style="width:55px">
                <template #body="{ data }">
                  <span class="mono-bold">{{ data.serie }}</span>
                </template>
              </Column>
              <Column header="FAIXA">
                <template #body="{ data }">
                  <span class="mono-bold">{{ data.inicio }} → {{ data.fim }}</span>
                  <div class="cell-sub">{{ data.qtd }} número(s)</div>
                </template>
              </Column>
              <Column header="MOTIVO">
                <template #body="{ data }">
                  <span style="font-size:11.5px;color:var(--text2)">{{ data.motivo }}</span>
                </template>
              </Column>
              <Column header="DATA" style="width:80px">
                <template #body="{ data }">
                  <span style="font-size:11px;color:var(--muted)">{{ data.data }}</span>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- ALERTAS TRIBUTÁRIOS -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">gavel</span>
              </div>
              <div>
                <div class="card-title">Alertas Tributários</div>
                <div class="card-sub">Obrigações e vencimentos</div>
              </div>
              <div class="card-actions">
                <span class="badge-count red">{{ alertasTributarios.filter(a => a.urgente).length }}</span>
              </div>
            </div>
            <div class="alertas-list">
              <div v-for="a in alertasTributarios" :key="a.id" class="alerta-item" :class="a.urgente ? 'alerta-urgente' : ''">
                <div class="alerta-icon" :style="{ background: a.color + '18', color: a.color }">
                  <span class="material-symbols-outlined" style="font-size:16px">{{ a.icon }}</span>
                </div>
                <div class="alerta-info">
                  <div class="alerta-title">{{ a.titulo }}</div>
                  <div class="alerta-sub">{{ a.descricao }}</div>
                </div>
                <div class="alerta-right">
                  <div class="alerta-prazo" :style="{ color: a.color }">{{ a.prazo }}</div>
                  <Tag :value="a.tag" class="tag-custom"
                    :style="{ background: a.color + '22', color: a.color, border: '1px solid ' + a.color + '44' }" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <footer class="dash-footer">
        <span>Dashboard Fiscal · ERP Fiscal · Dados via SEFAZ WebService</span>
        <span>©2026 Todos os dados reservados · Última sincronização: {{ lastUpdate }}</span>
      </footer>
    </div>
  </div>
</template>

<script>
import { Line, Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement,
  CategoryScale, LinearScale, PointElement, BarElement, ArcElement, Filler
} from 'chart.js';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement, ArcElement, Filler);

const ACCENT = '#FF8049';
const GREEN  = '#16a34a';
const BLUE   = '#2563eb';
const YELLOW = '#ca8a04';
const RED    = '#dc2626';
const PURPLE = '#7c3aed';
const GRID   = 'rgba(0,0,0,0.05)';
const TEXT   = '#64748b';
const TOOLTIP_BG = '#1e293b';

const baseTooltip = {
  backgroundColor: TOOLTIP_BG,
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#f1f5f9',
  bodyColor: '#94a3b8',
  padding: 10,
};

const baseScales = {
  x: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 11 } } },
  y: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 11 } } },
};

function genDays(n, base, variance) {
  return Array.from({ length: n }, () => Math.round(base + (Math.random() - 0.5) * variance));
}
function genLabels(n) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  });
}

export default {
  name: 'DashboardFiscal',
  components: { Line, Bar, Doughnut, DataTable, Column, ProgressBar, Tag },

  data() {
    return {
      showAlert: true,
      activePeriod: 'hoje',
      customDays: 30,
      chartFilter: 'total',
      activePendenteTab: 'xml',
      sefazOnline: true,
      sefazUptime: 99.7,
      sefazAvgMs: 142,
      sefazIncidents: 1,
      certDaysLeft: 47,
      lastUpdate: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),

      periods: [
        { key: 'hoje',   label: 'Hoje' },
        { key: '7d',     label: '7 dias' },
        { key: '15d',    label: '15 dias' },
        { key: '30d',    label: '30 dias' },
        { key: '90d',    label: '90 dias' },
        { key: 'custom', label: 'Personalizado' },
      ],

      kpisByPeriod: {
        hoje: {
          nfe: 84, nfce: 312, rejeicoes: 7, pendentes: 3, cancelamentos: 2,
          inutilizacoes: 1, contingencia: 0, cce: 4, manifestacao: 11,
          faturamento: 'R$ 48.720', faturamentoPrefix: '',
        },
        '7d': {
          nfe: 612, nfce: 2184, rejeicoes: 31, pendentes: 12, cancelamentos: 9,
          inutilizacoes: 3, contingencia: 2, cce: 18, manifestacao: 74,
          faturamento: 'R$ 341.040', faturamentoPrefix: '',
        },
        '15d': {
          nfe: 1310, nfce: 4700, rejeicoes: 58, pendentes: 21, cancelamentos: 19,
          inutilizacoes: 7, contingencia: 4, cce: 34, manifestacao: 142,
          faturamento: 'R$ 731.800', faturamentoPrefix: '',
        },
        '30d': {
          nfe: 2640, nfce: 9420, rejeicoes: 107, pendentes: 38, cancelamentos: 41,
          inutilizacoes: 12, contingencia: 8, cce: 67, manifestacao: 298,
          faturamento: 'R$ 1.474.200', faturamentoPrefix: '',
        },
        '90d': {
          nfe: 7920, nfce: 28260, rejeicoes: 290, pendentes: 88, cancelamentos: 123,
          inutilizacoes: 34, contingencia: 22, cce: 189, manifestacao: 891,
          faturamento: 'R$ 4.422.600', faturamentoPrefix: '',
        },
        custom: {
          nfe: 2640, nfce: 9420, rejeicoes: 107, pendentes: 38, cancelamentos: 41,
          inutilizacoes: 12, contingencia: 8, cce: 67, manifestacao: 298,
          faturamento: 'R$ 1.474.200', faturamentoPrefix: '',
        },
      },

      sefazUFs: [
        { uf: 'SP', online: true,  ms: 98  },
        { uf: 'RJ', online: true,  ms: 112 },
        { uf: 'MG', online: true,  ms: 134 },
        { uf: 'RS', online: true,  ms: 187 },
        { uf: 'PR', online: true,  ms: 143 },
        { uf: 'SC', online: false, ms: 999 },
        { uf: 'BA', online: true,  ms: 210 },
        { uf: 'GO', online: true,  ms: 198 },
        { uf: 'AM', online: false, ms: 999 },
        { uf: 'CE', online: true,  ms: 225 },
        { uf: 'PE', online: true,  ms: 217 },
        { uf: 'MT', online: true,  ms: 244 },
      ],

      rejeicoes: [
        { codigo: '204', descricao: 'NF-e já está cancelada', causa: 'Tentativa dupla de cancelamento', qtd: 3, criticidade: 'Alta' },
        { codigo: '539', descricao: 'CNPJ Emitente inválido', causa: 'Certificado desatualizado', qtd: 2, criticidade: 'Alta' },
        { codigo: '591', descricao: 'IE inválida para UF', causa: 'Cadastro desatualizado', qtd: 1, criticidade: 'Média' },
        { codigo: '302', descricao: 'IE destinatário inválida', causa: 'Dado cadastral incorreto', qtd: 1, criticidade: 'Média' },
        { codigo: '998', descricao: 'Erro indisponibilidade', causa: 'SEFAZ instável momentaneamente', qtd: 4, criticidade: 'Baixa' },
      ],

      pendentesData: {
        xml: [
          { numero: '000.842', destinatario: 'Distribuidora Sul Ltda.', cnpj: '12.345.678/0001-90', valor: '8.420,00', situacao: 'Pendente',     tagClass: 'tag-yellow' },
          { numero: '000.843', destinatario: 'Comércio Central Eireli', cnpj: '98.765.432/0001-11', valor: '3.180,50', situacao: 'Pendente',     tagClass: 'tag-yellow' },
          { numero: '000.844', destinatario: 'Tech Imports S.A.',       cnpj: '11.222.333/0001-44', valor: '21.700,00', situacao: 'Processando', tagClass: 'tag-blue'   },
        ],
        contingencia: [
          { numero: '000.839', destinatario: 'Atacado Norte Ltda.',  cnpj: '55.666.777/0001-22', valor: '14.300,00', situacao: 'Contingência', tagClass: 'tag-orange' },
          { numero: '000.840', destinatario: 'Fast Delivery ME',     cnpj: '33.444.555/0001-88', valor: '2.890,00',  situacao: 'Contingência', tagClass: 'tag-orange' },
        ],
        cancelamento: [
          { numero: '000.835', destinatario: 'Loja Expresso Ltda.',  cnpj: '77.888.999/0001-00', valor: '5.670,00',  situacao: 'Solicitar',    tagClass: 'tag-red'    },
        ],
      },

      pendenteTabs: [
        { key: 'xml',         label: 'XMLs',         count: 3, color: 'badge-yellow' },
        { key: 'contingencia',label: 'Contingência', count: 2, color: 'badge-orange' },
        { key: 'cancelamento',label: 'Cancelamento', count: 1, color: 'badge-red'    },
      ],

      cancelamentos: [
        { numero: '000.835', destinatario: 'Loja Expresso Ltda.',  valor: '5.670,00',  tempo: '14:32', motivo: 'Erro dados' },
        { numero: '000.820', destinatario: 'Varejão Central S.A.', valor: '1.340,00',  tempo: '10:18', motivo: 'Solicitação' },
      ],

      cartaCorrecao: [
        { numero: '000.810', seq: '001', campo: 'Endereço entrega', correcao: 'Rua B, 200', tempo: '2h', status: 'Pendente'  },
        { numero: '000.798', seq: '001', campo: 'Dados adicionais', correcao: 'Pedido 4421', tempo: '5h', status: 'Enviada'  },
        { numero: '000.789', seq: '002', campo: 'CFOP',             correcao: '5102',        tempo: '1d', status: 'Pendente' },
        { numero: '000.775', seq: '001', campo: 'Natureza op.',     correcao: 'Venda prod.',  tempo: '2d', status: 'Enviada' },
      ],

      manifestacaoStats: [
        { label: 'Desconhecida', value: 6,  color: YELLOW },
        { label: 'Ciência',      value: 3,  color: BLUE   },
        { label: 'Confirmada',   value: 2,  color: GREEN  },
        { label: 'Não realiz.',  value: 0,  color: RED    },
      ],

      manifestacoes: [
        { emitente: 'Fornecedor Alpha Ltda.',  chave: '3524...0001', valor: '18.420,00', status: 'Desconhecida' },
        { emitente: 'Indústria Beta S.A.',     chave: '3524...0002', valor: '9.840,00',  status: 'Ciência'      },
        { emitente: 'Comercial Gama ME',       chave: '3524...0003', valor: '4.320,00',  status: 'Desconhecida' },
        { emitente: 'Distribuidora Delta Ltda', chave: '3524...0004', valor: '31.100,00', status: 'Ciência'      },
      ],

      inutilizacoes: [
        { tipo: 'NF-e',  serie: '1', inicio: '000800', fim: '000804', qtd: 5, motivo: 'Erro emissão sistema',      data: '12/05/26' },
        { tipo: 'NFC-e', serie: '2', inicio: '001200', fim: '001200', qtd: 1, motivo: 'Teste integração',          data: '10/05/26' },
        { tipo: 'NF-e',  serie: '1', inicio: '000790', fim: '000791', qtd: 2, motivo: 'Numeração pulada no sistema', data: '08/05/26' },
      ],

      alertasTributarios: [
        { id: 1, icon: 'gavel',          titulo: 'SPED Fiscal — EFD',     descricao: 'Competência Abril/2026 vence em 3 dias',      prazo: '17/05',  tag: 'Urgente',    color: RED,    urgente: true  },
        { id: 2, icon: 'account_balance',titulo: 'DCTF Mensal',           descricao: 'Declaração pendente de envio',                prazo: '20/05',  tag: 'Urgente',    color: RED,    urgente: true  },
        { id: 3, icon: 'receipt',        titulo: 'NF-e de Energia',       descricao: 'Nota de serviço de energia não escriturada',  prazo: '25/05',  tag: 'Atenção',    color: YELLOW, urgente: false },
        { id: 4, icon: 'sync_alt',       titulo: 'Atualização de Tabelas', descricao: 'IBPT 2026-1S pendente de atualização',       prazo: '31/05',  tag: 'Atenção',    color: YELLOW, urgente: false },
        { id: 5, icon: 'verified_user',  titulo: 'Certificado Digital',   descricao: `A-1 vence em ${47} dias · renovar`,           prazo: '30/06',  tag: 'Info',       color: BLUE,   urgente: false },
        { id: 6, icon: 'assignment',     titulo: 'EFD Contribuições',     descricao: 'Competência Março/2026 conferida',            prazo: '15/06',  tag: 'OK',         color: GREEN,  urgente: false },
      ],

      numeracaoData: [
        { tipo: 'NF-e',   serie: '1', ultimo: '000.844', limite: '999.999', restam: '999.155', pct: 0  },
        { tipo: 'NFC-e',  serie: '2', ultimo: '012.482', limite: '999.999', restam: '987.517', pct: 1  },
        { tipo: 'CT-e',   serie: '1', ultimo: '000.312', limite: '999.999', restam: '999.687', pct: 0  },
      ],

      documentosTipos: [
        { name: 'NF-e',   qty: 2640,  pct: 58, color: ACCENT  },
        { name: 'NFC-e',  qty: 1420,  pct: 31, color: BLUE    },
        { name: 'CT-e',   qty: 312,   pct: 7,  color: GREEN   },
        { name: 'MDF-e',  qty: 88,    pct: 2,  color: YELLOW  },
        { name: 'NFS-e',  qty: 44,    pct: 1,  color: PURPLE  },
      ],
    };
  },

  computed: {
    currentKpis() {
      return this.kpisByPeriod[this.activePeriod] || this.kpisByPeriod['30d'];
    },
    periodLabel() {
      const map = {
        hoje: 'Hoje',
        '7d': 'Últimos 7 dias',
        '15d': 'Últimos 15 dias',
        '30d': 'Últimos 30 dias',
        '90d': 'Últimos 90 dias',
        custom: `Últimos ${this.customDays} dias`,
      };
      return map[this.activePeriod];
    },
    daysCount() {
      const map = { hoje: 1, '7d': 7, '15d': 15, '30d': 30, '90d': 90, custom: this.customDays };
      return map[this.activePeriod] || 30;
    },
    currentPendentes() {
      return this.pendentesData[this.activePendenteTab];
    },
    mainKpis() {
      const k = this.currentKpis;
      return [
        { label: 'NF-e EMITIDAS',     value: k.nfe.toLocaleString('pt-BR'),   prefix: '',  trend: '+12,4%', trendUp: true,  icon: 'description',       accent: 'k-orange' },
        { label: 'NFC-e EMITIDAS',    value: k.nfce.toLocaleString('pt-BR'),  prefix: '',  trend: '+8,7%',  trendUp: true,  icon: 'receipt',           accent: 'k-green'  },
        { label: 'FATURAMENTO TOTAL', value: k.faturamento,                   prefix: '',  trend: '+10,2%', trendUp: true,  icon: 'attach_money',      accent: 'k-blue'   },
        { label: 'REJEIÇÕES SEFAZ',   value: k.rejeicoes.toLocaleString('pt-BR'), prefix: '', trend: '-3,1%', trendUp: false, icon: 'error',           accent: 'k-red'    },
      ];
    },
    miniKpis() {
      const k = this.currentKpis;
      return [
        { label: 'XMLs Pendentes',      value: k.pendentes,        sub: 'aguardando envio',   icon: 'pending_actions',       color: YELLOW,  urgent: k.pendentes > 5  },
        { label: 'Cancelamentos',       value: k.cancelamentos,    sub: 'no período',          icon: 'cancel',                color: RED,     urgent: false            },
        { label: 'Inutilizações',       value: k.inutilizacoes,    sub: 'de numeração',        icon: 'block',                 color: YELLOW,  urgent: false            },
        { label: 'Contingência',        value: k.contingencia,     sub: 'notas em FS-DA',      icon: 'cloud_off',             color: RED,     urgent: k.contingencia > 0 },
        { label: 'Carta de Correção',   value: k.cce,              sub: 'pendentes envio',     icon: 'edit_document',         color: BLUE,    urgent: false            },
        { label: 'Manifestação Destin.',value: k.manifestacao,     sub: 'aguardando ciência',  icon: 'assignment_turned_in',  color: ACCENT,  urgent: false            },
        { label: 'Cert. Digital',       value: `${this.certDaysLeft}d`, sub: 'para vencer',    icon: 'verified_user',         color: this.certDaysLeft <= 30 ? RED : this.certDaysLeft <= 60 ? YELLOW : GREEN, urgent: this.certDaysLeft <= 30 },
        { label: 'SEFAZ Status',        value: this.sefazOnline ? 'Online' : 'Offline', sub: `${this.sefazUptime}% uptime`, icon: 'cloud_done', color: this.sefazOnline ? GREEN : RED, urgent: !this.sefazOnline },
      ];
    },
    faturamentoData() {
      const n = this.daysCount;
      const labels = genLabels(n);
      const nfe  = genDays(n, 120000, 60000);
      const nfce = genDays(n, 45000, 20000);
      const total = nfe.map((v, i) => v + nfce[i]);
      const mainDs = this.chartFilter === 'total' ? total : this.chartFilter === 'nfe' ? nfe : nfce;
      return {
        labels,
        datasets: [
          {
            label: this.chartFilter === 'total' ? 'Total' : this.chartFilter === 'nfe' ? 'NF-e' : 'NFC-e',
            data: mainDs,
            borderColor: ACCENT,
            backgroundColor: ACCENT + '18',
            fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2,
          },
          ...(this.chartFilter === 'total' ? [{
            label: 'NF-e',
            data: nfe,
            borderColor: BLUE,
            backgroundColor: BLUE + '10',
            fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 1.5, borderDash: [4, 3],
          }] : []),
        ],
      };
    },
    retornosData() {
      const n = Math.min(this.daysCount, 14);
      const labels = genLabels(n);
      return {
        labels,
        datasets: [
          {
            label: 'Autorizadas',
            data: genDays(n, 290, 80),
            backgroundColor: GREEN + '90',
            borderColor: GREEN,
            borderWidth: 1, borderRadius: 4, borderSkipped: false,
          },
          {
            label: 'Rejeitadas',
            data: genDays(n, 8, 6),
            backgroundColor: RED + '90',
            borderColor: RED,
            borderWidth: 1, borderRadius: 4, borderSkipped: false,
          },
        ],
      };
    },
    documentosData() {
      return {
        labels: this.documentosTipos.map(d => d.name),
        datasets: [{
          data: this.documentosTipos.map(d => d.qty),
          backgroundColor: this.documentosTipos.map(d => d.color),
          borderWidth: 0, hoverOffset: 4,
        }],
      };
    },
    lineOptions() {
      return {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true, position: 'bottom',
            labels: { color: TEXT, font: { size: 11 }, padding: 12, boxWidth: 10, boxHeight: 10 },
          },
          tooltip: { ...baseTooltip, callbacks: { label: ctx => ` R$ ${ctx.parsed.y.toLocaleString('pt-BR')}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 10 }, maxTicksLimit: 10 } },
          y: {
            grid: { color: GRID },
            ticks: { color: TEXT, font: { size: 11 }, callback: v => 'R$' + (v / 1000).toFixed(0) + 'k' },
          },
        },
      };
    },
    barOptions() {
      return {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true, position: 'bottom',
            labels: { color: TEXT, font: { size: 11 }, padding: 12, boxWidth: 10, boxHeight: 10 },
          },
          tooltip: { ...baseTooltip },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 10 }, maxTicksLimit: 10 } },
          y: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 11 } } },
        },
      };
    },
    donutOptions() {
      return {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip },
        },
      };
    },
  },

  methods: {
    refreshData() {
      this.lastUpdate = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════ */
.dashboard-root {
  --accent:   #FF8049;
  --accent2:  #FF804915;
  --acc-h:    #E65D26;
  --green:    #16a34a;
  --green2:   #dcfce7;
  --blue:     #2563eb;
  --blue2:    #dbeafe;
  --yellow:   #ca8a04;
  --yellow2:  #fef9c3;
  --red:      #dc2626;
  --red2:     #fee2e2;
  --purple:   #7c3aed;
  --bg:       #f4f6f9;
  --bg-card:  #ffffff;
  --bg-el:    #f1f3f5;
  --bg-el2:   #e9ecef;
  --border:   #e2e8f0;
  --border2:  #cbd5e1;
  --text1:    #1e293b;
  --text2:    #64748b;
  --muted:    #94a3b8;
  --radius:   13px;
  --radius-s: 8px;
  --shadow:   0 4px 12px -2px rgba(0,0,0,0.06), 0 2px 6px -1px rgba(0,0,0,0.03);
  display: flex;
  background: var(--bg);
  color: var(--text1);
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
  font-size: 13.5px;
  min-height: 100vh;
}

/* ══ TOPBAR ══ */
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar {
  position: sticky; top: 0; z-index: 50;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
}
.topbar-brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--accent), #e65d26);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.topbar-title { font-weight: 800; font-size: 16px; letter-spacing: -0.3px; }
.topbar-sub   { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 9px; }

.sefaz-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; font-weight: 700;
  padding: 5px 12px; border-radius: 20px;
}
.sefaz-status.online  { background: var(--green2); color: var(--green); }
.sefaz-status.offline { background: var(--red2);   color: var(--red);   }
.sefaz-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

.cert-chip {
  display: flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 600;
  padding: 5px 12px; border-radius: 20px;
}
.cert-ok     { background: var(--green2); color: var(--green); }
.cert-warn   { background: var(--yellow2);color: var(--yellow);}
.cert-danger { background: var(--red2);   color: var(--red);   }

.tbtn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 13px; border-radius: var(--radius-s);
  border: 1px solid var(--border2); background: var(--bg-card);
  color: var(--text2); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.tbtn:hover { background: var(--bg-el); color: var(--text1); }
.user-avatar {
  width: 31px; height: 31px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ff4d4d);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 11px; color: #fff; flex-shrink: 0;
}

/* ══ CONTENT ══ */
.content { padding: 22px 24px; flex: 1; }

/* ══ FILTER BAR ══ */
.filter-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 18px;
  margin-bottom: 16px; gap: 12px;
  box-shadow: var(--shadow);
}
.filter-left  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-right { display: flex; align-items: center; gap: 8px; }
.filter-label { font-size: 12px; color: var(--text2); font-weight: 500; }
.filter-sub   { font-size: 11.5px; color: var(--muted); }
.filter-sub strong { color: var(--accent); }

.period-tabs {
  display: flex; background: var(--bg-el);
  border: 1px solid var(--border); border-radius: var(--radius-s); padding: 3px; gap: 2px;
}
.ptab {
  padding: 5px 12px; border-radius: 5px; font-size: 11.5px; font-weight: 500;
  cursor: pointer; color: var(--muted); transition: all 0.15s;
  background: transparent; border: none; font-family: inherit; white-space: nowrap;
}
.ptab.active { background: var(--accent); color: #fff; font-weight: 700; }
.ptab:hover:not(.active) { background: var(--bg-el2); color: var(--text1); }

.custom-days {
  display: flex; align-items: center; gap: 7px;
  background: var(--bg-el); border: 1px solid var(--border2);
  border-radius: var(--radius-s); padding: 5px 10px;
}
.days-input {
  width: 54px; border: none; background: transparent;
  font-family: inherit; font-size: 13px; font-weight: 700;
  color: var(--accent); text-align: center; outline: none;
}

/* ══ ALERT BAR ══ */
.alert-bar {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1px solid #ff804340;
  border-radius: var(--radius); padding: 11px 15px;
  font-size: 12.5px; margin-bottom: 18px;
  box-shadow: var(--shadow);
}

/* ══ KPI GRID ══ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 13px; margin-bottom: 13px;
}
.kpi-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 17px 19px;
  position: relative; overflow: hidden; transition: all 0.2s;
  box-shadow: var(--shadow);
}
.kpi-card:hover { border-color: var(--border2); transform: translateY(-1px); }
.kpi-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.kpi-card.k-orange::before { background: linear-gradient(90deg, var(--accent), transparent); }
.kpi-card.k-green::before  { background: linear-gradient(90deg, var(--green),  transparent); }
.kpi-card.k-blue::before   { background: linear-gradient(90deg, var(--blue),   transparent); }
.kpi-card.k-red::before    { background: linear-gradient(90deg, var(--red),    transparent); }
.kpi-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; color: var(--muted);
  display: flex; align-items: center; gap: 4px; margin-bottom: 9px;
}
.kpi-value {
  font-size: 24px; font-weight: 800; letter-spacing: -0.8px;
  color: var(--text1); line-height: 1; margin-bottom: 9px;
}
.kpi-prefix { font-size: 12px; font-weight: 600; }
.kpi-footer { display: flex; align-items: center; gap: 6px; font-size: 11px; }
.kpi-delta  { font-weight: 700; display: flex; align-items: center; gap: 2px; }
.kpi-delta.up   { color: var(--green); }
.kpi-delta.down { color: var(--red);   }
.kpi-sub { color: var(--muted); }
.kpi-bg-icon {
  position: absolute; bottom: 4px; right: 10px;
  font-size: 50px; opacity: 0.05; color: var(--text1);
  pointer-events: none; line-height: 1;
}

/* ══ KPI MINI GRID ══ */
.kpi-mini-grid {
  display: grid; grid-template-columns: repeat(8, 1fr);
  gap: 12px; margin-bottom: 16px;
}
.kpi-mini {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 14px;
  box-shadow: var(--shadow); transition: all 0.2s;
  display: flex; flex-direction: column; gap: 3px;
}
.kpi-mini:hover { transform: translateY(-1px); }
.kpi-mini.mini-urgent {
  border-color: var(--red);
  background: linear-gradient(135deg, #fff, #fee2e205);
}
.kpi-mini-icon {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.kpi-mini-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--muted); }
.kpi-mini-value { font-size: 19px; font-weight: 800; letter-spacing: -0.4px; color: var(--text1); }
.kpi-mini-sub   { font-size: 10px; color: var(--muted); }

/* ══ GRIDS ══ */
.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 14px; }
.grid-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.grid-3   { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }

/* ══ CARD ══ */
.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow);
}
.card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 18px; border-bottom: 1px solid var(--border);
}
.card-title { font-size: 13px; font-weight: 700; letter-spacing: -0.2px; }
.card-sub   { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.card-actions { margin-left: auto; display: flex; gap: 6px; align-items: center; }
.card-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.card-icon .material-symbols-outlined { font-size: 17px !important; }

.c-orange { background: var(--accent2); color: var(--accent); }
.c-green  { background: var(--green2);  color: var(--green);  }
.c-blue   { background: var(--blue2);   color: var(--blue);   }
.c-yellow { background: var(--yellow2); color: var(--yellow); }
.c-red    { background: var(--red2);    color: var(--red);    }

/* ══ CHIPS / TABS ══ */
.chip {
  padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: 500;
  cursor: pointer; color: var(--muted); transition: all 0.15s;
  background: var(--bg-el); border: 1px solid var(--border);
}
.chip.active { background: var(--accent2); color: var(--accent); border-color: var(--accent); }

.tab-group { display: flex; gap: 4px; }
.stab {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--muted); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.stab.active { border-color: var(--accent); color: var(--accent); background: var(--accent2); }
.stab-badge {
  font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 10px; color: #fff;
}
.badge-yellow { background: var(--yellow); }
.badge-orange { background: var(--accent); }
.badge-red    { background: var(--red); }
.badge-blue   { background: var(--blue); }

/* ══ BADGE COUNT ══ */
.badge-count {
  font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 20px; color: #fff;
}
.badge-count.red    { background: var(--red);    }
.badge-count.orange { background: var(--accent); }
.badge-count.blue   { background: var(--blue);   }
.badge-count.yellow { background: var(--yellow); }

/* ══ CHART WRAP ══ */
.chart-wrap { position: relative; width: 100%; padding: 16px 18px; }
.h240 { height: 240px; }
.h200 { height: 200px; }

/* ══ SEFAZ MONITOR ══ */
.sefaz-monitor { padding: 14px 18px; display: flex; flex-direction: column; gap: 14px; }
.sefaz-main-status {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: var(--radius-s);
}
.status-online  { background: var(--green2); color: var(--green); }
.status-offline { background: var(--red2);   color: var(--red);   }
.sefaz-status-label { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }
.sefaz-status-sub   { font-size: 10.5px; opacity: 0.7; margin-top: 1px; }

.sefaz-uf-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
}
.sefaz-uf {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 8px; border-radius: 6px;
  font-size: 11.5px; font-weight: 600;
  border: 1px solid var(--border);
}
.sefaz-uf.uf-on  { background: var(--green2); color: var(--green); border-color: #bbf7d0; }
.sefaz-uf.uf-off { background: var(--red2);   color: var(--red);   border-color: #fecaca; }
.uf-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.uf-ms  { font-size: 9px; margin-left: auto; opacity: 0.7; }

.sefaz-stats {
  display: flex; justify-content: space-around;
  padding: 10px 0; border-top: 1px solid var(--border);
}
.ss-item { text-align: center; }
.ss-val  { font-size: 17px; font-weight: 800; letter-spacing: -0.4px; }
.ss-val.green  { color: var(--green); }
.ss-val.accent { color: var(--accent); }
.ss-val.red    { color: var(--red); }
.ss-lbl  { font-size: 10px; color: var(--muted); margin-top: 2px; }

/* ══ DONUT / CAT LIST ══ */
.donut-wrap { height: 150px; padding: 14px 18px 8px; position: relative; }
.cat-list { padding: 4px 18px 14px; }
.cat-item {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 0; border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.cat-item:last-child { border-bottom: none; }
.cat-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cat-name { flex: 1; color: var(--text2); }
.cat-qty  { font-weight: 700; width: 40px; text-align: right; }
.cat-val  { font-size: 11px; color: var(--muted); width: 40px; text-align: right; }

/* ══ PROGRESS BAR ══ */
.pb-wrap-sm { flex: 1; }
.pb-custom :deep(.p-progressbar) { height: 5px; border-radius: 4px; }
.pb-custom :deep(.p-progressbar-value) { border-radius: 4px; }
.pb-green  :deep(.p-progressbar-value) { background: var(--green);  }
.pb-orange :deep(.p-progressbar-value) { background: var(--accent); }
.pb-yellow :deep(.p-progressbar-value) { background: var(--yellow); }
.pb-red    :deep(.p-progressbar-value) { background: var(--red);    }
.pb-blue   :deep(.p-progressbar-value) { background: var(--blue);   }
.pb-dyn    :deep(.p-progressbar-value) { background: var(--pb-color, var(--accent)); }

/* ══ NUMERAÇÃO ══ */
.numeracao-list { padding: 14px 18px; display: flex; flex-direction: column; gap: 16px; }
.num-item { display: flex; flex-direction: column; gap: 6px; }
.num-header { display: flex; align-items: center; gap: 8px; }
.num-tipo   { font-weight: 700; font-size: 13px; }
.num-serie  { font-size: 10.5px; color: var(--muted); flex: 1; }
.num-pct    { font-size: 12px; font-weight: 700; }
.num-detail { display: flex; gap: 14px; font-size: 11px; color: var(--muted); }
.num-detail strong { color: var(--text2); }
.num-footer {
  display: flex; align-items: center; gap: 6px;
  margin: 0 18px 14px; padding: 8px 12px;
  background: var(--yellow2); border: 1px solid #fef08a;
  border-radius: var(--radius-s);
}

/* ══ DATATABLE ══ */
.dt-custom :deep(.p-datatable-thead > tr > th) {
  background: var(--bg-el); color: var(--text2);
  border-bottom: 2px solid var(--border);
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  padding: 9px 14px;
}
.dt-custom :deep(.p-datatable-tbody > tr) {
  background: var(--bg-card); color: var(--text1);
  border-bottom: 1px solid var(--border);
}
.dt-custom :deep(.p-datatable-tbody > tr:hover) { background: var(--bg-el); }
.dt-custom :deep(.p-datatable-tbody > tr > td) { padding: 9px 14px; }

/* ══ TAG ══ */
.tag-custom { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 12px; }
.tag-green  { background: var(--green2); color: var(--green); }
.tag-orange { background: var(--accent2); color: var(--accent); }
.tag-yellow { background: var(--yellow2); color: var(--yellow); }
.tag-red    { background: var(--red2);   color: var(--red);   }
.tag-blue   { background: var(--blue2);  color: var(--blue);  }

/* ══ CODE BADGE ══ */
.code-badge {
  font-family: 'Courier New', monospace; font-size: 11px; font-weight: 700;
  background: var(--red2); color: var(--red);
  padding: 2px 6px; border-radius: 4px;
}

/* ══ CELL ══ */
.cell-name { font-size: 12.5px; font-weight: 600; color: var(--text1); }
.cell-sub  { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.mono-bold { font-family: 'Courier New', monospace; font-weight: 700; }

/* ══ MINI LIST ══ */
.mini-list { padding: 6px 0; }
.mini-list-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 18px; border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.mini-list-item:hover { background: var(--bg-el); }
.mini-list-item:last-child { border-bottom: none; }
.mli-icon {
  width: 28px; height: 28px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mli-info { flex: 1; min-width: 0; }
.mli-title { font-size: 12.5px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mli-sub   { font-size: 10.5px; color: var(--muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mli-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.mli-time  { font-size: 10px; color: var(--muted); }

/* ══ MANIFESTAÇÃO ══ */
.manifestacao-stats {
  display: flex; justify-content: space-around;
  padding: 12px 18px; border-bottom: 1px solid var(--border);
}
.mstat { text-align: center; }
.mstat-val   { font-size: 20px; font-weight: 800; letter-spacing: -0.4px; }
.mstat-label { font-size: 9.5px; color: var(--muted); margin-top: 2px; }

/* ══ ALERTAS TRIBUTÁRIOS ══ */
.alertas-list { padding: 6px 0; }
.alerta-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 18px; border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.alerta-item:hover { background: var(--bg-el); }
.alerta-item:last-child { border-bottom: none; }
.alerta-item.alerta-urgente {
  background: linear-gradient(90deg, #fee2e210, transparent);
  border-left: 3px solid var(--red);
}
.alerta-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.alerta-info { flex: 1; min-width: 0; }
.alerta-title { font-size: 13px; font-weight: 600; color: var(--text1); }
.alerta-sub   { font-size: 11px; color: var(--muted); margin-top: 1px; }
.alerta-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
.alerta-prazo { font-size: 11.5px; font-weight: 700; }

/* ══ FOOTER ══ */
.dash-footer {
  padding: 14px 24px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--muted);
  background: var(--bg-card);
}

/* ══ RESPONSIVE ══ */
@media (max-width: 1280px) {
  .kpi-grid       { grid-template-columns: repeat(2, 1fr); }
  .kpi-mini-grid  { grid-template-columns: repeat(4, 1fr); }
  .grid-2-1       { grid-template-columns: 1fr; }
  .grid-3         { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .kpi-mini-grid  { grid-template-columns: repeat(2, 1fr); }
  .grid-2         { grid-template-columns: 1fr; }
  .grid-3         { grid-template-columns: 1fr; }
  .topbar { flex-wrap: wrap; gap: 8px; }
  .topbar-right   { flex-wrap: wrap; }
  .sefaz-uf-grid  { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 640px) {
  .kpi-grid       { grid-template-columns: 1fr; }
  .kpi-mini-grid  { grid-template-columns: repeat(2, 1fr); }
  .content        { padding: 14px; }
  .filter-bar     { flex-direction: column; align-items: flex-start; }
  .period-tabs    { flex-wrap: wrap; }
}
</style>