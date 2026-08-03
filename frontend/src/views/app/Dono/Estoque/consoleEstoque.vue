<template>
  <div class="console-root">

    <!-- ══ HEADER ══ -->
    <div class="console-header">
      <div class="ch-left">
        <div class="ch-brand">
          <div class="ch-brand-icon">
            <span class="material-symbols-outlined">warehouse</span>
          </div>
          <div>
            <div class="ch-title">Console de Estoque</div>
            <div class="ch-sub">Market Vizium ERP · Loja #{{ id_loja }}</div>
          </div>
        </div>
      </div>
      <div class="ch-right">
        <div class="ch-sync" :class="loading ? 'syncing' : ''">
          <span class="sync-dot" :class="loading ? 'pulse' : 'live'"></span>
          {{ loading ? 'Atualizando...' : 'Dados ao vivo' }}
        </div>
        <div class="ch-last">
          <span class="material-symbols-outlined" style="font-size:13px">schedule</span>
          Atualizado {{ lastUpdated }}
        </div>
        <button class="btn-refresh" @click="loadAll" :disabled="loading">
          <span class="material-symbols-outlined" :class="loading ? 'spin' : ''">refresh</span>
          Atualizar
        </button>
        <button class="btn-export">
          <span class="material-symbols-outlined">download</span>
          Exportar
        </button>
      </div>
    </div>

    <!-- ══ LOADING STATE ══ -->
    <div v-if="loading && !estoque.length" class="loading-screen">
      <div class="loading-spinner"></div>
      <div class="loading-text">Carregando console de estoque...</div>
    </div>

    <!-- ══ ERROR STATE ══ -->
    <div v-else-if="error" class="error-screen">
      <span class="material-symbols-outlined" style="font-size:48px;color:var(--red)">error_outline</span>
      <div class="error-title">Erro ao carregar dados</div>
      <div class="error-msg">{{ error }}</div>
      <button class="btn-refresh" @click="loadAll">Tentar novamente</button>
    </div>

    <template v-else>

      <!-- ══ SUMMARY BAND ══ -->
      <div class="summary-band">
        <div v-for="s in summaryBand" :key="s.label" class="sb-item">
          <div class="sb-icon" :class="s.cls">
            <span class="material-symbols-outlined">{{ s.icon }}</span>
          </div>
          <div class="sb-body">
            <div class="sb-val" :class="s.valCls">{{ s.value }}</div>
            <div class="sb-label">{{ s.label }}</div>
          </div>
          <div v-if="s.badge" class="sb-badge" :class="s.badgeCls">{{ s.badge }}</div>
        </div>
      </div>

      <!-- ══ MAIN CONTENT ══ -->
      <div class="console-content">

        <!-- ══ ROW 1: KPI CARDS ══ -->
        <div class="kpi-row">
          <div v-for="k in kpiCards" :key="k.label" class="kpi-card" :class="k.cls">
            <div class="kc-header">
              <div class="kc-icon"><span class="material-symbols-outlined">{{ k.icon }}</span></div>
              <div class="kc-trend" :class="k.trendUp ? 'trend-up' : 'trend-down'" v-if="k.trend">
                <span class="material-symbols-outlined" style="font-size:11px">{{ k.trendUp ? 'trending_up' : 'trending_down' }}</span>
                {{ k.trend }}
              </div>
            </div>
            <div class="kc-value">{{ k.value }}</div>
            <div class="kc-label">{{ k.label }}</div>
            <div class="kc-sub">{{ k.sub }}</div>
            <span class="material-symbols-outlined kc-bg-icon">{{ k.icon }}</span>
          </div>
        </div>

        <!-- ══ ROW 2: CHARTS ══ -->
        <div class="chart-row">

          <!-- Distribuição de Status -->
          <div class="card card-sm">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">donut_large</span></div>
              <div>
                <div class="card-title">Distribuição de Status</div>
                <div class="card-sub">Situação atual do estoque</div>
              </div>
            </div>
            <div class="donut-wrap">
              <canvas ref="statusChart" id="statusChart" height="180"></canvas>
              <div class="donut-center">
                <div class="dc-val">{{ totalProdutosAgrupados }}</div>
                <div class="dc-lbl">produtos</div>
              </div>
            </div>
            <div class="status-legend">
              <div v-for="s in statusLegend" :key="s.label" class="sl-item">
                <div class="sl-dot" :style="{ background: s.color }"></div>
                <div class="sl-name">{{ s.label }}</div>
                <div class="sl-val">{{ s.count }}</div>
                <div class="sl-pct">{{ s.pct }}%</div>
              </div>
            </div>
          </div>

          <!-- Movimentação: Entradas vs Saídas -->
          <div class="card card-lg">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">swap_vert</span></div>
              <div>
                <div class="card-title">Movimentação de Estoque</div>
                <div class="card-sub">Entradas vs Saídas por produto</div>
              </div>
              <div class="card-actions">
                <button v-for="f in ['Diário','Semanal','Mensal']" :key="f"
                  class="chip" :class="{ active: movFilter === f }" @click="movFilter = f">{{ f }}</button>
              </div>
            </div>
            <div class="chart-wrap h220">
              <canvas ref="movChart" id="movChart" ></canvas>
            </div>
          </div>

          <!-- Giro de Estoque -->
          <div class="card card-sm">
            <div class="card-head">
              <div class="card-icon c-green"><span class="material-symbols-outlined">loop</span></div>
              <div>
                <div class="card-title">Giro de Estoque</div>
                <div class="card-sub">Velocidade de saída</div>
              </div>
            </div>
            <div class="giro-list">
              <div v-for="g in giroTop" :key="g.cod" class="giro-item">
                <div class="gi-info">
                  <div class="gi-cod">{{ g.cod }}</div>
                  <div class="gi-giro">{{ g.giro }}x/mês</div>
                </div>
                <div class="gi-bar-wrap">
                  <div class="gi-bar" :style="{ width: g.pct+'%', background: g.color }"></div>
                </div>
                <div class="gi-days" :class="g.dayCls">{{ g.days }}d</div>
              </div>
            </div>
            <div class="giro-avg">
              <span class="material-symbols-outlined" style="font-size:14px;color:var(--accent)">insights</span>
              Giro médio geral: <strong>{{ giroMedioGeral }}x/mês</strong>
            </div>
          </div>
        </div>

        <!-- ══ ROW 3: ANÁLISE TEMPORAL ══ -->
        <div class="analysis-row">

          <!-- Projeção de esgotamento -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-red"><span class="material-symbols-outlined">hourglass_bottom</span></div>
              <div>
                <div class="card-title">Projeção de Esgotamento</div>
                <div class="card-sub">Estimativa de quando os produtos vão acabar</div>
              </div>
            </div>
            <div class="esg-table-wrap">
              <table class="esg-table">
                <thead>
                  <tr>
                    <th>PRODUTO</th>
                    <th>QTD. ATUAL</th>
                    <th>SAÍDA/DIA</th>
                    <th>DIAS RESTANTES</th>
                    <th>ESGOTA EM</th>
                    <th>URGÊNCIA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in esgotamentoList" :key="e.cod">
                    <td>
                      <div class="cell-prod">
                        <div class="cp-cod">{{ e.cod }}</div>
                        <div class="cp-lote">Lote: {{ e.lote }}</div>
                      </div>
                    </td>
                    <td><span class="mono-val">{{ e.qtd }}</span></td>
                    <td><span class="mono-val accent">{{ e.saidaDia.toFixed(1) }}</span></td>
                    <td>
                      <div class="dias-bar-wrap">
                        <div class="dias-bar" :style="{ width: Math.min(e.diasPct, 100)+'%', background: e.urgCor }"></div>
                        <span class="dias-val">{{ e.dias }}d</span>
                      </div>
                    </td>
                    <td>
                      <span class="date-chip" :class="e.urgCls">{{ e.dataEsgotamento }}</span>
                    </td>
                    <td>
                      <span class="urg-badge" :class="e.urgCls">
                        <span class="material-symbols-outlined" style="font-size:11px">{{ e.urgIcon }}</span>
                        {{ e.urgLabel }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Métricas Temporais -->
          <div class="card card-metrics">
            <div class="card-head">
              <div class="card-icon c-yellow"><span class="material-symbols-outlined">analytics</span></div>
              <div>
                <div class="card-title">Métricas de Movimentação</div>
                <div class="card-sub">Médias calculadas por produto</div>
              </div>
            </div>
            <div class="metrics-grid">
              <div v-for="m in metricas" :key="m.label" class="metric-block">
                <div class="mb-icon" :class="m.cls">
                  <span class="material-symbols-outlined">{{ m.icon }}</span>
                </div>
                <div class="mb-val">{{ m.value }}</div>
                <div class="mb-label">{{ m.label }}</div>
                <div class="mb-sub">{{ m.sub }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ ROW 4: ALERTAS ══ -->
        <div class="alerts-row">
          <div class="card card-alerts">
            <div class="card-head">
              <div class="card-icon c-red"><span class="material-symbols-outlined">notifications_active</span></div>
              <div>
                <div class="card-title">Central de Alertas</div>
                <div class="card-sub">Itens que requerem atenção imediata</div>
              </div>
              <div class="alert-count-badges">
                <span class="acb red">{{ alertas.filter(a=>a.tipo==='critico').length }} Críticos</span>
                <span class="acb yellow">{{ alertas.filter(a=>a.tipo==='atencao').length }} Atenção</span>
                <span class="acb blue">{{ alertas.filter(a=>a.tipo==='info').length }} Info</span>
              </div>
            </div>
            <div class="alert-list">
              <div v-for="a in alertas" :key="a.id" class="alert-item" :class="a.tipo">
                <div class="ai-icon">
                  <span class="material-symbols-outlined">{{ a.icon }}</span>
                </div>
                <div class="ai-body">
                  <div class="ai-title">{{ a.title }}</div>
                  <div class="ai-desc">{{ a.desc }}</div>
                </div>
                <div class="ai-meta">
                  <span class="ai-tag" :class="a.tipo">{{ a.tag }}</span>
                  <div class="ai-time">{{ a.time }}</div>
                </div>
              </div>
              <div v-if="!alertas.length" class="no-alerts">
                <span class="material-symbols-outlined" style="font-size:32px;color:var(--green)">check_circle</span>
                <div>Nenhum alerta crítico no momento</div>
              </div>
            </div>
          </div>

          <!-- Validades -->
          <div class="card card-validades">
            <div class="card-head">
              <div class="card-icon c-yellow"><span class="material-symbols-outlined">event_busy</span></div>
              <div>
                <div class="card-title">Controle de Validade</div>
                <div class="card-sub">Produtos próximos do vencimento</div>
              </div>
            </div>
            <div class="validade-list">
              <div v-for="v in validadeList" :key="v.cod+v.lote" class="val-item">
                <div class="val-icon" :class="v.cls">
                  <span class="material-symbols-outlined">{{ v.icon }}</span>
                </div>
                <div class="val-info">
                  <div class="val-cod">{{ v.cod }}</div>
                  <div class="val-lote">Lote {{ v.lote }} · {{ v.qtd }} un.</div>
                </div>
                <div class="val-right">
                  <div class="val-date">{{ v.dataFormatada }}</div>
                  <div class="val-dias" :class="v.cls">{{ v.diasLabel }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ ROW 5: TABELA PRINCIPAL ══ -->
        <div class="card table-card">
          <div class="card-head">
            <div class="card-icon c-orange"><span class="material-symbols-outlined">inventory_2</span></div>
            <div>
              <div class="card-title">Monitor de Produtos</div>
              <div class="card-sub">{{ produtosFiltrados.length }} produtos · visão consolidada por código de barras</div>
            </div>
            <div class="table-controls">
              <div class="search-box">
                <span class="material-symbols-outlined sb-icon">search</span>
                <input v-model="busca" placeholder="Buscar por código, lote..." class="search-input" />
                <button v-if="busca" class="sb-clear" @click="busca=''">
                  <span class="material-symbols-outlined" style="font-size:14px">close</span>
                </button>
              </div>
              <div class="filter-chips">
                <button v-for="f in statusFiltros" :key="f.key"
                  class="fchip" :class="{ active: filtroAtivo === f.key, [f.cls]: true }"
                  @click="filtroAtivo = filtroAtivo === f.key ? 'todos' : f.key">
                  <span class="material-symbols-outlined" style="font-size:12px">{{ f.icon }}</span>
                  {{ f.label }}
                  <span class="fchip-count">{{ f.count }}</span>
                </button>
              </div>
              <select v-model="sortKey" class="sort-select">
                <option value="quantidade">Ordenar: Quantidade</option>
                <option value="codigo_barra">Ordenar: Código</option>
                <option value="diasRestantes">Ordenar: Dias Restantes</option>
                <option value="giro">Ordenar: Giro</option>
                <option value="status_estoque">Ordenar: Status</option>
              </select>
              <button class="btn-sort-dir" @click="sortAsc = !sortAsc">
                <span class="material-symbols-outlined" style="font-size:16px">{{ sortAsc ? 'arrow_upward' : 'arrow_downward' }}</span>
              </button>
            </div>
          </div>

          <!-- Tabela -->
          <div class="table-wrap">
            <table class="main-table">
              <thead>
                <tr>
                  <th @click="setSort('codigo_barra')" class="th-sort">
                    CÓDIGO DE BARRAS
                    <span class="material-symbols-outlined sort-arrow" v-if="sortKey==='codigo_barra'">{{ sortAsc?'arrow_upward':'arrow_downward' }}</span>
                  </th>
                  <th @click="setSort('quantidade')" class="th-sort">
                    QTD. TOTAL
                    <span class="material-symbols-outlined sort-arrow" v-if="sortKey==='quantidade'">{{ sortAsc?'arrow_upward':'arrow_downward' }}</span>
                  </th>
                  <th>LOTES</th>
                  <th @click="setSort('status_estoque')" class="th-sort">
                    STATUS ESTOQUE
                    <span class="material-symbols-outlined sort-arrow" v-if="sortKey==='status_estoque'">{{ sortAsc?'arrow_upward':'arrow_downward' }}</span>
                  </th>
                  <th>VALIDADE</th>
                  <th @click="setSort('diasRestantes')" class="th-sort">
                    DIAS REST.
                    <span class="material-symbols-outlined sort-arrow" v-if="sortKey==='diasRestantes'">{{ sortAsc?'arrow_upward':'arrow_downward' }}</span>
                  </th>
                  <th>ENTRADAS</th>
                  <th>SAÍDAS</th>
                  <th @click="setSort('giro')" class="th-sort">
                    GIRO
                    <span class="material-symbols-outlined sort-arrow" v-if="sortKey==='giro'">{{ sortAsc?'arrow_upward':'arrow_downward' }}</span>
                  </th>
                  <th>SALDO</th>
                  <th>RESPONSÁVEL</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!produtosPaginados.length">
                  <td colspan="11" class="empty-row">
                    <span class="material-symbols-outlined" style="font-size:28px;color:var(--muted)">search_off</span>
                    <div>Nenhum produto encontrado</div>
                  </td>
                </tr>
                <tr v-for="p in produtosPaginados" :key="p.codigo_barra" class="prod-row" @click="openDetail(p)">
                  <td>
                    <div class="prod-cod-cell">
                      <div class="pcc-cod">{{ p.codigo_barra }}</div>
                      <div class="pcc-id">ID #{{ p.id_produto }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="qty-badge" :class="p.status_estoque">{{ p.quantidade }}</span>
                    <div class="qty-sub">unid.</div>
                  </td>
                  <td>
                    <div class="lotes-cell">
                      <span v-for="l in p.lotes.slice(0,2)" :key="l" class="lote-chip">{{ l }}</span>
                      <span v-if="p.lotes.length > 2" class="lote-more">+{{ p.lotes.length - 2 }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="status-cell">
                      <div class="status-indicator" :class="p.status_estoque"></div>
                      <div>
                        <div class="status-label" :class="p.status_estoque">{{ statusLabels[p.status_estoque] }}</div>
                        <div class="status-desc">{{ statusDescs[p.status_estoque] }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="val-cell">
                      <div class="vc-date">{{ p.validadeFormatada }}</div>
                      <div class="vc-status" :class="p.validadeStatus">{{ p.validadeLabel }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="dias-cell" :class="p.status_estoque === 'critico' ? 'red' : p.status_estoque === 'minimo' ? 'yellow' : ''">
                      <span class="material-symbols-outlined" style="font-size:13px">{{ p.diasRestantes < 7 ? 'warning' : 'schedule' }}</span>
                      {{ p.diasRestantes >= 9999 ? '∞' : p.diasRestantes + 'd' }}
                    </div>
                  </td>
                  <td>
                    <div class="mov-cell entrada">
                      <span class="material-symbols-outlined" style="font-size:12px">arrow_downward</span>
                      {{ p.totalEntradas }}
                    </div>
                  </td>
                  <td>
                    <div class="mov-cell saida">
                      <span class="material-symbols-outlined" style="font-size:12px">arrow_upward</span>
                      {{ p.totalSaidas }}
                    </div>
                  </td>
                  <td>
                    <div class="giro-cell">
                      <div class="giro-val">{{ p.giro.toFixed(1) }}x</div>
                      <div class="giro-bar-mini">
                        <div class="gbm-fill" :style="{ width: Math.min(p.giroPct,100)+'%', background: p.giro > 2 ? 'var(--green)' : p.giro > 1 ? 'var(--accent)' : 'var(--red)' }"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="saldo-chip" :class="p.saldo >= 0 ? 'pos' : 'neg'">
                      {{ p.saldo >= 0 ? '+' : '' }}{{ p.saldo }}
                    </span>
                  </td>
                  <td>
                    <div class="resp-cell">
                      <div class="rc-avatar">{{ p.responsavel ? p.responsavel[0].toUpperCase() : '?' }}</div>
                      <div class="rc-email">{{ p.responsavel ? p.responsavel.split('@')[0] : '-' }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginação -->
          <div class="pagination">
            <div class="pg-info">
              Mostrando {{ (paginaAtual - 1) * itensPorPagina + 1 }}–{{ Math.min(paginaAtual * itensPorPagina, produtosFiltrados.length) }}
              de {{ produtosFiltrados.length }} produtos
            </div>
            <div class="pg-controls">
              <button class="pg-btn" @click="paginaAtual = 1" :disabled="paginaAtual === 1">
                <span class="material-symbols-outlined">first_page</span>
              </button>
              <button class="pg-btn" @click="paginaAtual--" :disabled="paginaAtual === 1">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button v-for="p in paginasVisiveis" :key="p"
                class="pg-num" :class="{ active: p === paginaAtual }"
                @click="paginaAtual = p">{{ p }}</button>
              <button class="pg-btn" @click="paginaAtual++" :disabled="paginaAtual === totalPaginas">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
              <button class="pg-btn" @click="paginaAtual = totalPaginas" :disabled="paginaAtual === totalPaginas">
                <span class="material-symbols-outlined">last_page</span>
              </button>
            </div>
            <div class="pg-size">
              <select v-model="itensPorPagina" class="sort-select" @change="paginaAtual=1">
                <option :value="10">10/pág</option>
                <option :value="25">25/pág</option>
                <option :value="50">50/pág</option>
              </select>
            </div>
          </div>
        </div>

      </div><!-- /console-content -->

    </template>

    <!-- ══ DETAIL MODAL ══ -->
    <div v-if="produtoDetalhe" class="modal-overlay" @click.self="produtoDetalhe = null">
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-icon c-orange">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <div class="modal-title">Detalhe do Produto</div>
            <div class="modal-sub">{{ produtoDetalhe.codigo_barra }}</div>
          </div>
          <button class="modal-close" @click="produtoDetalhe = null">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="dg-block">
              <div class="dg-label">Quantidade Total</div>
              <div class="dg-val big accent">{{ produtoDetalhe.quantidade }} un.</div>
            </div>
            <div class="dg-block">
              <div class="dg-label">Status de Estoque</div>
              <div class="dg-val"><span class="status-label" :class="produtoDetalhe.status_estoque">{{ statusLabels[produtoDetalhe.status_estoque] }}</span></div>
            </div>
            <div class="dg-block">
              <div class="dg-label">Total Entradas</div>
              <div class="dg-val green">+{{ produtoDetalhe.totalEntradas }}</div>
            </div>
            <div class="dg-block">
              <div class="dg-label">Total Saídas</div>
              <div class="dg-val red">-{{ produtoDetalhe.totalSaidas }}</div>
            </div>
            <div class="dg-block">
              <div class="dg-label">Giro de Estoque</div>
              <div class="dg-val">{{ produtoDetalhe.giro.toFixed(2) }}x / mês</div>
            </div>
            <div class="dg-block">
              <div class="dg-label">Dias Restantes</div>
              <div class="dg-val" :class="produtoDetalhe.diasRestantes < 7 ? 'red' : ''">
                {{ produtoDetalhe.diasRestantes >= 9999 ? 'Indefinido' : produtoDetalhe.diasRestantes + ' dias' }}
              </div>
            </div>
          </div>
          <div class="detail-lotes">
            <div class="dl-title">Lotes no Estoque</div>
            <div class="dl-list">
              <div v-for="item in produtoDetalhe.itens" :key="item.lote+item.data_validade" class="dl-item">
                <span class="dl-lote">{{ item.lote }}</span>
                <span class="dl-qty">{{ item.quantidade }} un.</span>
                <span class="dl-val">Val: {{ formatDate(item.data_validade) }}</span>
                <span class="tag-r" :class="item.status === 'vencido' ? 'tag-red' : 'tag-green'">{{ item.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ChartJS from 'chart.js/auto';
import { api } from '@/services/api';

const ACCENT  = '#FF8049';
const GREEN   = '#16a34a';
const BLUE    = '#2563eb';
const RED     = '#dc2626';
const YELLOW  = '#ca8a04';
const GRID    = '#e2e8f020';
const TEXT    = '#64748b';

const EST_MINIMO  = 10;
const EST_CRITICO = 5;
const EST_EXCESSO = 100;

export default defineComponent({
  name: 'ConsoleEstoque',

  props: {
    id_loja: { type: [Number, String], default: 1 },
  },

  data() {
    return {
      loading: false,
      error: null,
      lastUpdated: '--:--',

      // Raw data
      estoqueRaw:  [],
      entradasRaw: [],
      saidasRaw:   [],

      // Table
      busca: '',
      filtroAtivo: 'todos',
      sortKey: 'quantidade',
      sortAsc: false,
      paginaAtual: 1,
      itensPorPagina: 10,
      movFilter: 'Diário',

      // Modal
      produtoDetalhe: null,

      // Chart refs
      _charts: {},

      statusLabels: {
        ok:      'Estoque OK',
        minimo:  'Estoque Mínimo',
        critico: 'Estoque Crítico',
        excesso: 'Estoque Excessivo',
        zerado:  'Sem Estoque',
      },
      statusDescs: {
        ok:      'Dentro do ideal',
        minimo:  `Abaixo de ${EST_MINIMO} un.`,
        critico: `Abaixo de ${EST_CRITICO} un.`,
        excesso: `Acima de ${EST_EXCESSO} un.`,
        zerado:  'Produto zerado',
      },
    };
  },

  computed: {
    // ── Agrupa estoque por codigo_barra ──
    estoque() {
      const map = {};
      for (const item of this.estoqueRaw) {
        if (!map[item.codigo_barra]) {
          map[item.codigo_barra] = {
            codigo_barra: item.codigo_barra,
            id_produto: item.id_produto,
            id_estoque: item.id_estoque,
            id_loja: item.id_loja,
            quantidade: 0,
            responsavel: item.responsavel,
            itens: [],
            lotes: [],
          };
        }
        map[item.codigo_barra].quantidade += item.quantidade;
        map[item.codigo_barra].itens.push(item);
        if (!map[item.codigo_barra].lotes.includes(item.lote)) {
          map[item.codigo_barra].lotes.push(item.lote);
        }
        // manter validade mais próxima
        if (!map[item.codigo_barra].data_validade ||
          Number(item.data_validade) < Number(map[item.codigo_barra].data_validade)) {
          map[item.codigo_barra].data_validade = item.data_validade;
          map[item.codigo_barra].status = item.status;
        }
      }
      return Object.values(map).map(p => this.enriquecerProduto(p));
    },

    totalProdutosAgrupados() { return this.estoque.length; },

    // Entradas e saídas agrupadas por codigo_barra
    entradasPorCod() {
      const map = {};
      for (const e of this.entradasRaw) {
        if (!map[e.codigo_barra]) map[e.codigo_barra] = [];
        map[e.codigo_barra].push(e);
      }
      return map;
    },
    saidasPorCod() {
      const map = {};
      for (const s of this.saidasRaw) {
        if (!map[s.codigo_barra]) map[s.codigo_barra] = [];
        map[s.codigo_barra].push(s);
      }
      return map;
    },

    // ── SUMMARY BAND ──
    summaryBand() {
      const total = this.estoque.length;
      const ok      = this.estoque.filter(p => p.status_estoque === 'ok').length;
      const minimo  = this.estoque.filter(p => p.status_estoque === 'minimo').length;
      const critico = this.estoque.filter(p => p.status_estoque === 'critico').length;
      const excesso = this.estoque.filter(p => p.status_estoque === 'excesso').length;
      const totalUn = this.estoque.reduce((s,p) => s + p.quantidade, 0);
      const vencidos = this.estoqueRaw.filter(i => i.status === 'vencido').length;
      return [
        { icon: 'inventory_2',   cls: 'c-orange', label: 'Total de Produtos', value: total,    valCls: 'accent' },
        { icon: 'check_circle',  cls: 'c-green',  label: 'Estoque OK',        value: ok,       valCls: 'green'  },
        { icon: 'warning',       cls: 'c-yellow', label: 'Estoque Mínimo',    value: minimo,   valCls: 'yellow', badge: minimo > 0 ? '!' : null, badgeCls: 'yellow' },
        { icon: 'error',         cls: 'c-red',    label: 'Estoque Crítico',   value: critico,  valCls: 'red',    badge: critico > 0 ? '!' : null, badgeCls: 'red'    },
        { icon: 'expand_circle_down', cls: 'c-blue', label: 'Excesso',        value: excesso,  valCls: 'blue'   },
        { icon: 'layers',        cls: 'c-orange', label: 'Total de Unidades', value: totalUn,  valCls: '' },
        { icon: 'event_busy',    cls: 'c-red',    label: 'Lotes Vencidos',    value: vencidos, valCls: vencidos > 0 ? 'red' : 'green', badge: vencidos > 0 ? vencidos : null, badgeCls: 'red' },
      ];
    },

    // ── KPI CARDS ──
    kpiCards() {
      const totalEnt = this.entradasRaw.reduce((s,e) => s+e.quantidade, 0);
      const totalSai = this.saidasRaw.reduce((s,e) => s+e.quantidade, 0);
      const saldo    = totalEnt - totalSai;
      const diasCalc = this.diasDesdePrimeiro();
      const entDia   = diasCalc > 0 ? (totalEnt / diasCalc).toFixed(1) : '—';
      const saiDia   = diasCalc > 0 ? (totalSai / diasCalc).toFixed(1) : '—';
      const giroMed  = this.giroMedioGeral;
      return [
        { icon: 'arrow_downward', cls: 'kc-green',  label: 'Total Entradas',   value: totalEnt, sub: `${entDia} un/dia em média`,   trend: null },
        { icon: 'arrow_upward',   cls: 'kc-red',    label: 'Total Saídas',     value: totalSai, sub: `${saiDia} un/dia em média`,   trend: null },
        { icon: 'balance',        cls: 'kc-blue',   label: 'Saldo Líquido',    value: saldo >= 0 ? '+'+saldo : saldo, sub: 'Entradas menos saídas',    trend: null },
        { icon: 'loop',           cls: 'kc-orange', label: 'Giro Médio',       value: giroMed+'x', sub: 'Rotatividade por mês',        trend: null },
      ];
    },

    // ── STATUS LEGEND DONUT ──
    statusLegend() {
      const counts = { ok:0, minimo:0, critico:0, excesso:0, zerado:0 };
      this.estoque.forEach(p => { counts[p.status_estoque]++ });
      const total = this.estoque.length || 1;
      return [
        { label: 'OK',       color: GREEN,  count: counts.ok,      pct: ((counts.ok/total)*100).toFixed(0) },
        { label: 'Mínimo',   color: YELLOW, count: counts.minimo,  pct: ((counts.minimo/total)*100).toFixed(0) },
        { label: 'Crítico',  color: RED,    count: counts.critico, pct: ((counts.critico/total)*100).toFixed(0) },
        { label: 'Excesso',  color: BLUE,   count: counts.excesso, pct: ((counts.excesso/total)*100).toFixed(0) },
        { label: 'Zerado',   color: '#94a3b8', count: counts.zerado, pct: ((counts.zerado/total)*100).toFixed(0) },
      ];
    },

    // ── GIRO TOP ──
    giroTop() {
      const sorted = [...this.estoque].sort((a,b) => b.giro - a.giro).slice(0,6);
      const maxGiro = sorted[0]?.giro || 1;
      return sorted.map(p => ({
        cod:   p.codigo_barra,
        giro:  p.giro.toFixed(1),
        days:  p.diasRestantes >= 9999 ? '∞' : p.diasRestantes,
        pct:   (p.giro / maxGiro) * 100,
        color: p.giro > 2 ? GREEN : p.giro > 1 ? ACCENT : RED,
        dayCls: p.diasRestantes < 7 ? 'red' : p.diasRestantes < 30 ? 'yellow' : 'green',
      }));
    },

    giroMedioGeral() {
      if (!this.estoque.length) return '0.0';
      const avg = this.estoque.reduce((s,p) => s+p.giro, 0) / this.estoque.length;
      return avg.toFixed(1);
    },

    // ── ESGOTAMENTO ──
    esgotamentoList() {
      return this.estoque
        .filter(p => p.saidaDia > 0)
        .sort((a,b) => a.diasRestantes - b.diasRestantes)
        .slice(0, 8)
        .map(p => {
          const dias = p.diasRestantes;
          const dataEsg = dias < 9999
            ? new Date(Date.now() + dias * 86400000).toLocaleDateString('pt-BR')
            : 'Indefinido';
          const urgCls   = dias < 7 ? 'critico' : dias < 30 ? 'minimo' : 'ok';
          const urgLabel = dias < 7 ? 'Urgente' : dias < 30 ? 'Atenção' : 'Normal';
          const urgIcon  = dias < 7 ? 'error' : dias < 30 ? 'warning' : 'check_circle';
          const urgCor   = dias < 7 ? RED : dias < 30 ? YELLOW : GREEN;
          return {
            cod: p.codigo_barra,
            lote: p.lotes[0] || '-',
            qtd: p.quantidade,
            saidaDia: p.saidaDia,
            dias,
            diasPct: Math.min((dias / 60) * 100, 100),
            dataEsgotamento: dataEsg,
            urgCls, urgLabel, urgIcon, urgCor,
          };
        });
    },

    // ── MÉTRICAS ──
    metricas() {
      const dias  = this.diasDesdePrimeiro() || 1;
      const semanas = dias / 7;
      const meses  = dias / 30;
      const totalEnt = this.entradasRaw.reduce((s,e) => s+e.quantidade, 0);
      const totalSai = this.saidasRaw.reduce((s,s2) => s+s2.quantidade, 0);
      return [
        { icon: 'today',      cls: 'c-blue',   label: 'Entradas / Dia',    value: (totalEnt/dias).toFixed(1),    sub: 'unidades/dia' },
        { icon: 'date_range', cls: 'c-blue',   label: 'Entradas / Semana', value: (totalEnt/semanas).toFixed(1), sub: 'unidades/semana' },
        { icon: 'calendar_month', cls: 'c-blue', label: 'Entradas / Mês',  value: (totalEnt/meses).toFixed(1),   sub: 'unidades/mês' },
        { icon: 'today',      cls: 'c-red',    label: 'Saídas / Dia',      value: (totalSai/dias).toFixed(1),    sub: 'unidades/dia' },
        { icon: 'date_range', cls: 'c-red',    label: 'Saídas / Semana',   value: (totalSai/semanas).toFixed(1), sub: 'unidades/semana' },
        { icon: 'calendar_month', cls: 'c-red', label: 'Saídas / Mês',    value: (totalSai/meses).toFixed(1),   sub: 'unidades/mês' },
      ];
    },

    // ── ALERTAS ──
    alertas() {
      const list = [];
      let id = 0;
      this.estoque.forEach(p => {
        if (p.status_estoque === 'critico') {
          list.push({ id: id++, tipo: 'critico', icon: 'error', title: `Estoque crítico: ${p.codigo_barra}`, desc: `Apenas ${p.quantidade} unidades restantes · reposição urgente`, tag: 'Crítico', time: 'Agora' });
        }
        if (p.status_estoque === 'zerado') {
          list.push({ id: id++, tipo: 'critico', icon: 'remove_shopping_cart', title: `Produto zerado: ${p.codigo_barra}`, desc: 'Sem unidades em estoque · ruptura de estoque', tag: 'Ruptura', time: 'Agora' });
        }
        if (p.diasRestantes < 7 && p.diasRestantes < 9999) {
          list.push({ id: id++, tipo: 'atencao', icon: 'hourglass_bottom', title: `Esgota em breve: ${p.codigo_barra}`, desc: `Estimativa de ${p.diasRestantes} dias de estoque`, tag: 'Esgotamento', time: 'Hoje' });
        }
        if (p.status_estoque === 'excesso') {
          list.push({ id: id++, tipo: 'info', icon: 'expand_circle_down', title: `Excesso: ${p.codigo_barra}`, desc: `${p.quantidade} unidades · capital imobilizado`, tag: 'Excesso', time: 'Agora' });
        }
      });
      this.estoqueRaw.forEach(item => {
        if (item.status === 'vencido') {
          list.push({ id: id++, tipo: 'atencao', icon: 'event_busy', title: `Lote vencido: ${item.codigo_barra}`, desc: `Lote ${item.lote} · ${item.quantidade} un. vencidas`, tag: 'Vencido', time: 'Agora' });
        }
      });
      return list.slice(0, 12);
    },

    // ── VALIDADE LIST ──
    validadeList() {
      const agora = Date.now();
      return [...this.estoqueRaw]
        .filter(i => i.data_validade)
        .sort((a,b) => Number(a.data_validade) - Number(b.data_validade))
        .slice(0, 8)
        .map(i => {

          console.log(i)
          const diff = Number(i.data_validade) - agora;
          const dias = Math.floor(diff / 86400000);
          const vencido = dias < 0;
          const proxVenc = dias >= 0 && dias < 30;
          return {
            cod: i.codigo_barra,
            lote: i.lote,
            qtd: i.quantidade,
            dataFormatada: this.formatDate(i.data_validade),
            diasLabel: vencido ? 'Vencido há '+Math.abs(dias)+'d' : dias === 0 ? 'Vence hoje!' : 'Vence em '+dias+'d',
            cls:  vencido ? 'red' : proxVenc ? 'yellow' : 'green',
            icon: vencido ? 'error' : proxVenc ? 'warning' : 'check_circle',
          };
        });
    },

    // ── STATUS FILTROS ──
    statusFiltros() {
      return [
        { key: 'ok',      label: 'OK',       icon: 'check_circle', cls: 'green',  count: this.estoque.filter(p=>p.status_estoque==='ok').length },
        { key: 'minimo',  label: 'Mínimo',   icon: 'warning',      cls: 'yellow', count: this.estoque.filter(p=>p.status_estoque==='minimo').length },
        { key: 'critico', label: 'Crítico',  icon: 'error',        cls: 'red',    count: this.estoque.filter(p=>p.status_estoque==='critico').length },
        { key: 'excesso', label: 'Excesso',  icon: 'expand_circle_down', cls: 'blue', count: this.estoque.filter(p=>p.status_estoque==='excesso').length },
      ];
    },

    // ── TABELA FILTRADA ──
    produtosFiltrados() {
      let list = [...this.estoque];
      if (this.filtroAtivo !== 'todos') list = list.filter(p => p.status_estoque === this.filtroAtivo);
      if (this.busca.trim()) {
        const q = this.busca.toLowerCase();
        list = list.filter(p =>
          p.codigo_barra.toLowerCase().includes(q) ||
          p.lotes.some(l => l.toLowerCase().includes(q)) ||
          (p.responsavel && p.responsavel.toLowerCase().includes(q))
        );
      }
      list.sort((a,b) => {
        const va = a[this.sortKey] ?? 0;
        const vb = b[this.sortKey] ?? 0;
        return this.sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
      return list;
    },

    produtosPaginados() {
      const s = (this.paginaAtual - 1) * this.itensPorPagina;
      return this.produtosFiltrados.slice(s, s + this.itensPorPagina);
    },

    totalPaginas() {
      return Math.max(1, Math.ceil(this.produtosFiltrados.length / this.itensPorPagina));
    },

    paginasVisiveis() {
      const pages = [];
      const max = this.totalPaginas;
      const curr = this.paginaAtual;
      for (let i = Math.max(1, curr-2); i <= Math.min(max, curr+2); i++) pages.push(i);
      return pages;
    },
  },

  watch: {
    busca()         { this.paginaAtual = 1; },
    filtroAtivo()   { this.paginaAtual = 1; },
    movFilter()     { this.$nextTick(() => this.updateMovChart()); },
    estoque(newVal) { if (newVal.length) this.$nextTick(() => this.initCharts()); },
  },

  mounted() {
    this.loadAll();
  },

  beforeUnmount() {
    Object.values(this._charts).forEach(c => c && c.destroy());
  },

  methods: {
    async loadAll() {
      this.loading = true;
      this.error   = null;
      try {
        const [estoqueRes, entradasRes, saidasRes] = await Promise.all([
          api.get(`/mvpu/estoque/consultarEstoque/${this.id_loja}?id_loja=${this.id_loja}`),
          api.get(`/mvpu/estoque/historicoEntradas/${this.id_loja}?id_loja=${this.id_loja}`),
          api.get(`/mvpu/estoque/historicoSaidas/${this.id_loja}?id_loja=${this.id_loja}`),
        ]);

        console.log(estoqueRes.data.data, "AA")
        const [est, ent, sai] = await Promise.all([estoqueRes.data.data, entradasRes.data.data, saidasRes.data.data]);
        this.estoqueRaw  = est.data  || [];
        this.entradasRaw = ent.data  || [];
        this.saidasRaw   = sai.data  || [];
        this.lastUpdated = new Date().toLocaleTimeString('pt-BR');
        this.loadMock(); //Vou rodar o mock aqui só enquanto ainda não calibrei a integração com o backend
        await this.$nextTick();
        this.initCharts();
      } catch (err) {
        this.error = err.message || 'Erro desconhecido ao carregar dados';
        // Carregar dados mock para desenvolvimento
        console.log("MOCK AI", err)
        this.loadMock();
      } finally {
        this.loading = false;
      }
    },

    loadMock() {
      this.estoqueRaw = [
        { codigo_barra:'7894561230015', id_produto:7,  id_estoque:1, quantidade:45,  lote:'APLJK45', data_validade:'1774407600000', status:'vencido',   responsavel:'admin@loja.com', id_loja:1 },
        { codigo_barra:'1165165456',    id_produto:1,  id_estoque:1, quantidade:15,  lote:'84512',   data_validade:'1753481462954', status:'vencido',   responsavel:'op1@loja.com',   id_loja:1 },
        { codigo_barra:'1165165456',    id_produto:1,  id_estoque:1, quantidade:20,  lote:'84512',   data_validade:'1753481462954', status:'vencido',   responsavel:'op1@loja.com',   id_loja:1 },
        { codigo_barra:'7894561230013', id_produto:3,  id_estoque:1, quantidade:8,   lote:'abcabc',  data_validade:'1793481462954', status:'ativo',     responsavel:'admin@loja.com', id_loja:1 },
        { codigo_barra:'7894561230011', id_produto:5,  id_estoque:1, quantidade:3,   lote:null,      data_validade:null,            status:'ativo',     responsavel:'op2@loja.com',   id_loja:1 },
        { codigo_barra:'15645915459',   id_produto:8,  id_estoque:1, quantidade:120, lote:'84512',   data_validade:'1793481462954', status:'ativo',     responsavel:'admin@loja.com', id_loja:1 },
        { codigo_barra:'9988776655443', id_produto:10, id_estoque:1, quantidade:0,   lote:'LOT001',  data_validade:'1793481462954', status:'ativo',     responsavel:'op3@loja.com',   id_loja:1 },
      ];
      this.entradasRaw = [
        { codigo_barra:'1165165456',    quantidade:20, lote:'84512',  data_validade:'1753481462954', data_operacao:'1754076096200', responsavel:'op1@loja.com' },
        { codigo_barra:'1165165456',    quantidade:20, lote:'84512',  data_validade:'1753481462954', data_operacao:'1754076098690', responsavel:'op1@loja.com' },
        { codigo_barra:'1165165456',    quantidade:20, lote:'84512',  data_validade:'1753481462954', data_operacao:'1750076096200', responsavel:'op1@loja.com' },
        { codigo_barra:'15645915459',   quantidade:8,  lote:'84512',  data_validade:'1793481462954', data_operacao:'1754076126835', responsavel:'op1@loja.com' },
        { codigo_barra:'7894561230013', quantidade:50, lote:'abcabc', data_validade:'1793481462954', data_operacao:'1754076096200', responsavel:'admin@loja.com' },
        { codigo_barra:'7894561230011', quantidade:30, lote:null,     data_validade:null,            data_operacao:'1754076096200', responsavel:'op2@loja.com' },
        { codigo_barra:'15645915459',   quantidade:150,lote:'84512',  data_validade:'1793481462954', data_operacao:'1750076126835', responsavel:'admin@loja.com' },
        { codigo_barra:'7894561230015', quantidade:60, lote:'APLJK45',data_validade:'1774407600000', data_operacao:'1754076096200', responsavel:'admin@loja.com' },
      ];
      this.saidasRaw = [
        { codigo_barra:'7894561230013', quantidade:10, lote:'abcabc', data_validade:'1793481462954', data_operacao:'1754701778261', responsavel:'admin@loja.com' },
        { codigo_barra:'7894561230011', quantidade:15, lote:null,     data_validade:null,            data_operacao:'1754701778261', responsavel:'admin@loja.com' },
        { codigo_barra:'7894561230013', quantidade:10, lote:'abcabc', data_validade:'1793481462954', data_operacao:'1754701830408', responsavel:'admin@loja.com' },
        { codigo_barra:'7894561230011', quantidade:15, lote:null,     data_validade:null,            data_operacao:'1754701830408', responsavel:'admin@loja.com' },
        { codigo_barra:'15645915459',   quantidade:42, lote:'84512',  data_validade:'1793481462954', data_operacao:'1754704550582', responsavel:'admin@loja.com' },
        { codigo_barra:'7894561230011', quantidade:15, lote:null,     data_validade:null,            data_operacao:'1754704550582', responsavel:'admin@loja.com' },
        { codigo_barra:'15645915459',   quantidade:1,  lote:'84512',  data_validade:'1793481462954', data_operacao:'1754804550582', responsavel:'admin@loja.com' },
        { codigo_barra:'1165165456',    quantidade:25, lote:'84512',  data_validade:'1753481462954', data_operacao:'1754704550582', responsavel:'op1@loja.com' },
      ];
      this.lastUpdated = new Date().toLocaleTimeString('pt-BR') + ' (mock)';
      this.error = null;
      this.$nextTick(() => this.initCharts());
    },

    enriquecerProduto(p) {
      // Status de estoque
      let status_estoque = 'ok';
      if (p.quantidade <= 0)         status_estoque = 'zerado';
      else if (p.quantidade <= EST_CRITICO) status_estoque = 'critico';
      else if (p.quantidade <= EST_MINIMO)  status_estoque = 'minimo';
      else if (p.quantidade >= EST_EXCESSO) status_estoque = 'excesso';

      // Entradas e saídas
      const entradas = (this.entradasPorCod[p.codigo_barra] || []);
      const saidas   = (this.saidasPorCod[p.codigo_barra]   || []);
      const totalEntradas = entradas.reduce((s,e) => s+e.quantidade, 0);
      const totalSaidas   = saidas.reduce((s,e) => s+e.quantidade, 0);
      const saldo = totalEntradas - totalSaidas;

      // Saída/dia
      const dias  = this.diasDesdePrimeiro();
      const saidaDia = dias > 0 ? totalSaidas / dias : 0;

      // Dias restantes até esgotamento
      const diasRestantes = saidaDia > 0 ? Math.round(p.quantidade / saidaDia) : 9999;

      // Giro: rotatividade mensal = saídas / (estoque médio estimado)
      const estoqueInicial = p.quantidade + totalSaidas;
      const estoqMedio = ((estoqueInicial + p.quantidade) / 2) || 1;
      const meses = dias / 30 || 1;
      const giro = totalSaidas / estoqMedio / meses;
      const giroPct = Math.min((giro / 3) * 100, 100);

      // Validade
      const validadeFormatada = p.data_validade ? this.formatDate(p.data_validade) : 'S/validade';
      const agora = Date.now();
      const diffVal = p.data_validade ? (Number(p.data_validade) - agora) : Infinity;
      const diasVal = Math.floor(diffVal / 86400000);
      const validadeStatus = !p.data_validade ? 'sem' : diasVal < 0 ? 'vencido' : diasVal < 30 ? 'proximo' : 'ok';
      const validadeLabel  = !p.data_validade ? 'S/ validade' : diasVal < 0 ? 'Vencido' : diasVal < 30 ? `${diasVal}d restantes` : 'Válido';

      return {
        ...p,
        status_estoque,
        totalEntradas,
        totalSaidas,
        saldo,
        saidaDia,
        diasRestantes,
        giro,
        giroPct,
        validadeFormatada,
        validadeStatus,
        validadeLabel,
      };
    },

    diasDesdePrimeiro() {
      const todas = [...this.entradasRaw, ...this.saidasRaw];
      if (!todas.length) return 30;
      const datas = todas.map(e => Number(e.data_operacao)).filter(Boolean);
      if (!datas.length) return 30;
      const min = Math.min(...datas);
      return Math.max(1, Math.ceil((Date.now() - min) / 86400000));
    },

    formatDate(ts) {
      if (!ts) return '-';
      return new Date(Number(ts)).toLocaleDateString('pt-BR');
    },

    setSort(key) {
      if (this.sortKey === key) this.sortAsc = !this.sortAsc;
      else { this.sortKey = key; this.sortAsc = false; }
    },

    openDetail(p) { this.produtoDetalhe = p; },

    // ── CHARTS ──
    initCharts() {
      this.buildStatusChart();
      this.buildMovChart();
    },

    buildStatusChart() {
      const ctx = document.getElementById('statusChart');
      if (!ctx) return;
      if (this._charts.status) { this._charts.status.destroy(); }
      const legend = this.statusLegend;
      this._charts.status = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: legend.map(l => l.label),
          datasets: [{ data: legend.map(l => l.count || 0.01), backgroundColor: [GREEN, YELLOW, RED, BLUE, '#94a3b8'], borderWidth: 0, hoverOffset: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} produtos` } } },
        },
      });
    },

    buildMovChart() {
      const canvas = document.getElementById('movChart');
      if (!canvas) return;

      // Busca uma instância existente no canvas, independente da sua variável
      const existingChart = ChartJS.getChart(canvas); 
      if (existingChart) {
          existingChart.destroy();
      }
      const prods = this.estoque.slice(0, 7).map(p => p.codigo_barra.slice(-6));
      const entradas = this.estoque.slice(0, 7).map(p => {
        const f = this.movFilter;
        if (f === 'Diário')   return +(p.totalEntradas / this.diasDesdePrimeiro()).toFixed(1);
        if (f === 'Semanal')  return +(p.totalEntradas / (this.diasDesdePrimeiro()/7)).toFixed(1);
        return +(p.totalEntradas / (this.diasDesdePrimeiro()/30)).toFixed(1);
      });
      const saidas = this.estoque.slice(0, 7).map(p => {
        const f = this.movFilter;
        if (f === 'Diário')   return +(p.totalSaidas / this.diasDesdePrimeiro()).toFixed(1);
        if (f === 'Semanal')  return +(p.totalSaidas / (this.diasDesdePrimeiro()/7)).toFixed(1);
        return +(p.totalSaidas / (this.diasDesdePrimeiro()/30)).toFixed(1);
      });

      console.log("UEEEPAAA", saidas, entradas)

      this._charts.mov = new ChartJS(canvas, {
        type: 'bar',
        data: {
          labels: prods,
          datasets: [
            { label: 'Entradas', data: entradas, backgroundColor: GREEN+'99',  borderRadius: 4 },
            { label: 'Saídas',   data: saidas,   backgroundColor: RED+'99',    borderRadius: 4 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom', labels: { color: TEXT, font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 10 } } },
            y: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 10 } } },
          },
        },
      });
    },

    updateMovChart() {
      this.buildMovChart();
    },
  },
});
</script>

<style scoped>
/* ══════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════ */
.console-root {
  --accent:    #FF8049;
  --accent2:   #FF804912;
  --acc-h:     #E65D26;
  --green:     #16a34a;
  --green2:    #dcfce7;
  --blue:      #2563eb;
  --blue2:     #dbeafe;
  --yellow:    #ca8a04;
  --yellow2:   #fef9c3;
  --red:       #dc2626;
  --red2:      #fee2e2;
  --bg:        #f4f6f9;
  --bg-card:   #ffffff;
  --bg-el:     #f1f3f5;
  --bg-el2:    #e8eaed;
  --border:    #e2e8f0;
  --text1:     #1e293b;
  --text2:     #475569;
  --muted:     #94a3b8;
  --radius:    14px;
  --radius-s:  8px;
  --shadow:    0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.07);

  font-family: 'DM Sans', 'Inter', 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text1);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* ══ HEADER ══ */
.console-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 0 var(--border), 0 2px 8px rgba(0,0,0,0.04);
}
.ch-left  { display: flex; align-items: center; gap: 16px; }
.ch-brand { display: flex; align-items: center; gap: 12px; }
.ch-brand-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, var(--accent), #ff6020);
  border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(255,128,73,0.35);
}
.ch-brand-icon .material-symbols-outlined { font-size: 20px; }
.ch-title  { font-size: 17px; font-weight: 800; color: var(--text1); letter-spacing: -0.4px; }
.ch-sub    { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.ch-right  { display: flex; align-items: center; gap: 10px; }
.ch-sync   { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--muted); padding: 5px 10px; background: var(--bg-el); border-radius: 20px; }
.sync-dot  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.sync-dot.live    { background: var(--green); box-shadow: 0 0 0 2px rgba(22,163,74,0.25); }
.sync-dot.pulse   { background: var(--accent); animation: pulse 1s infinite; }
.ch-last   { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--muted); }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }

.btn-refresh, .btn-export {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: var(--radius-s);
  font-size: 12.5px; font-weight: 600;
  cursor: pointer; border: none; font-family: inherit;
  transition: all 0.15s;
}
.btn-refresh { background: var(--accent2); color: var(--accent); border: 1px solid var(--accent); }
.btn-refresh:hover { background: var(--accent); color: white; }
.btn-refresh:disabled { opacity: 0.5; cursor: default; }
.btn-export  { background: var(--bg-el); color: var(--text2); border: 1px solid var(--border); }
.btn-export:hover { background: var(--bg-el2); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ LOADING / ERROR ══ */
.loading-screen, .error-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
  padding: 80px 24px;
}
.loading-spinner {
  width: 44px; height: 44px; border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}
.loading-text { font-size: 14px; color: var(--muted); font-weight: 500; }
.error-title  { font-size: 17px; font-weight: 700; color: var(--text1); }
.error-msg    { font-size: 13px; color: var(--muted); text-align: center; }

/* ══ SUMMARY BAND ══ */
.summary-band {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 12px 28px;
  display: flex; gap: 0;
  overflow-x: auto;
}
.sb-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 20px;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  position: relative;
}
.sb-item:last-child { border-right: none; }
.sb-icon {
  width: 32px; height: 32px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.sb-icon .material-symbols-outlined { font-size: 17px; }
.sb-val   { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: var(--text1); }
.sb-label { font-size: 10.5px; color: var(--muted); margin-top: 1px; font-weight: 500; }
.sb-badge {
  position: absolute; top: 6px; right: 10px;
  width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 800; color: white;
}
.sb-badge.red    { background: var(--red); }
.sb-badge.yellow { background: var(--yellow); }

/* Color helpers */
.c-orange { background: var(--accent2); color: var(--accent); }
.c-green  { background: var(--green2);  color: var(--green);  }
.c-blue   { background: var(--blue2);   color: var(--blue);   }
.c-red    { background: var(--red2);    color: var(--red);    }
.c-yellow { background: var(--yellow2); color: var(--yellow); }

.accent { color: var(--accent); }
.green  { color: var(--green);  }
.red    { color: var(--red);    }
.blue   { color: var(--blue);   }
.yellow { color: var(--yellow); }

/* ══ CONTENT ══ */
.console-content { padding: 20px 28px; display: flex; flex-direction: column; gap: 16px; }

/* ══ KPI ROW ══ */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: default;
}
.kpi-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.kc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.kc-icon { width: 36px; height: 36px; border-radius: var(--radius-s); display: flex; align-items: center; justify-content: center; }
.kc-icon .material-symbols-outlined { font-size: 19px; }
.kc-trend { display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
.trend-up   { background: var(--green2); color: var(--green); }
.trend-down { background: var(--red2);   color: var(--red);   }
.kc-value { font-size: 26px; font-weight: 900; letter-spacing: -0.6px; color: var(--text1); margin-bottom: 2px; }
.kc-label { font-size: 12px; font-weight: 600; color: var(--text2); }
.kc-sub   { font-size: 11px; color: var(--muted); margin-top: 4px; }
.kc-bg-icon {
  position: absolute; right: -8px; bottom: -8px;
  font-size: 72px !important; color: var(--border); opacity: 0.5; pointer-events: none;
}
.kc-green  .kc-icon { background: var(--green2); color: var(--green); }
.kc-red    .kc-icon { background: var(--red2);   color: var(--red);   }
.kc-blue   .kc-icon { background: var(--blue2);  color: var(--blue);  }
.kc-orange .kc-icon { background: var(--accent2);color: var(--accent); }

/* ══ CARD BASE ══ */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.card-head {
  padding: 14px 18px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid var(--border);
}
.card-icon {
  width: 34px; height: 34px; border-radius: var(--radius-s); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.card-icon .material-symbols-outlined { font-size: 18px; }
.card-title { font-size: 13.5px; font-weight: 700; color: var(--text1); }
.card-sub   { font-size: 11px; color: var(--muted); margin-top: 1px; }
.card-actions { margin-left: auto; display: flex; gap: 4px; flex-wrap: wrap; }
.chip {
  padding: 4px 10px; border-radius: 14px;
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.chip.active { background: var(--accent2); border-color: var(--accent); color: var(--accent); font-weight: 700; }

/* ══ CHART ROW ══ */
.chart-row { display: grid; grid-template-columns: 260px 1fr 260px; gap: 14px; }
.card-sm   { }
.card-lg   { }
.chart-wrap { position: relative; }
.h220 { height: 300px; padding: 14px 18px; }

/* ══ DONUT ══ */
.donut-wrap {
  position: relative;
  height: 180px;
  padding: 14px 18px;
  display: flex; align-items: center; justify-content: center;
}
.donut-center {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center; pointer-events: none;
}
.dc-val { font-size: 22px; font-weight: 900; color: var(--text1); letter-spacing: -0.5px; }
.dc-lbl { font-size: 10px; color: var(--muted); font-weight: 500; }
.status-legend { padding: 0 14px 14px; display: flex; flex-direction: column; gap: 5px; }
.sl-item { display: flex; align-items: center; gap: 7px; font-size: 11.5px; }
.sl-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sl-name { flex: 1; color: var(--text2); }
.sl-val  { font-weight: 700; color: var(--text1); }
.sl-pct  { color: var(--muted); font-size: 10.5px; width: 30px; text-align: right; }

/* ══ GIRO ══ */
.giro-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.giro-item { display: flex; align-items: center; gap: 8px; }
.gi-info   { width: 90px; flex-shrink: 0; }
.gi-cod    { font-size: 10.5px; font-weight: 700; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gi-giro   { font-size: 10px; color: var(--muted); }
.gi-bar-wrap { flex: 1; height: 6px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.gi-bar    { height: 100%; border-radius: 3px; transition: width 0.4s; }
.gi-days   { font-size: 10.5px; font-weight: 700; width: 28px; text-align: right; }
.gi-days.red    { color: var(--red);    }
.gi-days.yellow { color: var(--yellow); }
.gi-days.green  { color: var(--green);  }
.giro-avg { padding: 10px 16px 14px; font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 5px; border-top: 1px solid var(--border); }
.giro-avg strong { color: var(--accent); }

/* ══ ANALYSIS ROW ══ */
.analysis-row { display: grid; grid-template-columns: 1fr 320px; gap: 14px; }
.card-metrics {}

/* ══ ESG TABLE ══ */
.esg-table-wrap { overflow-x: auto; }
.esg-table { width: 100%; border-collapse: collapse; }
.esg-table thead tr { background: var(--bg-el); }
.esg-table th { padding: 9px 14px; font-size: 10.5px; font-weight: 700; color: var(--muted); text-align: left; letter-spacing: 0.3px; white-space: nowrap; }
.esg-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.esg-table tr:hover td { background: var(--bg-el); }
.cell-prod .cp-cod  { font-size: 12px; font-weight: 700; color: var(--text1); }
.cell-prod .cp-lote { font-size: 10.5px; color: var(--muted); }
.mono-val { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.mono-val.accent { color: var(--accent); }
.dias-bar-wrap { display: flex; align-items: center; gap: 8px; }
.dias-bar { height: 5px; border-radius: 3px; flex: 1; max-width: 80px; }
.dias-val  { font-size: 11.5px; font-weight: 700; color: var(--text1); }
.date-chip { font-size: 11px; font-weight: 600; }
.urg-badge {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px; border-radius: 10px;
  font-size: 10.5px; font-weight: 700;
}
.urg-badge.ok      { background: var(--green2); color: var(--green); }
.urg-badge.minimo  { background: var(--yellow2); color: var(--yellow); }
.urg-badge.critico { background: var(--red2); color: var(--red); }

/* ══ METRICS ══ */
.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }
.metric-block {
  background: var(--bg-card);
  padding: 16px; display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 4px;
}
.mb-icon { width: 30px; height: 30px; border-radius: var(--radius-s); display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.mb-icon .material-symbols-outlined { font-size: 16px; }
.mb-val   { font-size: 20px; font-weight: 800; color: var(--text1); letter-spacing: -0.4px; }
.mb-label { font-size: 11px; font-weight: 600; color: var(--text2); }
.mb-sub   { font-size: 10px; color: var(--muted); }

/* ══ ALERTS ROW ══ */
.alerts-row { display: grid; grid-template-columns: 1fr 340px; gap: 14px; }
.alert-count-badges { margin-left: auto; display: flex; gap: 6px; }
.acb { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
.acb.red    { background: var(--red2); color: var(--red); }
.acb.yellow { background: var(--yellow2); color: var(--yellow); }
.acb.blue   { background: var(--blue2); color: var(--blue); }
.alert-list { padding: 10px 14px 14px; display: flex; flex-direction: column; gap: 7px; max-height: 320px; overflow-y: auto; }
.alert-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius-s);
  border: 1px solid var(--border); background: var(--bg-card);
  transition: all 0.15s;
}
.alert-item.critico { border-left: 3px solid var(--red); }
.alert-item.atencao { border-left: 3px solid var(--yellow); }
.alert-item.info    { border-left: 3px solid var(--blue); }
.ai-icon { width: 30px; height: 30px; border-radius: var(--radius-s); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ai-icon .material-symbols-outlined { font-size: 17px; }
.alert-item.critico .ai-icon { background: var(--red2);    color: var(--red);    }
.alert-item.atencao .ai-icon { background: var(--yellow2); color: var(--yellow); }
.alert-item.info    .ai-icon { background: var(--blue2);   color: var(--blue);   }
.ai-body { flex: 1; min-width: 0; }
.ai-title { font-size: 12px; font-weight: 700; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ai-desc  { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.ai-meta  { text-align: right; flex-shrink: 0; }
.ai-tag   { display: block; padding: 2px 7px; border-radius: 8px; font-size: 10px; font-weight: 700; margin-bottom: 3px; }
.ai-tag.critico { background: var(--red2);    color: var(--red);    }
.ai-tag.atencao { background: var(--yellow2); color: var(--yellow); }
.ai-tag.info    { background: var(--blue2);   color: var(--blue);   }
.ai-time  { font-size: 10px; color: var(--muted); }
.no-alerts { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; color: var(--muted); font-size: 12px; }

/* ══ VALIDADES ══ */
.validade-list { padding: 10px 14px 14px; display: flex; flex-direction: column; gap: 7px; max-height: 320px; overflow-y: auto; }
.val-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-s); border: 1px solid var(--border); }
.val-icon { width: 30px; height: 30px; border-radius: var(--radius-s); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.val-icon .material-symbols-outlined { font-size: 17px; }
.val-icon.red    { background: var(--red2);    color: var(--red);    }
.val-icon.yellow { background: var(--yellow2); color: var(--yellow); }
.val-icon.green  { background: var(--green2);  color: var(--green);  }
.val-info   { flex: 1; }
.val-cod    { font-size: 12px; font-weight: 700; color: var(--text1); }
.val-lote   { font-size: 10.5px; color: var(--muted); }
.val-right  { text-align: right; }
.val-date   { font-size: 11.5px; font-weight: 600; color: var(--text1); }
.val-dias   { font-size: 10.5px; font-weight: 700; }
.val-dias.red    { color: var(--red);    }
.val-dias.yellow { color: var(--yellow); }
.val-dias.green  { color: var(--green);  }

/* ══ TABLE CARD ══ */
.table-card { }
.table-controls {
  margin-left: auto; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.search-box {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-el); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 6px 10px;
  transition: border-color 0.15s;
}
.search-box:focus-within { border-color: var(--accent); }
.sb-icon { font-size: 16px !important; color: var(--muted); }
.search-input { border: none; background: transparent; font-size: 12.5px; color: var(--text1); outline: none; width: 180px; font-family: inherit; }
.search-input::placeholder { color: var(--muted); }
.sb-clear { border: none; background: transparent; cursor: pointer; color: var(--muted); display: flex; align-items: center; }
.filter-chips { display: flex; gap: 4px; }
.fchip {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 10px; border-radius: 14px;
  background: var(--bg-el); border: 1px solid var(--border);
  font-size: 11px; font-weight: 500; cursor: pointer;
  color: var(--text2); transition: all 0.15s; font-family: inherit;
}
.fchip-count { background: var(--bg-el2); border-radius: 8px; padding: 1px 5px; font-size: 10px; }
.fchip.active.green  { background: var(--green2); border-color: var(--green); color: var(--green); }
.fchip.active.yellow { background: var(--yellow2); border-color: var(--yellow); color: var(--yellow); }
.fchip.active.red    { background: var(--red2);   border-color: var(--red);   color: var(--red);   }
.fchip.active.blue   { background: var(--blue2);  border-color: var(--blue);  color: var(--blue);  }
.sort-select {
  padding: 6px 10px; border-radius: var(--radius-s);
  border: 1px solid var(--border); background: var(--bg-el);
  font-size: 11.5px; color: var(--text2); font-family: inherit; cursor: pointer;
}
.btn-sort-dir {
  width: 32px; height: 32px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text2); transition: all 0.15s;
}
.btn-sort-dir:hover { background: var(--bg-el2); }

/* ══ MAIN TABLE ══ */
.table-wrap { overflow-x: auto; }
.main-table { width: 100%; border-collapse: collapse; }
.main-table thead tr { background: var(--bg-el); }
.main-table th {
  padding: 10px 12px; font-size: 10.5px; font-weight: 700;
  color: var(--muted); text-align: left; letter-spacing: 0.4px;
  white-space: nowrap; border-bottom: 1px solid var(--border);
}
.th-sort { cursor: pointer; user-select: none; transition: color 0.15s; }
.th-sort:hover { color: var(--accent); }
.sort-arrow { font-size: 12px !important; vertical-align: middle; color: var(--accent); }
.main-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; font-size: 12.5px; }
.prod-row { cursor: pointer; transition: background 0.1s; }
.prod-row:hover td { background: var(--accent2); }
.empty-row { text-align: center; padding: 40px; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 13px; }

/* Cells */
.prod-cod-cell .pcc-cod { font-size: 12px; font-weight: 700; color: var(--text1); }
.prod-cod-cell .pcc-id  { font-size: 10px; color: var(--muted); }

.qty-badge { font-size: 16px; font-weight: 800; }
.qty-badge.ok      { color: var(--green); }
.qty-badge.minimo  { color: var(--yellow); }
.qty-badge.critico { color: var(--red); }
.qty-badge.excesso { color: var(--blue); }
.qty-badge.zerado  { color: var(--muted); }
.qty-sub { font-size: 10px; color: var(--muted); }

.lotes-cell { display: flex; flex-wrap: wrap; gap: 3px; }
.lote-chip  { background: var(--bg-el); border: 1px solid var(--border); border-radius: 6px; padding: 2px 7px; font-size: 10px; font-weight: 600; color: var(--text2); }
.lote-more  { background: var(--accent2); border: 1px solid var(--accent); border-radius: 6px; padding: 2px 7px; font-size: 10px; font-weight: 700; color: var(--accent); }

.status-cell { display: flex; align-items: center; gap: 7px; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-indicator.ok      { background: var(--green); box-shadow: 0 0 0 2px rgba(22,163,74,0.2); }
.status-indicator.minimo  { background: var(--yellow); box-shadow: 0 0 0 2px rgba(202,138,4,0.2); }
.status-indicator.critico { background: var(--red);   box-shadow: 0 0 0 2px rgba(220,38,38,0.2); animation: pulse 1.5s infinite; }
.status-indicator.excesso { background: var(--blue);  }
.status-indicator.zerado  { background: var(--muted); }
.status-label { font-size: 11.5px; font-weight: 700; }
.status-label.ok      { color: var(--green);  }
.status-label.minimo  { color: var(--yellow); }
.status-label.critico { color: var(--red);    }
.status-label.excesso { color: var(--blue);   }
.status-label.zerado  { color: var(--muted);  }
.status-desc { font-size: 10px; color: var(--muted); margin-top: 1px; }

.val-cell .vc-date   { font-size: 11.5px; font-weight: 600; color: var(--text1); }
.val-cell .vc-status { font-size: 10px; font-weight: 600; }
.val-cell .vc-status.vencido  { color: var(--red); }
.val-cell .vc-status.proximo  { color: var(--yellow); }
.val-cell .vc-status.ok       { color: var(--green); }
.val-cell .vc-status.sem      { color: var(--muted); }

.dias-cell { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--text2); }
.dias-cell.red    { color: var(--red);    }
.dias-cell.yellow { color: var(--yellow); }

.mov-cell { display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 700; }
.mov-cell.entrada { color: var(--green); }
.mov-cell.saida   { color: var(--red);   }

.giro-cell .giro-val { font-size: 12.5px; font-weight: 700; color: var(--text1); }
.giro-bar-mini { height: 4px; background: var(--bg-el2); border-radius: 2px; overflow: hidden; margin-top: 3px; width: 60px; }
.gbm-fill { height: 100%; border-radius: 2px; }

.saldo-chip { padding: 3px 8px; border-radius: 8px; font-size: 11.5px; font-weight: 700; }
.saldo-chip.pos { background: var(--green2); color: var(--green); }
.saldo-chip.neg { background: var(--red2);   color: var(--red);   }

.resp-cell { display: flex; align-items: center; gap: 7px; }
.rc-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--accent2); color: var(--accent); font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rc-email  { font-size: 11px; color: var(--text2); }

/* ══ PAGINATION ══ */
.pagination {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.pg-info   { font-size: 11.5px; color: var(--muted); flex: 1; }
.pg-controls { display: flex; gap: 4px; align-items: center; }
.pg-btn {
  width: 30px; height: 30px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text2); transition: all 0.15s;
}
.pg-btn:hover:not(:disabled) { background: var(--accent2); border-color: var(--accent); color: var(--accent); }
.pg-btn:disabled { opacity: 0.4; cursor: default; }
.pg-btn .material-symbols-outlined { font-size: 16px; }
.pg-num {
  width: 30px; height: 30px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  font-size: 12px; font-weight: 600; cursor: pointer; color: var(--text2);
  display: flex; align-items: center; justify-content: center; font-family: inherit;
  transition: all 0.15s;
}
.pg-num.active { background: var(--accent); border-color: var(--accent); color: white; }
.pg-num:hover:not(.active) { background: var(--bg-el2); }
.pg-size { margin-left: auto; }

/* ══ MODAL ══ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 999; backdrop-filter: blur(2px);
  animation: fadeIn 0.15s;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.modal-box {
  background: var(--bg-card); border-radius: var(--radius);
  width: 560px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: slideUp 0.2s;
}
@keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
.modal-header {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
}
.modal-icon { width: 36px; height: 36px; border-radius: var(--radius-s); display: flex; align-items: center; justify-content: center; }
.modal-icon .material-symbols-outlined { font-size: 19px; }
.modal-title { font-size: 15px; font-weight: 800; color: var(--text1); }
.modal-sub   { font-size: 11.5px; color: var(--muted); }
.modal-close {
  margin-left: auto; width: 30px; height: 30px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text2);
}
.modal-close .material-symbols-outlined { font-size: 18px; }
.modal-body { padding: 20px; }
.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
.dg-block { background: var(--bg-el); border-radius: var(--radius-s); padding: 14px; }
.dg-label { font-size: 10.5px; color: var(--muted); font-weight: 600; margin-bottom: 4px; }
.dg-val   { font-size: 16px; font-weight: 800; color: var(--text1); }
.dg-val.big    { font-size: 22px; }
.dg-val.accent { color: var(--accent); }
.dg-val.green  { color: var(--green);  }
.dg-val.red    { color: var(--red);    }
.detail-lotes .dl-title { font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 8px; }
.dl-list { display: flex; flex-direction: column; gap: 7px; }
.dl-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: var(--bg-el); border-radius: var(--radius-s); font-size: 12px; }
.dl-lote { font-weight: 700; color: var(--text1); flex: 1; }
.dl-qty  { color: var(--text2); }
.dl-val  { color: var(--muted); }
.tag-r { padding: 2px 7px; border-radius: 8px; font-size: 10px; font-weight: 700; }
.tag-red   { background: var(--red2);   color: var(--red);   }
.tag-green { background: var(--green2); color: var(--green); }

/* ══ SCROLLBAR ══ */
::-webkit-scrollbar       { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--muted); }

/* ══ RESPONSIVE ══ */
@media (max-width: 1400px) {
  .kpi-row   { grid-template-columns: repeat(2, 1fr); }
  .chart-row { grid-template-columns: 1fr 1fr; }
  .chart-row .card-lg { grid-column: 1 / -1; order: -1; }
}
@media (max-width: 1100px) {
  .analysis-row { grid-template-columns: 1fr; }
  .alerts-row   { grid-template-columns: 1fr; }
  .console-content { padding: 16px; }
}
@media (max-width: 768px) {
  .chart-row { grid-template-columns: 1fr; }
  .kpi-row   { grid-template-columns: 1fr 1fr; }
  .console-content { padding: 12px; }
  .detail-grid { grid-template-columns: 1fr 1fr; }
}
</style>