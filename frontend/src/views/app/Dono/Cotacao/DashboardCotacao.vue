<template>
  <div class="cotacao-root">

    <!-- ══ HEADER ══ -->
    <div class="reports-header">
      <div class="rh-left">
        <div class="rh-brand">
          <span class="material-symbols-outlined rh-brand-icon">request_quote</span>
          <div>
            <div class="rh-title">Dashboard de Cotações</div>
            <div class="rh-sub">Market Vizium ERP · Área de Compras</div>
          </div>
        </div>
      </div>
      <div class="rh-right">
        <div class="rh-sync">
          <span class="material-symbols-outlined" style="font-size:14px;color:var(--green)">fiber_manual_record</span>
          Dados em tempo real
        </div>
      </div>
    </div>

    <!-- ══ FILTER BAR ══ -->
    <div class="filter-bar">
      <div class="filter-section">
        <span class="filter-label">
          <span class="material-symbols-outlined" style="font-size:15px">calendar_month</span>
          Período
        </span>
        <div class="period-chips">
          <button
            v-for="p in periodPresets"
            :key="p.key"
            class="pchip"
            :class="{ active: activePeriod === p.key }"
            @click="setPreset(p.key)"
          >{{ p.label }}</button>
        </div>
        <div class="date-range">
          <span class="dr-label">De</span>
          <input type="date" v-model="dateFrom" class="dr-input" />
          <span class="dr-label">Até</span>
          <input type="date" v-model="dateTo" class="dr-input" />
          <button class="btn-apply" @click="applyCustomRange">
            <span class="material-symbols-outlined" style="font-size:15px">search</span>
            Aplicar
          </button>
        </div>
      </div>
    </div>

    <!-- ══ PERIOD BADGE ══ -->
    <div class="period-badge-row">
      <div class="period-badge">
        <span class="material-symbols-outlined" style="font-size:14px">date_range</span>
        {{ periodLabel }}
      </div>
      <div class="pb-location">
        <span class="material-symbols-outlined" style="font-size:14px">shopping_cart</span>
        {{ totalCotacoes }} cotações no período
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <div class="pb-stat">
          <span class="pb-stat-val">{{ totalCotacoes }}</span>
          <span class="pb-stat-lbl">Total Cotações</span>
        </div>
        <div class="pb-stat">
          <span class="pb-stat-val accent">{{ cotacoesConcluidas }}</span>
          <span class="pb-stat-lbl">Concluídas</span>
        </div>
        <div class="pb-stat">
          <span class="pb-stat-val green">{{ taxaConclusao }}%</span>
          <span class="pb-stat-lbl">Taxa Conclusão</span>
        </div>
        <div class="pb-stat">
          <span class="pb-stat-val" style="color:var(--blue)">R$ {{ valorMedioCotacao }}</span>
          <span class="pb-stat-lbl">Valor Médio</span>
        </div>
      </div>
    </div>

    <!-- ══ CONTENT ══ -->
    <div class="reports-content">

      <div style="width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box;">
        <BannerSite style="width: 100%; max-width: 100%; display: block; box-sizing: border-box;" />
      </div>

      <!-- ═══ KPIs PRINCIPAIS ═══ -->
      <div class="section-block">
        <div class="section-header">
          <div class="section-icon c-orange">
            <span class="material-symbols-outlined">monitoring</span>
          </div>
          <div>
            <div class="section-title">Resumo Executivo de Cotações</div>
            <div class="section-sub">Indicadores gerais do período · {{ periodLabel }}</div>
          </div>
        </div>

        <div class="kpi-grid-4">
          <div v-for="k in mainKpis" :key="k.label" class="kpi-report" :class="k.cls">
            <div class="kr-icon"><span class="material-symbols-outlined">{{ k.icon }}</span></div>
            <div class="kr-body">
              <div class="kr-label">{{ k.label }}</div>
              <div class="kr-value">{{ k.value }}</div>
              <div class="kr-footer">
                <span class="kr-delta" :class="k.up ? 'up' : 'down'">
                  <span class="material-symbols-outlined" style="font-size:12px">{{ k.up ? 'trending_up' : 'trending_down' }}</span>
                  {{ k.delta }}
                </span>
                <span class="kr-sub">vs período ant.</span>
              </div>
            </div>
            <span class="material-symbols-outlined kr-bg">{{ k.icon }}</span>
          </div>
        </div>

        <!-- Mini métricas complementares -->
        <div class="kpi-grid-4">
          <div v-for="m in miniKpis" :key="m.label" class="kpi-mini">
            <div class="kmr-label">{{ m.label }}</div>
            <div class="kmr-value">{{ m.value }}</div>
            <div class="kmr-sub" :style="{ color: m.up ? 'var(--green)' : m.up === false ? 'var(--red)' : 'var(--muted)' }">
              <span v-if="m.trend">{{ m.up ? '▲' : '▼' }} {{ m.trend }}</span>
              {{ m.sub }}
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ GRÁFICO EVOLUÇÃO DE PREÇO + COTAÇÕES CRIADAS/CONCLUÍDAS ═══ -->
      <div class="section-block">
        <div class="section-header">
          <div class="section-icon c-blue">
            <span class="material-symbols-outlined">show_chart</span>
          </div>
          <div>
            <div class="section-title">Evolução de Preços e Volume de Cotações</div>
            <div class="section-sub">Histórico de preços por produto e quantidade de cotações</div>
          </div>
        </div>

        <div class="chart-section-grid">
          <!-- Card: Evolução de preço por produto -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">trending_up</span></div>
              <div>
                <div class="card-title">Evolução de Preço por Produto</div>
                <div class="card-sub">Baseado em ofertas aceitas · cotações concluídas</div>
              </div>
              <div class="card-actions">
                <div class="barcode-search">
                  <span class="material-symbols-outlined" style="font-size:14px;color:var(--muted)">barcode_scanner</span>
                  <input
                    type="text"
                    v-model="barcodeSearch"
                    placeholder="Cód. de barras..."
                    class="barcode-input"
                    @input="debouncedSearch"
                    @keyup.enter="searchProduct"
                  />
                  <button class="btn-barcode" @click="searchProduct">
                    <span class="material-symbols-outlined" style="font-size:14px">search</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Produto selecionado info -->
            <div v-if="selectedProduct" class="selected-product-bar">
              <div class="spb-info">
                <span class="spb-code">{{ selectedProduct.barcode }}</span>
                <span class="spb-name">{{ selectedProduct.name }}</span>
                <span class="spb-cat tag-r tag-blue-soft">{{ selectedProduct.category }}</span>
              </div>
              <div class="spb-stats">
                <div class="spb-stat">
                  <span class="spb-stat-val">R$ {{ selectedProduct.lastPrice }}</span>
                  <span class="spb-stat-lbl">Último preço</span>
                </div>
                <div class="spb-stat">
                  <span class="spb-stat-val" :style="{ color: selectedProduct.priceChange > 0 ? 'var(--red)' : 'var(--green)' }">
                    {{ selectedProduct.priceChange > 0 ? '+' : '' }}{{ selectedProduct.priceChange }}%
                  </span>
                  <span class="spb-stat-lbl">Variação</span>
                </div>
                <div class="spb-stat">
                  <span class="spb-stat-val">{{ selectedProduct.totalQuotes }}</span>
                  <span class="spb-stat-lbl">Cotações</span>
                </div>
              </div>
            </div>

            <div class="chart-wrap h260">
              <canvas ref="priceEvoChart"></canvas>
            </div>
          </div>

          <!-- Card: Volume de cotações criadas vs concluídas -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-green"><span class="material-symbols-outlined">bar_chart</span></div>
              <div>
                <div class="card-title">Cotações Criadas vs Concluídas</div>
                <div class="card-sub">Evolução diária · {{ periodLabel }}</div>
              </div>
            </div>
            <div class="chart-wrap h260">
              <canvas ref="volumeChart"></canvas>
            </div>
            <div class="stock-summary">
              <div class="ss-item"><div class="ss-val accent">{{ totalCotacoes }}</div><div class="ss-lbl">Criadas</div></div>
              <div class="ss-item"><div class="ss-val green">{{ cotacoesConcluidas }}</div><div class="ss-lbl">Concluídas</div></div>
              <div class="ss-item"><div class="ss-val" style="color:var(--yellow)">{{ cotacoesPendentes }}</div><div class="ss-lbl">Pendentes</div></div>
              <div class="ss-item"><div class="ss-val red">{{ cotacoesCanceladas }}</div><div class="ss-lbl">Canceladas</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ VENDEDORES / FORNECEDORES ═══ -->
      <div class="section-block">
        <div class="section-header">
          <div class="section-icon c-blue">
            <span class="material-symbols-outlined">group</span>
          </div>
          <div>
            <div class="section-title">Performance de Vendedores / Fornecedores</div>
            <div class="section-sub">Ranking, tempo de resposta e participação em cotações</div>
          </div>
        </div>

        <!-- Tabela ranking vendedores -->
        <div class="card" style="overflow-x: auto;">
          <div class="card-head">
            <div class="card-icon c-blue"><span class="material-symbols-outlined">leaderboard</span></div>
            <div>
              <div class="card-title">Ranking Detalhado de Vendedores</div>
              <div class="card-sub">Quantidade vendida, cotações participadas e tempo de resposta</div>
            </div>
            <div class="card-actions">
              <button v-for="f in ['Vendas','Cotações','Resposta','Aceite']" :key="f" class="chip" :class="{ active: sellerRankFilter === f }" @click="sellerRankFilter = f">{{ f }}</button>
            </div>
          </div>
          <div class="table-wrapper">
              <table class="report-table" >
                <thead>
                  <tr>
                    <th >#</th>
                    <th>VENDEDOR</th>
                    <th>EMPRESA</th>
                    <th>QTDE. VENDAS</th>
                    <th>COTAÇÕES PART.</th>
                    <th>TAXA ACEITE</th>
                    <th>RESP. MAIS RÁPIDA</th>
                    <th>RESP. MAIS LENTA</th>
                    <th>TEMPO MÉDIO</th>
                    <th>TOTAL VENDIDO</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody style="height: 250px">
                  <tr v-for="(s, i) in sellersDetailed" :key="s.name">
                    <td>
                      <span class="rank-num" :class="['gold','silver','bronze'][i]||''">{{ i+1 }}</span>
                    </td>
                    <td>
                      <div class="user-cell">
                        <div class="mini-av" :class="'sc-av-'+s.avColor">{{ s.initials }}</div>
                        <div>
                          <div class="cell-name">{{ s.name }}</div>
                          <div class="cell-sub">{{ s.role }}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="cell-name">{{ s.company }}</span></td>
                    <td><span class="mono-bold">{{ s.qtdVendas }}</span></td>
                    <td>{{ s.cotacoesParticipadas }}</td>
                    <td>
                      <div class="inline-bar">
                        <div class="ib-fill" :style="{ width: s.taxaAceite+'%', background: s.taxaAceite >= 60 ? 'var(--green)' : 'var(--accent)' }"></div>
                        <span class="ib-val">{{ s.taxaAceite }}%</span>
                      </div>
                    </td>
                    <td><span class="tag-r tag-green">{{ s.respMin }}h</span></td>
                    <td><span class="tag-r tag-red">{{ s.respMax }}h</span></td>
                    <td>{{ s.tempoMedio }}h</td>
                    <td><span class="mono-bold accent-text">R$ {{ s.totalVendido }}</span></td>
                    <td>
                      <span class="tag-r" :class="s.tempoMedio <= 4 ? 'tag-green' : s.tempoMedio <= 12 ? 'tag-orange' : 'tag-red'">
                        {{ s.tempoMedio <= 4 ? 'Ágil' : s.tempoMedio <= 12 ? 'Regular' : 'Lento' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>

        <!-- Cards: Mais rápido e mais lento -->
        <div class="chart-section-grid">
          <div class="card highlight-card highlight-green">
            <div class="card-head">
              <div class="card-icon c-green"><span class="material-symbols-outlined">speed</span></div>
              <div>
                <div class="card-title">Vendedor Mais Rápido</div>
                <div class="card-sub">Menor tempo médio de resposta no período</div>
              </div>
            </div>
            <div class="highlight-body">
              <div class="hb-avatar" :class="'sc-av-'+fastestSeller.avColor">{{ fastestSeller.initials }}</div>
              <div class="hb-info">
                <div class="hb-name">{{ fastestSeller.name }}</div>
                <div class="hb-company">{{ fastestSeller.company }}</div>
                <div class="hb-metric green-text">
                  <span class="material-symbols-outlined" style="font-size:18px">timer</span>
                  {{ fastestSeller.tempoMedio }}h tempo médio
                </div>
              </div>
              <div class="hb-stats">
                <div class="hb-stat">
                  <div class="hb-stat-val green">{{ fastestSeller.cotacoesParticipadas }}</div>
                  <div class="hb-stat-lbl">Cotações</div>
                </div>
                <div class="hb-stat">
                  <div class="hb-stat-val">{{ fastestSeller.taxaAceite }}%</div>
                  <div class="hb-stat-lbl">Aceite</div>
                </div>
                <div class="hb-stat">
                  <div class="hb-stat-val">{{ fastestSeller.qtdVendas }}</div>
                  <div class="hb-stat-lbl">Vendas</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card highlight-card highlight-red">
            <div class="card-head">
              <div class="card-icon c-red"><span class="material-symbols-outlined">hourglass_bottom</span></div>
              <div>
                <div class="card-title">Vendedor Mais Lento</div>
                <div class="card-sub">Maior tempo médio de resposta no período</div>
              </div>
            </div>
            <div class="highlight-body">
              <div class="hb-avatar" :class="'sc-av-'+slowestSeller.avColor">{{ slowestSeller.initials }}</div>
              <div class="hb-info">
                <div class="hb-name">{{ slowestSeller.name }}</div>
                <div class="hb-company">{{ slowestSeller.company }}</div>
                <div class="hb-metric red-text">
                  <span class="material-symbols-outlined" style="font-size:18px">timer_off</span>
                  {{ slowestSeller.tempoMedio }}h tempo médio
                </div>
              </div>
              <div class="hb-stats">
                <div class="hb-stat">
                  <div class="hb-stat-val red">{{ slowestSeller.cotacoesParticipadas }}</div>
                  <div class="hb-stat-lbl">Cotações</div>
                </div>
                <div class="hb-stat">
                  <div class="hb-stat-val">{{ slowestSeller.taxaAceite }}%</div>
                  <div class="hb-stat-lbl">Aceite</div>
                </div>
                <div class="hb-stat">
                  <div class="hb-stat-val">{{ slowestSeller.qtdVendas }}</div>
                  <div class="hb-stat-lbl">Vendas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ PRODUTOS E MÉTRICAS ADICIONAIS ═══ -->
      <div class="section-block">
        <div class="section-header">
          <div class="section-icon c-yellow">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <div class="section-title">Produtos e Métricas de Cotação</div>
            <div class="section-sub">Principal produto, mais comprado e informações da última cotação</div>
          </div>
        </div>

        <div class="grid-3">
          <!-- Principal produto mais comprado -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-yellow"><span class="material-symbols-outlined">star</span></div>
              <div>
                <div class="card-title">Produto Mais Comprado</div>
                <div class="card-sub">Maior volume de compras no período</div>
              </div>
            </div>
            <div class="top-product-body">
              <div class="tpb-rank">#1</div>
              <div class="tpb-info">
                <div class="tpb-name">{{ topProduct.name }}</div>
                <div class="tpb-code">
                  <span class="material-symbols-outlined" style="font-size:13px">barcode_scanner</span>
                  {{ topProduct.barcode }}
                </div>
                <div class="tpb-category"><span class="tag-r tag-blue-soft">{{ topProduct.category }}</span></div>
              </div>
              <div class="tpb-metrics">
                <div class="tpb-metric">
                  <div class="tpbm-val accent">{{ topProduct.totalUnits }}</div>
                  <div class="tpbm-lbl">Unidades</div>
                </div>
                <div class="tpb-metric">
                  <div class="tpbm-val">{{ topProduct.cotacoes }}</div>
                  <div class="tpbm-lbl">Cotações</div>
                </div>
                <div class="tpb-metric">
                  <div class="tpbm-val green">R$ {{ topProduct.avgPrice }}</div>
                  <div class="tpbm-lbl">Preço Médio</div>
                </div>
              </div>
              <div class="tpb-bar-wrap">
                <div class="tpb-bar-fill" :style="{ width: '100%' }"></div>
              </div>
              <div class="tpb-footer">
                <span class="material-symbols-outlined" style="font-size:13px;color:var(--muted)">trending_up</span>
                <span style="font-size:11px;color:var(--muted)">{{ topProduct.variacao > 0 ? '+' : '' }}{{ topProduct.variacao }}% vs período ant.</span>
              </div>
            </div>

            <!-- Outros produtos top -->
            <div class="top-products-list">
              <div class="tpl-header">Outros mais comprados</div>
              <div v-for="(p, i) in otherTopProducts" :key="p.name" class="tpl-row">
                <div class="tpl-rank">{{ i + 2 }}</div>
                <div class="tpl-info">
                  <div class="tpl-name">{{ p.name }}</div>
                  <div class="tpl-code">{{ p.barcode }}</div>
                </div>
                <div class="tpl-bar-wrap">
                  <div class="tpl-bar" :style="{ width: p.pct+'%' }"></div>
                </div>
                <div class="tpl-qty">{{ p.totalUnits }} un.</div>
              </div>
            </div>
          </div>

          <!-- Vendedor que mais vende na loja -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">emoji_events</span></div>
              <div>
                <div class="card-title">Vendedor que Mais Vende</div>
                <div class="card-sub">Maior quantidade vendida à loja</div>
              </div>
            </div>
            <div class="top-seller-body">
              <div class="tsb-crown">👑</div>
              <div class="sc-avatar large" :class="'sc-av-'+topSeller.avColor">{{ topSeller.initials }}</div>
              <div class="tsb-name">{{ topSeller.name }}</div>
              <div class="tsb-company">{{ topSeller.company }}</div>
              <div class="tsb-metrics">
                <div class="tsb-metric">
                  <div class="tsb-val accent">{{ topSeller.qtdVendas }}</div>
                  <div class="tsb-lbl">Qtd. Vendas</div>
                </div>
                <div class="tsb-metric">
                  <div class="tsb-val">{{ topSeller.cotacoesParticipadas }}</div>
                  <div class="tsb-lbl">Cotações</div>
                </div>
                <div class="tsb-metric">
                  <div class="tsb-val green">{{ topSeller.taxaAceite }}%</div>
                  <div class="tsb-lbl">Aceite</div>
                </div>
              </div>
              <div class="tsb-total">
                <span class="tsb-total-lbl">Total vendido no período</span>
                <span class="tsb-total-val">R$ {{ topSeller.totalVendido }}</span>
              </div>
            </div>

            <div class="chart-wrap h160">
              <canvas ref="topSellerChart"></canvas>
            </div>
          </div>

          <!-- Última cotação + valor médio -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">receipt_long</span></div>
              <div>
                <div class="card-title">Última Cotação & Métricas</div>
                <div class="card-sub">Informações da cotação mais recente</div>
              </div>
            </div>
            <div class="last-quote-body">
              <div class="lqb-badge">
                <span class="material-symbols-outlined" style="font-size:28px;color:var(--blue)">description</span>
                <div>
                  <div class="lqb-name">{{ lastCotacao.name }}</div>
                  <div class="lqb-date">
                    <span class="material-symbols-outlined" style="font-size:12px">calendar_today</span>
                    {{ lastCotacao.date }}
                  </div>
                </div>
                <span class="tag-r tag-blue-soft lqb-status">{{ lastCotacao.status }}</span>
              </div>
              <div class="lqb-details">
                <div class="lqb-detail-row">
                  <span class="lqb-detail-lbl">
                    <span class="material-symbols-outlined" style="font-size:13px">person</span>
                    Criada por
                  </span>
                  <span class="lqb-detail-val">{{ lastCotacao.createdBy }}</span>
                </div>
                <div class="lqb-detail-row">
                  <span class="lqb-detail-lbl">
                    <span class="material-symbols-outlined" style="font-size:13px">inventory</span>
                    Itens
                  </span>
                  <span class="lqb-detail-val">{{ lastCotacao.items }} produtos</span>
                </div>
                <div class="lqb-detail-row">
                  <span class="lqb-detail-lbl">
                    <span class="material-symbols-outlined" style="font-size:13px">local_offer</span>
                    Fornecedores
                  </span>
                  <span class="lqb-detail-val">{{ lastCotacao.suppliers }} participantes</span>
                </div>
                <div class="lqb-detail-row">
                  <span class="lqb-detail-lbl">
                    <span class="material-symbols-outlined" style="font-size:13px">attach_money</span>
                    Valor total
                  </span>
                  <span class="lqb-detail-val accent-text">R$ {{ lastCotacao.total }}</span>
                </div>
              </div>
            </div>

            <!-- Valor médio por cotação -->
            <div class="avg-quote-box">
              <div class="aqb-header">
                <span class="material-symbols-outlined" style="font-size:16px;color:var(--accent)">calculate</span>
                Valor Médio por Cotação
              </div>
              <div class="aqb-value">R$ {{ valorMedioCotacao }}</div>
              <div class="aqb-sub">
                <span :style="{ color: avgUp ? 'var(--green)' : 'var(--red)' }">
                  {{ avgUp ? '▲' : '▼' }} {{ avgDelta }}%
                </span>
                vs período anterior
              </div>
              <div class="aqb-breakdown">
                <div class="aqb-b-item">
                  <div class="aqb-b-val">R$ {{ avgMin }}</div>
                  <div class="aqb-b-lbl">Mínimo</div>
                </div>
                <div class="aqb-b-sep"></div>
                <div class="aqb-b-item">
                  <div class="aqb-b-val accent-text">R$ {{ valorMedioCotacao }}</div>
                  <div class="aqb-b-lbl">Médio</div>
                </div>
                <div class="aqb-b-sep"></div>
                <div class="aqb-b-item">
                  <div class="aqb-b-val">R$ {{ avgMax }}</div>
                  <div class="aqb-b-lbl">Máximo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══ FOOTER ══ -->
    <div class="reports-footer">
      <span>Dashboard de Cotações · Market Vizium ERP</span>
      <span>Última atualização: {{ lastUpdate }}</span>
    </div>

  </div>
</template>

<script>
import {
  Chart as ChartJS,

  CategoryScale,
  LinearScale,

  BarElement,
  LineElement,
  PointElement,
  ArcElement,

  BarController,
  LineController,
  DoughnutController,

  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import BannerSite from '@/components/BannerSite.vue';

ChartJS.register(
  CategoryScale,
  LinearScale,

  BarElement,
  LineElement,
  PointElement,
  ArcElement,

  BarController,
  LineController,
  DoughnutController,

  Title,
  Tooltip,
  Legend,
  Filler
);

export default {
  name: 'DashboardCotacao',

  components: {
    BannerSite
  },

  data() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      // Auth
      auth: null,

      // Loading
      loadingDashboard: false,

      // Filtros
      activePeriod: 'mes',
      dateFrom: firstDay.toISOString().slice(0, 10),
      dateTo: today.toISOString().slice(0, 10),
      selectedSupplier: 'all',
      activeStatus: 'todos',
      volumeGrouping: 'Diário',
      sellerRankFilter: 'Vendas',
      offerFilter: 'Todos',
      barcodeSearch: '',
      _searchTimeout: null,

      // Charts instances
      _charts: {},

      // Produto selecionado para evolução de preço
      selectedProduct: null,

      // Dados de produtos disponíveis (simulados — usados apenas para o gráfico de evolução de preço)
      availableProducts: [
        { barcode: '7891000100103', name: 'Leite Integral Longa Vida 1L', category: 'Laticínios', lastPrice: '4,89', priceChange: -2.3, totalQuotes: 18 },
        { barcode: '7896005800058', name: 'Óleo de Soja 900ml', category: 'Óleos e Gorduras', lastPrice: '7,45', priceChange: 5.1, totalQuotes: 14 },
        { barcode: '7891910000197', name: 'Arroz Branco Tipo 1 5kg', category: 'Grãos e Cereais', lastPrice: '24,90', priceChange: -1.8, totalQuotes: 22 },
        { barcode: '7894900011517', name: 'Refrigerante Cola 2L', category: 'Bebidas', lastPrice: '9,99', priceChange: 3.4, totalQuotes: 31 },
      ],

      // Dados da API de evolução de preço por produto (getEvolucaoPrecoProduto)
      priceEvoData: null,

      // ── Dados vindos da API ──────────────────────────────────────────────
      // KPIs principais (data.kpis)
      totalCotacoes: 0,
      cotacoesConcluidas: 0,
      cotacoesPendentes: 0,
      cotacoesCanceladas: 0,
      valorTotalComprado: 0,
      valorTotalAntComprado: 0,
      deltaValorPct: null,
      economiaGerada: 0,
      deltaCotacoes: 0,
      cotacoesUp: true,
      valorUp: null,
      volumeChart: null,

      // Mini KPIs (data.miniKpis)
      taxaConclusaoApi: 0,
      valorMedioCotacao: '0,00',
      avgMin: '0',
      avgMax: '0',
      deltaValorMedioPct: null,
      avgUp: null,
      fornecedoresAtivos: 0,

      // Vendedores (data.sellers)
      sellersDetalhadosApi: [],
      fastestSellerApi: null,
      slowestSellerApi: null,
      topSellerApi: null,

      // Produtos (data.produtos)
      topProductApi: null,
      otherTopProductsApi: [],

      // Última cotação (data.lastCotacao)
      lastCotacaoApi: null,
      // ────────────────────────────────────────────────────────────────────

      lastUpdate: new Date().toLocaleString('pt-BR'),

      statusFilters: [
        { key: 'todos', label: 'Todos' },
        { key: 'concluidas', label: 'Concluídas' },
        { key: 'pendentes', label: 'Pendentes' },
        { key: 'canceladas', label: 'Canceladas' },
      ],

      periodPresets: [
        { key: 'hoje', label: 'Hoje' },
        { key: 'semana', label: 'Esta Semana' },
        { key: 'mes', label: 'Este Mês' },
        { key: 'trimestre', label: 'Trimestre' },
        { key: 'ano', label: 'Este Ano' },
      ],
    };
  },

  computed: {
    taxaConclusao() {
      // Usa o valor da API se disponível, caso contrário calcula localmente
      if (this.taxaConclusaoApi != null && this.taxaConclusaoApi !== 0) return this.taxaConclusaoApi
      if (!this.totalCotacoes) return 0
      return Math.round((this.cotacoesConcluidas / this.totalCotacoes) * 100)
    },

    periodLabel() {
      const labels = {
        hoje: 'Hoje',
        semana: 'Esta Semana',
        mes: 'Este Mês',
        trimestre: 'Último Trimestre',
        ano: 'Este Ano',
        custom: `${this.dateFrom} até ${this.dateTo}`,
      };
      return labels[this.activePeriod] || 'Período Personalizado';
    },

    mainKpis() {
      const deltaCotacoesStr = this.deltaCotacoes != null
        ? `${this.cotacoesUp ? '+' : ''}${this.deltaCotacoes} vs ant.`
        : '—'

      const deltaValorStr = this.deltaValorPct != null
        ? `${this.deltaValorPct > 0 ? '+' : ''}${this.deltaValorPct}%`
        : '—'

      return [
        {
          label: 'Cotações Criadas',
          value: this.totalCotacoes.toString(),
          icon: 'request_quote',
          cls: 'k-orange',
          delta: deltaCotacoesStr,
          up: this.cotacoesUp,
        },
        {
          label: 'Cotações Concluídas',
          value: this.cotacoesConcluidas.toString(),
          icon: 'task_alt',
          cls: 'k-green',
          delta: deltaCotacoesStr,
          up: this.cotacoesUp,
        },
        {
          label: 'Valor Total Comprado',
          value: `R$ ${this.formatVal(this.valorTotalComprado)}`,
          icon: 'payments',
          cls: 'k-blue',
          delta: deltaValorStr,
          up: this.valorUp,
        },
        {
          label: 'Economia Gerada',
          value: `R$ ${this.formatVal(this.economiaGerada)}`,
          icon: 'savings',
          cls: 'k-yellow',
          delta: '—',
          up: null,
        },
      ];
    },

    miniKpis() {
      const deltaValorMedioStr = this.deltaValorMedioPct != null
        ? `${Math.abs(this.deltaValorMedioPct)}%`
        : null

      return [
        {
          label: 'Taxa de Conclusão',
          value: `${this.taxaConclusao}%`,
          trend: null,
          up: null,
          sub: 'do período',
        },
        {
          label: 'Cotações Pendentes',
          value: this.cotacoesPendentes.toString(),
          trend: null,
          up: null,
          sub: 'aguardando resposta',
        },
        {
          label: 'Valor Médio/Cotação',
          value: `R$ ${this.valorMedioCotacao}`,
          trend: deltaValorMedioStr,
          up: this.avgUp,
          sub: 'vs período ant.',
        },
        {
          label: 'Fornecedores Ativos',
          value: this.fornecedoresAtivos.toString(),
          trend: null,
          up: null,
          sub: 'no período',
        },
      ];
    },

    // Vendedores: usa API se disponível, fallback vazio
    sellersSummary() {
      if (this.sellersDetalhadosApi && this.sellersDetalhadosApi.length > 0) {
        return this.sellersDetalhadosApi
      }
      return []
    },

    sellersDetailed() {
      const sorted = [...this.sellersSummary]
      if (this.sellerRankFilter === 'Vendas') sorted.sort((a, b) => b.qtdVendas - a.qtdVendas)
      else if (this.sellerRankFilter === 'Cotações') sorted.sort((a, b) => b.cotacoesParticipadas - a.cotacoesParticipadas)
      else if (this.sellerRankFilter === 'Resposta') sorted.sort((a, b) => a.tempoMedio - b.tempoMedio)
      else if (this.sellerRankFilter === 'Aceite') sorted.sort((a, b) => b.taxaAceite - a.taxaAceite)
      return sorted
    },

    fastestSeller() {
      if (this.fastestSellerApi) return this.fastestSellerApi
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', tempoMedio: 0, cotacoesParticipadas: 0, taxaAceite: 0, qtdVendas: 0 }
      return [...this.sellersSummary].sort((a, b) => a.tempoMedio - b.tempoMedio)[0]
    },

    slowestSeller() {
      if (this.slowestSellerApi) return this.slowestSellerApi
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', tempoMedio: 0, cotacoesParticipadas: 0, taxaAceite: 0, qtdVendas: 0 }
      return [...this.sellersSummary].sort((a, b) => b.tempoMedio - a.tempoMedio)[0]
    },

    topSeller() {
      if (this.topSellerApi) return this.topSellerApi
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', qtdVendas: 0, cotacoesParticipadas: 0, taxaAceite: 0, totalVendido: '0.00' }
      return [...this.sellersSummary].sort((a, b) => b.qtdVendas - a.qtdVendas)[0]
    },

    topProduct() {
      if (this.topProductApi) {
        return {
          name: this.topProductApi.nome,
          barcode: this.topProductApi.codigo_barra || '—',
          category: this.topProductApi.categoria || 'Sem categoria',
          totalUnits: this.topProductApi.totalUnits,
          cotacoes: this.topProductApi.cotacoes,
          avgPrice: this.formatVal(this.topProductApi.avgPrice),
          variacao: null,
        }
      }
      return { name: '—', barcode: '—', category: '—', totalUnits: 0, cotacoes: 0, avgPrice: '0,00', variacao: null }
    },

    otherTopProducts() {
      if (this.otherTopProductsApi && this.otherTopProductsApi.length > 0) {
        return this.otherTopProductsApi.map(p => ({
          name: p.nome,
          barcode: p.codigo_barra || '—',
          totalUnits: p.totalUnits,
          pct: p.pct || 0,
        }))
      }
      return []
    },

    lastCotacao() {
      if (this.lastCotacaoApi) {
        return {
          name: this.lastCotacaoApi.name || '—',
          date: this.lastCotacaoApi.date || '—',
          status: this.lastCotacaoApi.status || '—',
          createdBy: this.lastCotacaoApi.createdBy || '—',
          items: this.lastCotacaoApi.items ?? 0,
          suppliers: this.lastCotacaoApi.suppliers ?? 0,
          total: this.lastCotacaoApi.total || '0,00',
        }
      }
      return { name: '—', date: '—', status: '—', createdBy: '—', items: 0, suppliers: 0, total: '0,00' }
    },

    avgDelta() {
      return this.deltaValorMedioPct != null ? Math.abs(this.deltaValorMedioPct) : 0
    },
  },

  methods: {
    // ── Utilitários ──────────────────────────────────────────────────────
    formatVal(v) {
      if (v == null) return '0,00'
      return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    // ── Carregamento da API ──────────────────────────────────────────────
    async carregarDashboard() {
      try {
        this.loadingDashboard = true

        const payload = {
          timestamp_inicio: new Date(this.dateFrom).getTime(),
          timestamp_fim: new Date(this.dateTo + 'T23:59:59').getTime(),
        }

        const res = await api.post(
          `/mvpu/cotacao/getDashboardCotacao/${this.auth.id_loja}`,
          payload
        )

        const d = res.data?.data
        if (!d) return

        // ── KPIs principais ───────────────────────────────────────────
        const k = d.kpis || {}

        console.log(k.totalCotacoes, "AAA")
        console.log(d, "AAA")

        this.totalCotacoes        = k.totalCotacoes        ?? 0
        this.cotacoesConcluidas   = k.cotacoesConcluidas   ?? 0
        this.cotacoesPendentes    = k.cotacoesPendentes    ?? 0
        this.cotacoesCanceladas   = k.cotacoesCanceladas   ?? 0
        this.valorTotalComprado   = k.valorTotalComprado   ?? 0
        this.valorTotalAntComprado = k.valorTotalAntComprado ?? 0
        this.deltaValorPct        = k.deltaValorPct        ?? null
        this.economiaGerada       = k.economiaGerada       ?? 0
        this.deltaCotacoes        = k.deltaCotacoes        ?? 0
        this.cotacoesUp           = k.cotacoesUp           ?? true
        this.valorUp              = k.valorUp              ?? null

        // ── Mini KPIs ─────────────────────────────────────────────────
        const mk = d.miniKpis || {}
        this.taxaConclusaoApi   = mk.taxaConclusao      ?? 0
        this.cotacoesPendentes  = mk.cotacoesPendentes  ?? this.cotacoesPendentes
        this.valorMedioCotacao  = mk.valorMedioCotacao != null
          ? this.formatVal(mk.valorMedioCotacao)
          : '0,00'
        this.avgMin             = mk.avgMin != null ? this.formatVal(mk.avgMin) : '0,00'
        this.avgMax             = mk.avgMax != null ? this.formatVal(mk.avgMax) : '0,00'
        this.deltaValorMedioPct = mk.deltaValorMedioPct ?? null
        this.avgUp              = mk.avgUp              ?? null
        this.fornecedoresAtivos = mk.fornecedoresAtivos ?? 0

        // ── Vendedores ────────────────────────────────────────────────
        const sellers = d.sellers || {}
        this.sellersDetalhadosApi = sellers.detalhados  || []
        this.fastestSellerApi     = sellers.fastestSeller || null
        this.slowestSellerApi     = sellers.slowestSeller || null
        this.topSellerApi         = sellers.topSeller    || null

        // ── Produtos ──────────────────────────────────────────────────
        const produtos = d.produtos || {}
        this.topProductApi       = produtos.topProduct       || null
        this.otherTopProductsApi = produtos.otherTopProducts || []
        this.volumeChart         = d.volumeChartData

        // ── Última cotação ────────────────────────────────────────────
        this.lastCotacaoApi = d.lastCotacao || null

        this.lastUpdate = new Date().toLocaleString('pt-BR')

        // Atualiza gráficos após dados carregados
        this.$nextTick(() => {
          this.refreshTopSellerChart()
        })

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingDashboard = false
      }
    },

    // ── Filtros / Período ────────────────────────────────────────────────
    setPreset(key) {
      this.activePeriod = key;
      const today = new Date();
      this.barcodeSearch = ""

      this.dateTo = today.toISOString().slice(0, 10);
      if (key === 'hoje') {
        this.dateFrom = today.toISOString().slice(0, 10);
      } else if (key === 'semana') {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        this.dateFrom = d.toISOString().slice(0, 10);
      } else if (key === 'mes') {
        this.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      } else if (key === 'trimestre') {
        const d = new Date(today);
        d.setMonth(d.getMonth() - 3);
        this.dateFrom = d.toISOString().slice(0, 10);
      } else if (key === 'ano') {
        
        this.dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
      }


      this.refreshData();
    },

    applyCustomRange() {
      this.activePeriod = 'custom';
      this.refreshData();
    },

    refreshData() {
      this.carregarDashboard()
      this.$nextTick(() => {
        setTimeout(()=>{
          this.refreshVolumeChart();
          this.refreshPriceEvoChart();
          this.refreshComparisonChart();
          this.refreshTopSellerChart();
          this.lastUpdate = new Date().toLocaleString('pt-BR');
          this.searchProduct()
        }, 800)
      });
    },

    // ── Busca produto (gráfico de evolução de preço — API real) ─────────
    debouncedSearch() {
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => this.searchProduct(), 1200);
    },

    async searchProduct() {
      const q = this.barcodeSearch.trim();
      if (!q) return;

      try {
        const payload = {
          codigo_barra: q,
          timestamp_inicio: new Date(this.dateFrom).getTime(),
          timestamp_fim: new Date(this.dateTo + 'T23:59:59').getTime(),
        };

        const res = await api.post(
          `/mvpu/cotacao/getEvolucaoPrecoProduto/${this.auth.id_loja}`,
          payload
        );

        const d = res.data?.data;
        if (!d || d.semDados) {
          this.priceEvoData = null;
          this.selectedProduct = null;
          this.refreshPriceEvoChart();
          return;
        }

        // Monta selectedProduct com dados vindos da API (data.produto)
        const prod = d.produto || {};
        this.selectedProduct = {
          barcode: prod.barcode || q,
          name: prod.name || q,
          category: prod.category || 'Sem categoria',
          lastPrice: prod.lastPrice || '0,00',
          priceChange: prod.priceChange ?? 0,
          totalQuotes: prod.totalQuotes ?? 0,
        };

        // Guarda os dados do gráfico retornados pela API (data.priceEvoChart)
        this.priceEvoData = d.priceEvoChart || null;

        this.refreshPriceEvoChart();
      } catch (e) {
        exibeErro(e, this.$toast);
      }
    },

    // ── Charts ────────────────────────────────────────────────────────────
    getChartColors() {
      return {
        ACCENT: '#FF8049',
        ACCENT_SOFT: 'rgba(255,128,73,0.15)',
        GREEN: '#16a34a',
        GREEN_SOFT: 'rgba(22,163,74,0.15)',
        BLUE: '#2563eb',
        BLUE_SOFT: 'rgba(37,99,235,0.15)',
        YELLOW: '#ca8a04',
        RED: '#dc2626',
        TEXT: '#64748b',
        GRID: 'rgba(226,232,240,0.8)',
      };
    },

    getBaseTooltip() {
      return {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      };
    },

    refreshVolumeChart() {
      const { ACCENT, GREEN, TEXT, GRID } = this.getChartColors();
      const tooltip = this.getBaseTooltip();

      ////////////////////////////////////////////////////////////
      // Dados reais
      const labels = this.volumeChart?.labels || [];
      const criadas = this.volumeChart?.criadas || [];
      const concluid = this.volumeChart?.concluidas || [];

      ////////////////////////////////////////////////////////////
      // Canvas
      const ctx = this.$refs.volumeChart;
      if (!ctx) return;

      ////////////////////////////////////////////////////////////
      // Destroy anterior
      if (this._charts.volume) {
        this._charts.volume.destroy();
      }

      ////////////////////////////////////////////////////////////
      // Novo gráfico
      this._charts.volume = new ChartJS(ctx, {
        type: 'bar',

        data: {
          labels,

          datasets: [
            {
              label: 'Criadas',
              data: criadas,
              backgroundColor: ACCENT + 'CC',
              borderRadius: 4,
              borderSkipped: false,
            },

            {
              label: 'Concluídas',
              data: concluid,
              backgroundColor: GREEN + 'CC',
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: TEXT,
                font: { size: 11 },
                boxWidth: 10,
                padding: 16,
              },
            },

            tooltip,
          },

          scales: {
            x: {
              grid: { display: false },

              ticks: {
                color: TEXT,
                font: { size: 10 },

                ////////////////////////////////////////////////////////////
                // Formata data
                callback: function(value) {
                  const label = this.getLabelForValue(value);

                  // 2026-05-08 -> 08/05
                  if (label?.includes('-')) {
                    const [ano, mes, dia] = label.split('-');
                    return `${dia}/${mes}`;
                  }

                  return label;
                },
              },
            },

            y: {
              beginAtZero: true,

              grid: {
                color: GRID,
              },

              ticks: {
                color: TEXT,
                font: { size: 10 },
                stepSize: 1,
              },
            },
          },
        },
      });
    },

    

    refreshPriceEvoChart() {
      const { ACCENT, BLUE, TEXT, GRID } = this.getChartColors();
      const tooltip = this.getBaseTooltip();

      // Usa dados reais da API se disponíveis (data.priceEvoChart)
      let labels, data, mediaPeriodo, mediaArray;
      if (this.priceEvoData) {
        labels       = this.priceEvoData.labels      || [];
        data         = this.priceEvoData.precos       || [];
        mediaPeriodo = this.priceEvoData.mediaPeriodo ?? null;
        mediaArray   = this.priceEvoData.mediaArray   || labels.map(() => mediaPeriodo);
      } else {
        // Fallback: placeholder visual quando nenhum produto foi pesquisado ainda
        labels     = ['—'];
        data       = [0];
        mediaArray = [0];
      }

      const ctx = this.$refs.priceEvoChart;
      if (!ctx) return;

      if (this._charts.priceEvo) { this._charts.priceEvo.destroy(); }

      this._charts.priceEvo = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: this.selectedProduct?.name || 'Evolução de Preço',
              data,
              borderColor: ACCENT,
              backgroundColor: 'rgba(255,128,73,0.10)',
              borderWidth: 2.5,
              pointBackgroundColor: ACCENT,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: true,
              tension: 0.35,
            },
            {
              label: 'Média do período',
              data: mediaArray,
              borderColor: BLUE + '88',
              borderWidth: 1.5,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: TEXT, font: { size: 11 }, boxWidth: 10 } },
            tooltip: { ...tooltip, callbacks: { label: ctx => `R$ ${Number(ctx.parsed.y).toFixed(2)}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 10 } } },
            y: {
              grid: { color: GRID },
              ticks: { color: TEXT, font: { size: 10 }, callback: v => `R$ ${Number(v).toFixed(2)}` },
            },
          },
        },
      });
    },

    refreshComparisonChart() {
      const { TEXT, GRID } = this.getChartColors();
      const tooltip = this.getBaseTooltip();

      const suppliers = ['Dist. Alpha', 'Atacado Beta', 'Forn. Gama', 'Com. Delta', 'Outros'];
      const colors = ['#FF8049', '#2563eb', '#16a34a', '#ca8a04', '#dc2626'];

      const ctx = this.$refs.comparisonChart;
      if (!ctx) return;

      if (this._charts.comparison) { this._charts.comparison.destroy(); }

      this._charts.comparison = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: ['Leite 1L', 'Arroz 5kg', 'Óleo 900ml', 'Refrigerante 2L', 'Feijão 1kg'],
          datasets: suppliers.map((s, i) => ({
            label: s,
            data: [4.2, 5.1, 3.8, 4.6, 4.0].map(v => parseFloat((v + (Math.random() - 0.5) * 1.5).toFixed(2))),
            backgroundColor: colors[i] + 'CC',
            borderRadius: 3,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: TEXT, font: { size: 11 }, boxWidth: 10 } },
            tooltip: { ...tooltip, callbacks: { label: ctx => `${ctx.dataset.label}: R$ ${ctx.parsed.y.toFixed(2)}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 10 } } },
            y: {
              grid: { color: GRID },
              ticks: { color: TEXT, font: { size: 10 }, callback: v => `R$ ${v.toFixed(2)}` },
            },
          },
        },
      });
    },

    refreshTopSellerChart() {
      const { ACCENT, TEXT } = this.getChartColors();
      const tooltip = this.getBaseTooltip();

      const ctx = this.$refs.topSellerChart;
      if (!ctx) return;

      if (this._charts.topSeller) { this._charts.topSeller.destroy(); }

      // Usa dados reais da API se disponíveis, caso contrário usa placeholder
      const sellersData = this.sellersSummary.length > 0
        ? this.sellersSummary
        : [{ name: 'Sem dados', qtdVendas: 1 }]

      this._charts.topSeller = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: sellersData.map(s => s.name ? s.name.split(' ')[0] : '—'),
          datasets: [{
            data: sellersData.map(s => s.qtdVendas || 0),
            backgroundColor: ['#FF8049CC', '#2563ebCC', '#16a34aCC', '#dc2626CC'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: TEXT, font: { size: 10 }, padding: 8, boxWidth: 8 } },
            tooltip,
          },
        },
      });
    },

    exportPDF() {
      window.print();
    },

    exportExcel() {
      alert('Exportação para Excel em desenvolvimento.');
    },
  },

  async mounted() {
    const authStore = useAuthStore()
    this.auth = authStore


    setTimeout(async ()=>{
      await this.carregarDashboard()
  
      this.$nextTick(() => {
        this.refreshVolumeChart();
        this.refreshPriceEvoChart();
        this.refreshComparisonChart();
        this.refreshTopSellerChart();
      });
    }, 500)
  },

};
</script>

<style scoped>
/* ══════════════════════════════════════
   TOKENS — Design System Market Vizium
══════════════════════════════════════ */
.cotacao-root {
  --accent:    #FF8049;
  --accent2:   #FF804915;
  --acc-h:     #E65D26;
  --green:     #16a34a;
  --green2:    #dcfce7;
  --blue:      #2563eb;
  --blue2:     #dbeafe;
  --yellow:    #ca8a04;
  --yellow2:   #fef9c3;
  --red:       #dc2626;
  --red2:      #fee2e2;
  --bg:        #f8f9fa;
  --bg-card:   #ffffff;
  --bg-el:     #f1f3f5;
  --bg-el2:    #e9ecef;
  --border:    #e2e8f0;
  --border2:   #cbd5e1;
  --text1:     #1e293b;
  --text2:     #64748b;
  --muted:     #94a3b8;
  --radius:    13px;
  --radius-s:  8px;
  --shadow:    0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  --shadow-md: 0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.03);

  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text1);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ══ HEADER ══ */
.reports-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 16px 28px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; position: sticky; top: 0; z-index: 100;
  box-shadow: var(--shadow);
}
.rh-left { display: flex; align-items: center; gap: 16px; }
.rh-brand { display: flex; align-items: center; gap: 12px; }
.rh-brand-icon {
  width: 40px; height: 40px; background: var(--accent);
  border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 20px;
}
.rh-title { font-size: 17px; font-weight: 800; color: var(--text1); letter-spacing: -0.3px; }
.rh-sub { font-size: 11.5px; color: var(--muted); margin-top: 1px; }
.rh-right { display: flex; align-items: center; gap: 10px; }
.rh-sync { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--muted); margin-right: 6px; }
.btn-pdf, .btn-xls {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: var(--radius-s);
  font-size: 12.5px; font-weight: 600;
  cursor: pointer; border: none; transition: all 0.15s; font-family: inherit;
}
.btn-pdf { background: var(--accent); color: white; }
.btn-pdf:hover { background: var(--acc-h); }
.btn-xls { background: var(--bg-el); color: var(--text2); border: 1px solid var(--border); }
.btn-xls:hover { background: var(--bg-el2); }

/* ══ FILTER BAR ══ */
.filter-bar {
  background: var(--bg-card); border-bottom: 1px solid var(--border);
  padding: 12px 28px; display: flex; align-items: center;
  gap: 12px; flex-wrap: wrap;
}
.filter-section { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;
}
.filter-divider { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }
.period-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.pchip {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 11px; border-radius: 20px;
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); font-size: 11.5px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.pchip.active { background: var(--accent2); border-color: var(--accent); color: var(--accent); font-weight: 700; }
.pchip:hover:not(.active) { background: var(--bg-el2); }
.date-range {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-el); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 4px 10px;
}
.dr-label { font-size: 11px; color: var(--muted); }
.dr-input { border: none; background: transparent; font-size: 12px; color: var(--text1); font-family: inherit; outline: none; }
.btn-apply {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 12px; border-radius: var(--radius-s);
  background: var(--accent); color: white; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
}
.btn-apply:hover { background: var(--acc-h); }
.sel-custom {
  padding: 5px 10px; border-radius: var(--radius-s);
  border: 1px solid var(--border); background: var(--bg-el);
  color: var(--text1); font-size: 12px; font-family: inherit; outline: none; cursor: pointer;
}

/* ══ PERIOD BADGE ══ */
.period-badge-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 28px; border-bottom: 1px solid var(--border);
  background: var(--accent2); flex-wrap: wrap;
}
.period-badge, .pb-location {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; font-weight: 600; color: var(--accent);
  background: white; border: 1px solid var(--accent);
  padding: 4px 12px; border-radius: 20px;
}
.pb-stat {
  display: flex; flex-direction: column; align-items: flex-end;
  background: white; border: 1px solid var(--border);
  padding: 4px 12px; border-radius: var(--radius-s);
}
.pb-stat-val { font-size: 13px; font-weight: 800; color: var(--text1); }
.pb-stat-val.accent { color: var(--accent); }
.pb-stat-val.green { color: var(--green); }
.pb-stat-lbl { font-size: 10px; color: var(--muted); }
.accent-text { color: var(--accent); }
.green-text { color: var(--green); }
.red-text { color: var(--red); }

/* ══ CONTENT ══ */
.reports-content { padding: 24px 28px; flex: 1; display: flex; flex-direction: column; gap: 32px; }

/* ══ SECTION BLOCK ══ */
.section-block { display: flex; flex-direction: column; gap: 16px; }
.section-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; background: var(--bg-card);
  border-radius: var(--radius); border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.section-icon {
  width: 38px; height: 38px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 18px; flex-shrink: 0;
}
.section-title { font-size: 15px; font-weight: 800; color: var(--text1); letter-spacing: -0.3px; }
.section-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

/* ══ CARDS ══ */
.card {
  background: var(--bg-card); border-radius: var(--radius);
  border: 1px solid var(--border); box-shadow: var(--shadow);
  overflow: hidden;
}
.card-head {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px; border-bottom: 1px solid var(--border);
}
.card-icon {
  width: 34px; height: 34px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 17px; flex-shrink: 0;
}
.card-title { font-size: 13.5px; font-weight: 700; color: var(--text1); }
.card-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
.card-actions { margin-left: auto; display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
.chip {
  padding: 4px 10px; border-radius: 20px;
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.chip.active { background: var(--accent2); border-color: var(--accent); color: var(--accent); font-weight: 700; }
.chip:hover:not(.active) { background: var(--bg-el2); }

/* ══ COLOR HELPERS ══ */
.c-orange { background: var(--accent); }
.c-green  { background: var(--green);  }
.c-blue   { background: var(--blue);   }
.c-yellow { background: var(--yellow); }
.c-red    { background: var(--red);    }

/* ══ KPI GRID ══ */
.kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.kpi-report {
  position: relative; overflow: hidden;
  background: var(--bg-card); border-radius: var(--radius);
  border: 1px solid var(--border); padding: 18px 18px 14px;
  display: flex; gap: 12px; align-items: flex-start;
  box-shadow: var(--shadow);
}
.kr-icon {
  width: 40px; height: 40px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 20px; flex-shrink: 0;
}
.kr-body { flex: 1; min-width: 0; }
.kr-label { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.kr-value { font-size: 22px; font-weight: 900; letter-spacing: -0.8px; color: var(--text1); margin: 4px 0 6px; }
.kr-footer { display: flex; align-items: center; gap: 6px; }
.kr-delta { display: flex; align-items: center; gap: 2px; font-size: 11.5px; font-weight: 700; }
.kr-delta.up   { color: var(--green); }
.kr-delta.down { color: var(--red);   }
.kr-sub { font-size: 11px; color: var(--muted); }
.kr-bg {
  position: absolute; right: -10px; bottom: -10px;
  font-size: 72px !important; opacity: 0.04; pointer-events: none;
}
.k-orange .kr-icon { background: var(--accent); }
.k-green  .kr-icon { background: var(--green);  }
.k-blue   .kr-icon { background: var(--blue);   }
.k-yellow .kr-icon { background: var(--yellow); }
.k-red    .kr-icon { background: var(--red);    }

/* ══ MINI KPI ══ */
.kpi-mini {
  background: var(--bg-card); border-radius: var(--radius);
  border: 1px solid var(--border); padding: 14px 16px;
  box-shadow: var(--shadow);
}
.kmr-label { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
.kmr-value { font-size: 19px; font-weight: 900; color: var(--text1); letter-spacing: -0.5px; }
.kmr-sub { font-size: 11px; margin-top: 4px; color: var(--muted); }

/* ══ CHART GRID ══ */
.chart-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-wrap { padding: 14px 18px; position: relative; }
.chart-wrap.h240 { height: 240px; }
.chart-wrap.h260 { height: 260px; }
.chart-wrap.h160 { height: 160px; }
.chart-wrap canvas { width: 100% !important; height: 100% !important; }

/* ══ BARCODE SEARCH ══ */
.barcode-search {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-el); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 5px 10px;
}
.barcode-input {
  border: none; background: transparent; font-size: 12px;
  color: var(--text1); font-family: inherit; outline: none;
  width: 160px;
}
.barcode-input::placeholder { color: var(--muted); }
.btn-barcode {
  background: var(--accent); color: white;
  border: none; border-radius: 6px;
  padding: 3px 8px; cursor: pointer;
  display: flex; align-items: center;
  transition: all 0.15s;
}
.btn-barcode:hover { background: var(--acc-h); }

/* ══ SELECTED PRODUCT BAR ══ */
.selected-product-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px; background: var(--accent2);
  border-bottom: 1px solid var(--border);
}
.spb-info { display: flex; align-items: center; gap: 8px; }
.spb-code { font-size: 11px; font-weight: 700; color: var(--muted); font-family: monospace; }
.spb-name { font-size: 13px; font-weight: 700; color: var(--text1); }
.spb-stats { display: flex; gap: 16px; }
.spb-stat { text-align: right; }
.spb-stat-val { font-size: 13px; font-weight: 800; color: var(--text1); }
.spb-stat-lbl { font-size: 10px; color: var(--muted); }

/* ══ SELLER SUMMARY GRID ══ */
.seller-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.seller-card {
  background: var(--bg-card); border-radius: var(--radius);
  border: 1px solid var(--border); padding: 16px;
  box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 10px;
}
.sc-top { display: flex; align-items: center; gap: 8px; }
.sc-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: white; flex-shrink: 0;
}
.sc-avatar.large { width: 52px; height: 52px; font-size: 18px; }
.sc-av-orange { background: var(--accent); }
.sc-av-blue   { background: var(--blue); }
.sc-av-green  { background: var(--green); }
.sc-av-red    { background: var(--red); }
.sc-av-yellow { background: var(--yellow); }
.sc-av-purple { background: #7c3aed; }
.sc-info { flex: 1; min-width: 0; }
.sc-name { font-size: 13px; font-weight: 700; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sc-level { font-size: 11px; color: var(--muted); }
.sc-status {
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  border-radius: 20px; white-space: nowrap;
}
.sc-ok     { background: var(--green2); color: var(--green); }
.sc-warn   { background: var(--yellow2); color: var(--yellow); }
.sc-danger { background: var(--red2); color: var(--red); }
.sc-meta-bar {
  height: 4px; background: var(--bg-el2); border-radius: 2px; overflow: hidden;
}
.sc-meta-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.sc-stats { display: flex; justify-content: space-between; }
.sc-stat { text-align: center; }
.sc-stat-val { font-size: 13px; font-weight: 800; color: var(--text1); }
.sc-stat-lbl { font-size: 9.5px; color: var(--muted); }
.sc-commission {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 8px; border-top: 1px solid var(--border);
}
.scc-lbl { font-size: 11px; color: var(--muted); }
.scc-val { font-size: 13px; font-weight: 800; color: var(--accent); }

/* ══ REPORT TABLE ══ */
.report-table {
  width: 100%; border-collapse: collapse;
  font-size: 12px;
}
.report-table thead tr {
  background: var(--bg-el); border-bottom: 1px solid var(--border);
}
.report-table th {
  padding-top: 10px; padding-bottom: 10px;
  text-align: left; font-size: 10.5px;
  font-weight: 700; color: var(--muted);
}
.report-table tbody tr {
  border-bottom: 1px solid var(--border); transition: background 0.1s;
}
.report-table tbody tr:hover { background: var(--accent2); }
.report-table td { padding-top: 10px; padding-bottom: 10px; vertical-align: middle; }
.user-cell { display: flex; align-items: center; gap: 8px; }
.mini-av {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: white; flex-shrink: 0;
}
.cell-name { font-size: 12.5px; font-weight: 600; color: var(--text1); }
.cell-sub { font-size: 11px; color: var(--muted); }
.mono-bold { font-weight: 700; font-family: 'Inter', monospace; }
.rank-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 6px;
  font-size: 11px; font-weight: 800;
  background: var(--bg-el); color: var(--muted);
}
.rank-num.gold   { background: #fef9c3; color: #b45309; }
.rank-num.silver { background: #f1f5f9; color: #475569; }
.rank-num.bronze { background: #fef3c7; color: #92400e; }
.inline-bar {
  display: flex; align-items: center; gap: 6px;
  height: 18px; background: var(--bg-el2);
  border-radius: 4px; overflow: hidden; position: relative;
  min-width: 80px;
}
.ib-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }
.ib-val { position: absolute; right: 6px; font-size: 10px; font-weight: 700; color: var(--text1); }
.tag-r {
  display: inline-block; padding: 2px 8px; border-radius: 8px;
  font-size: 11px; font-weight: 700;
}
.tag-green  { background: var(--green2); color: var(--green); }
.tag-orange { background: var(--yellow2); color: var(--yellow); }
.tag-red    { background: var(--red2); color: var(--red); }
.tag-blue   { background: var(--blue2); color: var(--blue); }
.tag-blue-soft { background: var(--blue2); color: var(--blue); }

/* ══ HIGHLIGHT CARD ══ */
.highlight-card.highlight-green { border-top: 3px solid var(--green); }
.highlight-card.highlight-red   { border-top: 3px solid var(--red); }
.highlight-body {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 18px;
}
.hb-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 800; color: white; flex-shrink: 0;
}
.hb-info { flex: 1; }
.hb-name { font-size: 14px; font-weight: 800; color: var(--text1); }
.hb-company { font-size: 11.5px; color: var(--muted); margin-bottom: 4px; }
.hb-metric {
  display: flex; align-items: center; gap: 4px;
  font-size: 12.5px; font-weight: 700;
}
.hb-stats { display: flex; flex-direction: column; gap: 6px; }
.hb-stat { text-align: right; }
.hb-stat-val { font-size: 14px; font-weight: 900; color: var(--text1); }
.hb-stat-val.green { color: var(--green); }
.hb-stat-val.red   { color: var(--red); }
.hb-stat-lbl { font-size: 10px; color: var(--muted); }

/* ══ GRID ══ */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

/* ══ TOP PRODUCT ══ */
.top-product-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.tpb-rank { font-size: 36px; font-weight: 900; color: var(--accent); opacity: 0.25; line-height: 1; }
.tpb-info { display: flex; flex-direction: column; gap: 4px; }
.tpb-name { font-size: 14px; font-weight: 800; color: var(--text1); }
.tpb-code { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); font-family: monospace; }
.tpb-category { margin-top: 2px; }
.tpb-metrics { display: flex; justify-content: space-between; }
.tpb-metric { text-align: center; }
.tpbm-val { font-size: 16px; font-weight: 900; color: var(--text1); }
.tpbm-val.accent { color: var(--accent); }
.tpbm-val.green  { color: var(--green); }
.tpbm-lbl { font-size: 10px; color: var(--muted); }
.tpb-bar-wrap { height: 5px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.tpb-bar-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.5s; }
.tpb-footer { display: flex; align-items: center; gap: 4px; }
.top-products-list { border-top: 1px solid var(--border); padding: 12px 18px 14px; }
.tpl-header { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 10px; }
.tpl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tpl-rank { font-size: 11px; font-weight: 700; color: var(--muted); width: 14px; text-align: center; flex-shrink: 0; }
.tpl-info { min-width: 0; width: 110px; flex-shrink: 0; }
.tpl-name { font-size: 11.5px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tpl-code { font-size: 10px; color: var(--muted); font-family: monospace; }
.tpl-bar-wrap { flex: 1; height: 6px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.tpl-bar { height: 100%; background: var(--accent); border-radius: 3px; opacity: 0.55; }
.tpl-qty { font-size: 11px; color: var(--muted); width: 52px; text-align: right; white-space: nowrap; }

/* ══ TOP SELLER ══ */
.top-seller-body {
  padding: 16px 18px; display: flex; flex-direction: column;
  align-items: center; gap: 8px;
}
.tsb-crown { font-size: 24px; line-height: 1; }
.tsb-name { font-size: 15px; font-weight: 800; color: var(--text1); text-align: center; }
.tsb-company { font-size: 11.5px; color: var(--muted); text-align: center; margin-bottom: 4px; }
.tsb-metrics { display: flex; gap: 20px; }
.tsb-metric { text-align: center; }
.tsb-val { font-size: 16px; font-weight: 900; color: var(--text1); }
.tsb-val.accent { color: var(--accent); }
.tsb-val.green  { color: var(--green); }
.tsb-lbl { font-size: 10px; color: var(--muted); }
.tsb-total {
  display: flex; flex-direction: column; align-items: center;
  border-top: 1px solid var(--border); padding-top: 10px; width: 100%;
}
.tsb-total-lbl { font-size: 11px; color: var(--muted); }
.tsb-total-val { font-size: 18px; font-weight: 900; color: var(--accent); letter-spacing: -0.5px; }

/* ══ LAST QUOTE ══ */
.last-quote-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; }
.lqb-badge {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; background: var(--blue2);
  border-radius: var(--radius-s);
}
.lqb-name { font-size: 14px; font-weight: 800; color: var(--blue); }
.lqb-date { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); margin-top: 2px; }
.lqb-status { margin-left: auto; }
.lqb-details { display: flex; flex-direction: column; gap: 8px; }
.lqb-detail-row { display: flex; align-items: center; justify-content: space-between; }
.lqb-detail-lbl { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--muted); }
.lqb-detail-val { font-size: 12px; font-weight: 700; color: var(--text1); }

/* ══ AVG QUOTE BOX ══ */
.avg-quote-box {
  border-top: 1px solid var(--border);
  padding: 14px 18px; background: var(--accent2);
}
.aqb-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;
}
.aqb-value { font-size: 24px; font-weight: 900; color: var(--accent); letter-spacing: -0.8px; }
.aqb-sub { font-size: 11.5px; color: var(--muted); margin-top: 2px; margin-bottom: 12px; }
.aqb-breakdown { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.aqb-b-item { text-align: center; flex: 1; }
.aqb-b-val { font-size: 13px; font-weight: 800; color: var(--text1); }
.aqb-b-lbl { font-size: 10px; color: var(--muted); }
.aqb-b-sep { width: 1px; height: 28px; background: var(--border); }

/* ══ STOCK SUMMARY ══ */
.stock-summary {
  display: flex; justify-content: space-around;
  padding: 12px 18px; border-top: 1px solid var(--border);
}
.ss-item { text-align: center; }
.ss-val  { font-size: 17px; font-weight: 800; letter-spacing: -0.4px; }
.ss-val.accent { color: var(--accent); }
.ss-val.green  { color: var(--green);  }
.ss-val.red    { color: var(--red);    }
.ss-val.blue   { color: var(--blue);   }
.ss-lbl  { font-size: 10px; color: var(--muted); margin-top: 2px; }

/* ══ FOOTER ══ */
.reports-footer {
  padding: 14px 28px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--muted);
  background: var(--bg-card);
}

/* ══ RESPONSIVE ══ */
@media (max-width: 1280px) {
  .kpi-grid-4        { grid-template-columns: repeat(2, 1fr); }
  .seller-summary-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-section-grid { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .reports-content { padding: 16px; }
  .kpi-grid-4 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr; }
  .seller-summary-grid { grid-template-columns: 1fr; }
  .chart-section-grid { grid-template-columns: 1fr; }
  .period-badge-row { flex-direction: column; align-items: flex-start; }
  .barcode-input { width: 100px; }
}

/* ══ PRINT ══ */
@media print {
  .reports-header, .filter-bar { position: static; }
  .rh-right { display: none; }
  .card { break-inside: avoid; }
  .section-block { break-inside: avoid; }
}


.table-wrapper {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: auto;
}
</style>