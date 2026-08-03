<template>
  <div class="reports-root">

    <!-- ══ HEADER ══ -->
    <div class="reports-header">
      <div class="rh-left">
        <div class="rh-brand">
          <span class="material-symbols-outlined rh-brand-icon">summarize</span>
          <div>
            <div class="rh-title">Central de Relatórios</div>
            <div class="rh-sub">Market Vizium ERP · Loja Central</div>
          </div>
        </div>
      </div>
      <div class="rh-right">
        <div class="rh-sync">
          <span class="material-symbols-outlined" style="font-size:14px;color:var(--green)">fiber_manual_record</span>
          Dados em tempo real
        </div>
        <button class="btn-pdf" @click="exportToPDF">
          <span class="material-symbols-outlined">picture_as_pdf</span>
          Exportar PDF
        </button>
        <button class="btn-xls">
          <span class="material-symbols-outlined">table_view</span>
          Exportar Excel
        </button>
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

      <div class="filter-divider"></div>

      <div class="filter-section">
        <span class="filter-label">
          <span class="material-symbols-outlined" style="font-size:15px">storefront</span>
          Local
        </span>
        <select v-model="selectedLocation" class="sel-custom">
          <option value="all">Todas as lojas</option>
          <option value="central">Loja Central</option>
          <option value="norte">Filial Norte</option>
          <option value="sul">Filial Sul</option>
          <option value="shopping">Quiosque Shopping A</option>
          <option value="ecom">E-commerce</option>
        </select>
      </div>

      <div class="filter-divider"></div>

      <div class="filter-section">
        <span class="filter-label">
          <span class="material-symbols-outlined" style="font-size:15px">person</span>
          Vendedor
        </span>
        <select v-model="selectedSeller" class="sel-custom">
          <option value="all">Todos</option>
          <option value="ap">Ana Paula Silva</option>
          <option value="cm">Carlos Mendes</option>
          <option value="fc">Fernanda Costa</option>
          <option value="rs">Rafael Souza</option>
          <option value="ml">Mariana Lopes</option>
        </select>
      </div>

      <div class="filter-divider"></div>

      <div class="filter-section">
        <span class="filter-label">
          <span class="material-symbols-outlined" style="font-size:15px">view_module</span>
          Módulos
        </span>
        <div class="mod-chips">
          <button
            v-for="m in modules"
            :key="m.key"
            class="mchip"
            :class="{ active: activeModules.includes(m.key) }"
            @click="toggleModule(m.key)"
          >
            <span class="material-symbols-outlined" style="font-size:13px">{{ m.icon }}</span>
            {{ m.label }}
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
        <span class="material-symbols-outlined" style="font-size:14px">location_on</span>
        {{ locationLabel }}
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <div class="pb-stat">
          <span class="pb-stat-val">1.842</span>
          <span class="pb-stat-lbl">Transações</span>
        </div>
        <div class="pb-stat">
          <span class="pb-stat-val accent">R$ 128.430</span>
          <span class="pb-stat-lbl">Receita Bruta</span>
        </div>
        <div class="pb-stat">
          <span class="pb-stat-val green">34,7%</span>
          <span class="pb-stat-lbl">Margem</span>
        </div>
      </div>
    </div>

    <!-- ══ CONTENT ══ -->
    <div class="reports-content" id="reports-pdf-area">

      <!-- ═══════════════════════════════════
           SEÇÃO 1 — RESUMO EXECUTIVO
      ═══════════════════════════════════ -->
      <div class="section-block" v-if="activeModules.includes('vendas')">
        <div class="section-header">
          <div class="section-icon c-orange">
            <span class="material-symbols-outlined">monitoring</span>
          </div>
          <div>
            <div class="section-title">Resumo Executivo de Vendas</div>
            <div class="section-sub">Principais indicadores do período selecionado</div>
          </div>
          <div style="margin-left:auto">
            <button class="btn-section-pdf" @click="exportSection('vendas')">
              <span class="material-symbols-outlined" style="font-size:14px">download</span>
              PDF desta seção
            </button>
          </div>
        </div>

        <div class="kpi-grid-4">
          <div v-for="k in execKpis" :key="k.label" class="kpi-report" :class="k.cls">
            <div class="kr-icon">
              <span class="material-symbols-outlined">{{ k.icon }}</span>
            </div>
            <div class="kr-body">
              <div class="kr-label">{{ k.label }}</div>
              <div class="kr-value">{{ k.prefix }}{{ k.value }}</div>
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

        <div class="kpi-grid-6">
          <div v-for="m in miniMetrics" :key="m.label" class="kpi-mini-r">
            <div class="kmr-label">{{ m.label }}</div>
            <div class="kmr-value">{{ m.value }}</div>
            <div class="kmr-sub">
              <span v-if="m.trend !== null" :style="{ color: m.up ? 'var(--green)' : 'var(--red)' }" style="font-weight:700">
                {{ m.up ? '▲' : '▼' }} {{ m.trend }}
              </span>
              {{ m.sub }}
            </div>
          </div>
        </div>

        <div class="chart-section-grid">
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">show_chart</span></div>
              <div>
                <div class="card-title">Evolução de Vendas</div>
                <div class="card-sub">Bruta vs Líquida · {{ periodLabel }}</div>
              </div>
              <div class="card-actions">
                <button
                  v-for="opt in ['Bruta','Líquida','Ambas']"
                  :key="opt"
                  class="chip"
                  :class="{ active: evoFilter === opt }"
                  @click="evoFilter = opt"
                >{{ opt }}</button>
              </div>
            </div>
            <div class="chart-wrap h240">
              <canvas ref="evoChart" id="evoChart"></canvas>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">bar_chart</span></div>
              <div>
                <div class="card-title">Comparativo Mensal</div>
                <div class="card-sub">Últimos 6 meses · tendência</div>
              </div>
            </div>
            <div class="chart-wrap h240">
              <canvas ref="monthlyChart" id="monthlyChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Demonstrativo Financeiro -->
        <div class="card">
          <div class="card-head">
            <div class="card-icon c-green"><span class="material-symbols-outlined">account_balance_wallet</span></div>
            <div>
              <div class="card-title">Demonstrativo Financeiro</div>
              <div class="card-sub">DRE simplificado · {{ periodLabel }}</div>
            </div>
          </div>
          <div class="fin-grid">
            <div v-for="row in dreSummary" :key="row.label" class="dre-row" :class="row.highlight ? 'dre-highlight' : ''">
              <div class="dre-label" :style="row.indent ? 'padding-left:20px;color:var(--muted)' : ''">{{ row.label }}</div>
              <div class="dre-spacer"></div>
              <div class="dre-value" :style="{ color: row.color }">{{ row.value }}</div>
              <div class="dre-pct" :style="{ color: row.color }">{{ row.pct }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════
           SEÇÃO 2 — RELATÓRIO DE VENDEDORES
      ═══════════════════════════════════ -->
      <div class="section-block" v-if="activeModules.includes('vendedores')">
        <div class="section-header">
          <div class="section-icon c-blue">
            <span class="material-symbols-outlined">group</span>
          </div>
          <div>
            <div class="section-title">Relatório de Vendedores</div>
            <div class="section-sub">Performance individual, metas e comissões</div>
          </div>
          <div style="margin-left:auto">
            <button class="btn-section-pdf" @click="exportSection('vendedores')">
              <span class="material-symbols-outlined" style="font-size:14px">download</span>
              PDF desta seção
            </button>
          </div>
        </div>

        <div class="seller-summary-grid">
          <div v-for="s in sellerSummary" :key="s.name" class="seller-card">
            <div class="sc-top">
              <div class="sc-avatar" :class="'sc-av-'+s.avColor">{{ s.initials }}</div>
              <div class="sc-info">
                <div class="sc-name">{{ s.name }}</div>
                <div class="sc-level">{{ s.level }}</div>
              </div>
              <div class="sc-status" :class="s.meta >= 100 ? 'sc-ok' : s.meta >= 80 ? 'sc-warn' : 'sc-danger'">
                {{ s.meta >= 100 ? 'Meta ✓' : s.meta >= 80 ? 'Em progresso' : 'Atenção' }}
              </div>
            </div>
            <div class="sc-meta-bar">
              <div class="sc-meta-fill" :style="{ width: Math.min(s.meta,100)+'%', background: s.meta >= 100 ? 'var(--green)' : s.meta >= 80 ? 'var(--accent)' : 'var(--red)' }"></div>
            </div>
            <div class="sc-stats">
              <div class="sc-stat">
                <div class="sc-stat-val">R$ {{ s.sales }}</div>
                <div class="sc-stat-lbl">Vendas</div>
              </div>
              <div class="sc-stat">
                <div class="sc-stat-val">{{ s.meta }}%</div>
                <div class="sc-stat-lbl">Meta</div>
              </div>
              <div class="sc-stat">
                <div class="sc-stat-val">R$ {{ s.ticket }}</div>
                <div class="sc-stat-lbl">Ticket Méd.</div>
              </div>
              <div class="sc-stat">
                <div class="sc-stat-val">{{ s.count }}</div>
                <div class="sc-stat-lbl">Vendas</div>
              </div>
            </div>
            <div class="sc-commission">
              <span class="scc-lbl">Comissão estimada</span>
              <span class="scc-val">R$ {{ s.commission }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-icon c-blue"><span class="material-symbols-outlined">leaderboard</span></div>
            <div>
              <div class="card-title">Ranking Detalhado de Vendedores</div>
              <div class="card-sub">Histórico e comparativo com período anterior</div>
            </div>
            <div class="card-actions">
              <button v-for="f in ['Valor','Qtd.','Ticket','Meta']" :key="f" class="chip" :class="{ active: sellerRankFilter === f }" @click="sellerRankFilter = f">{{ f }}</button>
            </div>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th style="width:36px">#</th>
                <th>VENDEDOR</th>
                <th>VENDAS (R$)</th>
                <th>QTDE.</th>
                <th>TICKET MÉD.</th>
                <th>META %</th>
                <th>COMISSÃO</th>
                <th>VARIAÇÃO</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in sellersDetailed" :key="s.name">
                <td>
                  <span class="rank-num" :class="['gold','silver','bronze'][i]||''">{{ i+1 }}</span>
                </td>
                <td>
                  <div class="user-cell">
                    <div class="mini-av" :class="'sc-av-'+s.avColor">{{ s.initials }}</div>
                    <div>
                      <div class="cell-name">{{ s.name }}</div>
                      <div class="cell-sub">{{ s.level }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="mono-bold">R$ {{ s.sales }}</span></td>
                <td>{{ s.count }}</td>
                <td>R$ {{ s.ticket }}</td>
                <td>
                  <div class="inline-bar">
                    <div class="ib-fill" :style="{ width: Math.min(s.meta,100)+'%', background: s.meta >= 100 ? 'var(--green)' : 'var(--accent)' }"></div>
                    <span class="ib-val">{{ s.meta }}%</span>
                  </div>
                </td>
                <td><span class="mono-bold accent-text">R$ {{ s.commission }}</span></td>
                <td>
                  <span :class="s.var > 0 ? 'delta-up' : 'delta-down'">
                    {{ s.var > 0 ? '▲' : '▼' }} {{ Math.abs(s.var) }}%
                  </span>
                </td>
                <td>
                  <span class="tag-r" :class="s.meta >= 100 ? 'tag-green' : s.meta >= 80 ? 'tag-orange' : 'tag-red'">
                    {{ s.meta >= 100 ? 'Meta' : s.meta >= 80 ? 'Progresso' : 'Atenção' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="chart-section-grid">
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">bar_chart_4_bars</span></div>
              <div>
                <div class="card-title">Vendas por Vendedor</div>
                <div class="card-sub">Receita individual acumulada</div>
              </div>
            </div>
            <div class="chart-wrap h220">
              <canvas ref="sellerBarChart" id="sellerBarChart"></canvas>
            </div>
          </div>
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-green"><span class="material-symbols-outlined">donut_large</span></div>
              <div>
                <div class="card-title">Participação por Vendedor</div>
                <div class="card-sub">% sobre receita total</div>
              </div>
            </div>
            <div class="chart-wrap h220">
              <canvas ref="sellerPieChart" id="sellerPieChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════
           SEÇÃO 3 — GIRO DE PRODUTOS
      ═══════════════════════════════════ -->
      <div class="section-block" v-if="activeModules.includes('produtos')">
        <div class="section-header">
          <div class="section-icon c-green">
            <span class="material-symbols-outlined">autorenew</span>
          </div>
          <div>
            <div class="section-title">Giro e Performance de Produtos</div>
            <div class="card-sub">Análise de rotatividade, ranking e médias por produto</div>
          </div>
          <div style="margin-left:auto">
            <button class="btn-section-pdf" @click="exportSection('produtos')">
              <span class="material-symbols-outlined" style="font-size:14px">download</span>
              PDF desta seção
            </button>
          </div>
        </div>

        <div class="kpi-grid-4">
          <div v-for="k in productKpis" :key="k.label" class="kpi-report" :class="k.cls">
            <div class="kr-icon"><span class="material-symbols-outlined">{{ k.icon }}</span></div>
            <div class="kr-body">
              <div class="kr-label">{{ k.label }}</div>
              <div class="kr-value">{{ k.value }}</div>
              <div class="kr-footer">
                <span class="kr-sub">{{ k.sub }}</span>
              </div>
            </div>
            <span class="material-symbols-outlined kr-bg">{{ k.icon }}</span>
          </div>
        </div>

        <div class="chart-section-grid">
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-yellow"><span class="material-symbols-outlined">category</span></div>
              <div>
                <div class="card-title">Classes de Produtos</div>
                <div class="card-sub">Giro por categoria · estoque e receita</div>
              </div>
            </div>
            <div class="cat-detail-grid">
              <div class="chart-wrap h200">
                <canvas ref="categoryChart" id="categoryChart"></canvas>
              </div>
              <div class="cat-detail-list">
                <div v-for="cat in categories" :key="cat.name" class="cat-detail-row">
                  <div class="cdr-dot" :style="{ background: cat.color }"></div>
                  <div class="cdr-name">{{ cat.name }}</div>
                  <div class="cdr-bar-wrap">
                    <div class="cdr-bar" :style="{ width: cat.pct+'%', background: cat.color }"></div>
                  </div>
                  <div class="cdr-qty">{{ cat.qty }} un.</div>
                  <div class="cdr-val">R$ {{ cat.monthly }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">timer</span></div>
              <div>
                <div class="card-title">Tempo Médio no Estoque</div>
                <div class="card-sub">Entrada → saída por categoria</div>
              </div>
            </div>
            <div class="chart-wrap h200">
              <canvas ref="stockTimeChart" id="stockTimeChart"></canvas>
            </div>
            <div class="stock-summary">
              <div class="ss-item"><div class="ss-val accent">18,4d</div><div class="ss-lbl">Média Geral</div></div>
              <div class="ss-item"><div class="ss-val green">7,2d</div><div class="ss-lbl">Melhor Cat.</div></div>
              <div class="ss-item"><div class="ss-val red">42d</div><div class="ss-lbl">Pior Cat.</div></div>
              <div class="ss-item"><div class="ss-val blue">↑1,8d</div><div class="ss-lbl">vs mês ant.</div></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-icon c-orange"><span class="material-symbols-outlined">star</span></div>
            <div>
              <div class="card-title">Ranking Detalhado de Produtos</div>
              <div class="card-sub">Receita, volume, giro e médias de venda</div>
            </div>
            <div class="card-actions">
              <button v-for="f in ['Receita','Unid.','Giro','Margem']" :key="f" class="chip" :class="{ active: prodRankFilter === f }" @click="prodRankFilter = f">{{ f }}</button>
            </div>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th style="width:36px">#</th>
                <th>PRODUTO</th>
                <th>CATEGORIA</th>
                <th>UNID.</th>
                <th>RECEITA</th>
                <th>GIRO (dias)</th>
                <th>MÉD. DIÁRIA</th>
                <th>MÉD. SEMANAL</th>
                <th>MÉD. MENSAL</th>
                <th>PRAZO MÉD.</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in productsDetailed" :key="p.name">
                <td><span class="rank-num" :class="['gold','silver','bronze'][i]||''">{{ i+1 }}</span></td>
                <td><div class="cell-name">{{ p.name }}</div></td>
                <td><span class="tag-r tag-blue-soft">{{ p.category }}</span></td>
                <td class="mono-bold">{{ p.units }}</td>
                <td><span class="mono-bold">R$ {{ p.revenue }}</span></td>
                <td>
                  <div class="inline-bar">
                    <div class="ib-fill" :style="{ width: (p.giroPerc)+'%', background: p.giroPerc > 70 ? 'var(--green)' : p.giroPerc > 40 ? 'var(--accent)' : 'var(--red)' }"></div>
                    <span class="ib-val">{{ p.giroDays }}d</span>
                  </div>
                </td>
                <td>{{ p.daily }}</td>
                <td>{{ p.weekly }}</td>
                <td>{{ p.monthly }}</td>
                <td>
                  <span class="tag-r" :class="p.avgDays <= 14 ? 'tag-green' : p.avgDays <= 28 ? 'tag-orange' : 'tag-red'">
                    {{ p.avgDays }}d
                  </span>
                </td>
                <td><span class="tag-r" :class="p.tagClass">{{ p.statusLabel }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══════════════════════════════════
           SEÇÃO 4 — ESTOQUE
      ═══════════════════════════════════ -->
      <div class="section-block" v-if="activeModules.includes('estoque')">
        <div class="section-header">
          <div class="section-icon c-red">
            <span class="material-symbols-outlined">warehouse</span>
          </div>
          <div>
            <div class="section-title">Relatório de Estoque</div>
            <div class="section-sub">Situação atual, alertas, excesso e produtos parados</div>
          </div>
          <div style="margin-left:auto">
            <button class="btn-section-pdf" @click="exportSection('estoque')">
              <span class="material-symbols-outlined" style="font-size:14px">download</span>
              PDF desta seção
            </button>
          </div>
        </div>

        <div class="kpi-grid-4">
          <div v-for="k in stockKpis" :key="k.label" class="kpi-report" :class="k.cls">
            <div class="kr-icon"><span class="material-symbols-outlined">{{ k.icon }}</span></div>
            <div class="kr-body">
              <div class="kr-label">{{ k.label }}</div>
              <div class="kr-value">{{ k.value }}</div>
              <div class="kr-footer"><span class="kr-sub">{{ k.sub }}</span></div>
            </div>
            <span class="material-symbols-outlined kr-bg">{{ k.icon }}</span>
          </div>
        </div>

        <div class="grid-3">
          <!-- Alertas críticos -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-red"><span class="material-symbols-outlined">warning</span></div>
              <div>
                <div class="card-title">Alertas de Estoque</div>
                <div class="card-sub">Itens críticos · ação necessária</div>
              </div>
            </div>
            <div class="alert-boxes">
              <div class="abox red"><span class="abox-num">7</span><span class="abox-lbl">Baixo Est.</span></div>
              <div class="abox yellow"><span class="abox-num">3</span><span class="abox-lbl">Parados</span></div>
              <div class="abox blue"><span class="abox-num">5</span><span class="abox-lbl">Excesso</span></div>
              <div class="abox orange"><span class="abox-num">2</span><span class="abox-lbl">Ruptura</span></div>
            </div>
            <div class="alert-list">
              <div v-for="a in inventoryAlerts" :key="a.name" class="alert-item">
                <span class="material-symbols-outlined alert-icon" :style="{ color: a.color }">{{ a.googleIcon }}</span>
                <div class="alert-info">
                  <div class="alert-name">{{ a.name }}</div>
                  <div class="alert-desc">{{ a.desc }}</div>
                </div>
                <span class="tag-r" :style="{ background: a.color+'18', color: a.color, border: '1px solid '+a.color+'44' }">{{ a.tag }}</span>
              </div>
            </div>
          </div>

          <!-- Fornecedores -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">local_shipping</span></div>
              <div>
                <div class="card-title">Principais Fornecedores</div>
                <div class="card-sub">Entrada vs venda vinculada</div>
              </div>
            </div>
            <div class="supplier-list">
              <div v-for="s in suppliers" :key="s.name" class="supplier-row">
                <div class="sup-icon">{{ s.icon }}</div>
                <div class="sup-info">
                  <div class="sup-name">{{ s.name }}</div>
                  <div class="sup-cat">{{ s.cat }}</div>
                </div>
                <div class="sup-stats">
                  <div class="sup-value">R$ {{ s.value }}</div>
                  <div class="sup-detail">{{ s.items }} itens · {{ s.giro }}d giro</div>
                </div>
                <span class="tag-r" :class="s.status === 'Ativo' ? 'tag-green' : s.status === 'Regular' ? 'tag-orange' : 'tag-red'">{{ s.status }}</span>
              </div>
            </div>
          </div>

          <!-- Situação geral -->
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-green"><span class="material-symbols-outlined">inventory_2</span></div>
              <div>
                <div class="card-title">Situação Geral do Estoque</div>
                <div class="card-sub">Distribuição por status</div>
              </div>
            </div>
            <div class="chart-wrap h180">
              <canvas ref="stockStatusChart" id="stockStatusChart"></canvas>
            </div>
            <div class="stock-status-legend">
              <div v-for="st in stockStatus" :key="st.label" class="ssl-item">
                <div class="ssl-dot" :style="{ background: st.color }"></div>
                <div class="ssl-label">{{ st.label }}</div>
                <div class="ssl-val" :style="{ color: st.color }">{{ st.qty }} itens</div>
                <div class="ssl-pct">{{ st.pct }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabela completa de estoque -->
        <div class="card">
          <div class="card-head">
            <div class="card-icon c-yellow"><span class="material-symbols-outlined">table_rows</span></div>
            <div>
              <div class="card-title">Inventário Completo</div>
              <div class="card-sub">Todos os produtos · estoque mínimo, máximo e atual</div>
            </div>
            <div class="card-actions">
              <button v-for="t in stockTabs" :key="t.key" class="chip" :class="{ active: activeStockTab === t.key }" @click="activeStockTab = t.key">
                {{ t.label }}
                <span class="chip-badge" :class="t.color">{{ t.count }}</span>
              </button>
            </div>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>PRODUTO</th>
                <th>CATEGORIA</th>
                <th>ESTOQUE ATUAL</th>
                <th>MÍN.</th>
                <th>MÁX.</th>
                <th>DETALHE</th>
                <th>DIAS PARADO</th>
                <th>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in fullStockList" :key="s.name">
                <td><div class="cell-name">{{ s.name }}</div></td>
                <td><span class="tag-r tag-blue-soft">{{ s.category }}</span></td>
                <td><span class="mono-bold" :style="{ color: stockTabColor }">{{ s.stock }} un.</span></td>
                <td><span style="color:var(--muted)">{{ s.min }}</span></td>
                <td><span style="color:var(--muted)">{{ s.max }}</span></td>
                <td><span style="font-size:12px;color:var(--text2)">{{ s.detail }}</span></td>
                <td>
                  <span v-if="s.days" :style="{ color: s.days > 45 ? 'var(--red)' : 'var(--yellow)' }">{{ s.days }}d</span>
                  <span v-else style="color:var(--muted)">—</span>
                </td>
                <td>
                  <span class="tag-r" :style="{ background: stockTabColor+'18', color: stockTabColor, border: '1px solid '+stockTabColor+'44' }">{{ s.tag }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══════════════════════════════════
           SEÇÃO 5 — ANÁLISE POR LOCAL
      ═══════════════════════════════════ -->
      <div class="section-block" v-if="activeModules.includes('locais')">
        <div class="section-header">
          <div class="section-icon c-yellow">
            <span class="material-symbols-outlined">location_on</span>
          </div>
          <div>
            <div class="section-title">Análise por Local de Venda</div>
            <div class="section-sub">Desempenho comparativo entre unidades e canais</div>
          </div>
          <div style="margin-left:auto">
            <button class="btn-section-pdf">
              <span class="material-symbols-outlined" style="font-size:14px">download</span>
              PDF desta seção
            </button>
          </div>
        </div>

        <div class="location-cards">
          <div v-for="loc in locations" :key="loc.name" class="loc-card">
            <div class="lc-header">
              <div class="lc-icon">
                <span class="material-symbols-outlined">{{ loc.icon }}</span>
              </div>
              <div>
                <div class="lc-name">{{ loc.name }}</div>
                <div class="lc-addr">{{ loc.address }}</div>
              </div>
              <div class="lc-trend" :class="loc.trend >= 0 ? 'trend-up' : 'trend-down'">
                {{ loc.trend >= 0 ? '▲' : '▼' }} {{ Math.abs(loc.trend) }}%
              </div>
            </div>
            <div class="lc-sales">R$ {{ loc.sales }}</div>
            <div class="lc-sales-lbl">Receita no período</div>
            <div class="lc-bar-wrap">
              <div class="lc-bar" :style="{ width: (parseInt(loc.sales.replace('.','')) / 1300000 * 100)+'%' }"></div>
            </div>
            <div class="lc-footer">
              <div>
                <div class="lc-stat-val">R$ {{ loc.ticket }}</div>
                <div class="lc-stat-lbl">Ticket Méd.</div>
              </div>
              <div>
                <div class="lc-stat-val">{{ loc.leader }}</div>
                <div class="lc-stat-lbl">Prod. líder</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-icon c-orange"><span class="material-symbols-outlined">compare</span></div>
            <div>
              <div class="card-title">Comparativo de Locais</div>
              <div class="card-sub">Receita, ticket médio e crescimento</div>
            </div>
          </div>
          <div class="chart-wrap h220">
            <canvas ref="locationChart" id="locationChart"></canvas>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════
           SEÇÃO 6 — VENDAS POR HORÁRIO
      ═══════════════════════════════════ -->
      <div class="section-block" v-if="activeModules.includes('horarios')">
        <div class="section-header">
          <div class="section-icon c-blue">
            <span class="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <div class="section-title">Análise de Horários e Picos</div>
            <div class="section-sub">Distribuição de vendas por hora e dia da semana</div>
          </div>
          <div style="margin-left:auto">
            <button class="btn-section-pdf">
              <span class="material-symbols-outlined" style="font-size:14px">download</span>
              PDF desta seção
            </button>
          </div>
        </div>

        <div class="chart-section-grid">
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue"><span class="material-symbols-outlined">bar_chart</span></div>
              <div>
                <div class="card-title">Vendas por Horário</div>
                <div class="card-sub">Volume total por faixa horária</div>
              </div>
            </div>
            <div class="chart-wrap h240">
              <canvas ref="hourlyChart" id="hourlyChart"></canvas>
            </div>
          </div>
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange"><span class="material-symbols-outlined">grid_view</span></div>
              <div>
                <div class="card-title">Mapa de Calor</div>
                <div class="card-sub">Intensidade por hora e dia da semana</div>
              </div>
            </div>
            <div class="heatmap-wrap">
              <div class="heatmap-grid">
                <div></div>
                <div v-for="d in weekDays" :key="d" class="hm-day">{{ d }}</div>
                <template v-for="row in heatmapData" :key="row.hour">
                  <div class="hm-hour">{{ row.hour }}</div>
                  <div v-for="(val, di) in row.vals" :key="di" class="hm-cell" :class="'h'+val" :title="weekDays[di]+' '+row.hour+' · intensidade '+val"></div>
                </template>
              </div>
              <div class="hm-legend">
                <span class="hm-leg-lbl">Baixo</span>
                <div class="hm-cell h1" style="width:16px;height:12px;border-radius:3px"></div>
                <div class="hm-cell h2" style="width:16px;height:12px;border-radius:3px"></div>
                <div class="hm-cell h3" style="width:16px;height:12px;border-radius:3px"></div>
                <div class="hm-cell h4" style="width:16px;height:12px;border-radius:3px"></div>
                <div class="hm-cell h5" style="width:16px;height:12px;border-radius:3px"></div>
                <span class="hm-leg-lbl">Alto</span>
              </div>
            </div>
            <div class="peak-section">
              <div v-for="pico in peakProducts" :key="pico.hour" class="peak-block">
                <div class="peak-header">
                  <span class="peak-hour">{{ pico.hour }}</span>
                  <span class="peak-label">{{ pico.label }}</span>
                  <span class="peak-total">R$ {{ pico.total }}</span>
                </div>
                <div v-for="p in pico.products" :key="p.name" class="peak-row">
                  <span class="peak-pname">{{ p.name }}</span>
                  <div style="flex:1;background:var(--bg-el);border-radius:4px;height:6px;overflow:hidden">
                    <div :style="{ width: p.pct+'%', background: 'var(--accent)', height:'100%', borderRadius:'4px' }"></div>
                  </div>
                  <span class="peak-pct">{{ p.pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══ FOOTER ══ -->
    <div class="reports-footer">
      <span>Market Vizium ERP Varejo · Loja Central · Relatório gerado em {{ new Date().toLocaleDateString('pt-BR') }} às {{ new Date().toLocaleTimeString('pt-BR') }}</span>
      <span>©2026 Todos os dados reservados · Última sincronização: {{ new Date().toLocaleTimeString('pt-BR') }}</span>
    </div>

  </div>
</template>

<script>
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  Filler
} from 'chart.js';

// Registra os elementos usados nos seus gráficos
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const ACCENT = '#FF8049';
const GREEN  = '#16a34a';
const BLUE   = '#2563eb';
const YELLOW = '#ca8a04';
const RED    = '#dc2626';
const PURPLE = '#7c3aed';
const GRID   = 'rgba(0,0,0,0.04)';
const TEXT   = '#64748b';

const baseTooltip = {
  backgroundColor: '#1e293b',
  borderColor: 'rgba(0,0,0,0.08)',
  borderWidth: 1,
  titleColor: '#f0f0f4',
  bodyColor: '#94a3b8',
  padding: 10,
};

export default {
  name: 'RelatoriosMain',

  data() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      activePeriod: 'mes',
      dateFrom: firstDay.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
      selectedLocation: 'all',
      selectedSeller: 'all',
      evoFilter: 'Ambas',
      sellerRankFilter: 'Valor',
      prodRankFilter: 'Receita',
      activeStockTab: 'baixo',
      activeModules: ['vendas','vendedores','produtos','estoque','locais','horarios'],

      periodPresets: [
        { key: 'hoje',   label: 'Hoje'    },
        { key: 'semana', label: 'Semana'  },
        { key: 'mes',    label: 'Mês'     },
        { key: 'tri',    label: 'Trimestre'},
        { key: 'ano',    label: 'Ano'     },
        { key: 'custom', label: 'Período' },
      ],

      modules: [
        { key: 'vendas',     label: 'Vendas',      icon: 'monitoring'   },
        { key: 'vendedores', label: 'Vendedores',  icon: 'group'        },
        { key: 'produtos',   label: 'Produtos',    icon: 'inventory'    },
        { key: 'estoque',    label: 'Estoque',     icon: 'warehouse'    },
        { key: 'locais',     label: 'Locais',      icon: 'location_on'  },
        { key: 'horarios',   label: 'Horários',    icon: 'schedule'     },
      ],

      execKpis: [
        { label: 'VENDA BRUTA',      value: '128.430', prefix: 'R$ ', delta: '+11,4%', up: true,  icon: 'payments',       cls: 'k-orange' },
        { label: 'VENDA LÍQUIDA',    value: '113.730', prefix: 'R$ ', delta: '+10,9%', up: true,  icon: 'account_balance',cls: 'k-green'  },
        { label: 'TICKETS VENDIDOS', value: '1.842',   prefix: '',    delta: '+9,7%',  up: true,  icon: 'receipt_long',   cls: 'k-blue'   },
        { label: 'TICKET MÉDIO',     value: 'R$ 69,72',prefix: '',    delta: '+1,6%',  up: true,  icon: 'sell',           cls: 'k-yellow' },
      ],

      miniMetrics: [
        { label: 'MÉDIA DIÁRIA',         value: 'R$ 4.143',   trend: '8,2%',  up: true,  sub: 'vs ontem'       },
        { label: 'MÉDIA SEMANAL',        value: 'R$ 29.024',  trend: '5,1%',  up: true,  sub: 'vs sem. ant.'   },
        { label: 'MÉDIA MENSAL',         value: 'R$ 98.420',  trend: '11,4%', up: true,  sub: 'vs mês ant.'    },
        { label: 'PRAZO MÉDIO VENDA',    value: '18,4 dias',  trend: '2,1d',  up: false, sub: 'no estoque'     },
        { label: 'PRODUTOS ATIVOS',      value: '1.248',      trend: null,    up: true,  sub: 'no portfólio'   },
        { label: 'PRODUTOS NO COMÉRCIO', value: '130',        trend: null,    up: true,  sub: 'estoque + loja' },
      ],

      dreSummary: [
        { label: 'Receita Bruta',    value: 'R$ 128.430', pct: '100,0%', color: ACCENT,  highlight: false },
        { label: '(-) Descontos',    value: '- R$ 11.280',pct: '-8,8%',  color: RED,     highlight: false, indent: true },
        { label: '(-) Devoluções',   value: '- R$ 3.420', pct: '-2,7%',  color: RED,     highlight: false, indent: true },
        { label: 'Receita Líquida',  value: 'R$ 113.730', pct: '88,5%',  color: GREEN,   highlight: true  },
        { label: '(-) CMV',          value: '- R$ 74.180',pct: '-57,8%', color: RED,     highlight: false, indent: true },
        { label: 'Lucro Bruto',      value: 'R$ 39.550',  pct: '30,8%',  color: GREEN,   highlight: true  },
        { label: 'Margem Bruta',     value: '34,7%',      pct: '',       color: GREEN,   highlight: false  },
        { label: 'Prazo Médio Venda',value: '18,4 dias',  pct: '',       color: BLUE,    highlight: false  },
      ],

      sellerSummary: [
        { name: 'Ana Paula Silva', initials: 'AP', avColor: '1', level: 'Sênior', sales: '24.870', meta: 108, ticket: '127,50', count: 195, commission: '1.243' },
        { name: 'Carlos Mendes',   initials: 'CM', avColor: '2', level: 'Pleno',  sales: '19.320', meta: 94,  ticket: '98,20',  count: 197, commission: '966'   },
        { name: 'Fernanda Costa',  initials: 'FC', avColor: '3', level: 'Sênior', sales: '17.640', meta: 88,  ticket: '104,00', count: 170, commission: '882'   },
        { name: 'Rafael Souza',    initials: 'RS', avColor: '4', level: 'Júnior', sales: '14.210', meta: 82,  ticket: '87,40',  count: 163, commission: '568'   },
        { name: 'Mariana Lopes',   initials: 'ML', avColor: '5', level: 'Pleno',  sales: '12.890', meta: 76,  ticket: '93,10',  count: 138, commission: '516'   },
        { name: 'Diego Ferreira',  initials: 'DF', avColor: '6', level: 'Júnior', sales: '9.480',  meta: 61,  ticket: '72,80',  count: 130, commission: '379'   },
      ],

      sellersDetailed: [
        { name: 'Ana Paula Silva', initials: 'AP', avColor: '1', level: 'Sênior', sales: '24.870', meta: 108, ticket: '127,50', count: 195, commission: '1.243', var: 14.2 },
        { name: 'Carlos Mendes',   initials: 'CM', avColor: '2', level: 'Pleno',  sales: '19.320', meta: 94,  ticket: '98,20',  count: 197, commission: '966',   var: 8.7  },
        { name: 'Fernanda Costa',  initials: 'FC', avColor: '3', level: 'Sênior', sales: '17.640', meta: 88,  ticket: '104,00', count: 170, commission: '882',   var: 5.3  },
        { name: 'Rafael Souza',    initials: 'RS', avColor: '4', level: 'Júnior', sales: '14.210', meta: 82,  ticket: '87,40',  count: 163, commission: '568',   var: -2.1 },
        { name: 'Mariana Lopes',   initials: 'ML', avColor: '5', level: 'Pleno',  sales: '12.890', meta: 76,  ticket: '93,10',  count: 138, commission: '516',   var: -5.4 },
        { name: 'Diego Ferreira',  initials: 'DF', avColor: '6', level: 'Júnior', sales: '9.480',  meta: 61,  ticket: '72,80',  count: 130, commission: '379',   var: -9.8 },
      ],

      productKpis: [
        { label: 'TOTAL DE PRODUTOS',   value: '1.248',    icon: 'inventory',     cls: 'k-blue',   sub: 'portfólio ativo'      },
        { label: 'GIRO MÉDIO',          value: '18,4 dias',icon: 'autorenew',     cls: 'k-green',  sub: 'entrada → saída'      },
        { label: 'PRODUTO MAIS VENDIDO',value: 'Cond. Prof. 1L', icon: 'star',   cls: 'k-orange', sub: '482 un. no período'   },
        { label: 'CATEGORIAS ATIVAS',   value: '5',        icon: 'category',      cls: 'k-yellow', sub: 'com vendas no período'},
      ],

      categories: [
        { name: 'Cabelos',     qty: 412, pct: 85, monthly: '18.240', color: ACCENT  },
        { name: 'Coloração',   qty: 187, pct: 65, monthly: '10.890', color: BLUE    },
        { name: 'Pele & Corpo',qty: 143, pct: 48, monthly: '7.620',  color: GREEN   },
        { name: 'Acessórios',  qty:  98, pct: 42, monthly: '5.480',  color: YELLOW  },
        { name: 'Perfumaria',  qty:  76, pct: 30, monthly: '3.340',  color: PURPLE  },
      ],

      productsDetailed: [
        { name: 'Condicionador Profissional 1L', category: 'Cabelos',    units: 482, revenue: '14.460', giroPerc: 90, giroDays: 7,  daily: '16,1', weekly: '112',  monthly: '482',  avgDays: 7,  statusLabel: 'Hot',   tagClass: 'tag-green'  },
        { name: 'Shampoo Hidratante 500ml',      category: 'Cabelos',    units: 398, revenue: '9.950',  giroPerc: 80, giroDays: 10, daily: '13,3', weekly: '93',   monthly: '398',  avgDays: 10, statusLabel: 'Alto',  tagClass: 'tag-green'  },
        { name: 'Creme de Tratamento 300g',      category: 'Cabelos',    units: 341, revenue: '12.276', giroPerc: 72, giroDays: 12, daily: '11,4', weekly: '80',   monthly: '341',  avgDays: 12, statusLabel: 'Alto',  tagClass: 'tag-green'  },
        { name: 'Escova Titanium Pro',           category: 'Acessórios', units: 187, revenue: '18.700', giroPerc: 55, giroDays: 18, daily: '6,2',  weekly: '43',   monthly: '187',  avgDays: 18, statusLabel: 'Médio', tagClass: 'tag-orange' },
        { name: 'Óleo Capilar Argan 60ml',       category: 'Cabelos',    units: 312, revenue: '8.424',  giroPerc: 68, giroDays: 14, daily: '10,4', weekly: '73',   monthly: '312',  avgDays: 14, statusLabel: 'Médio', tagClass: 'tag-orange' },
        { name: 'Kit Coloração Profissional',    category: 'Coloração',  units: 203, revenue: '15.225', giroPerc: 43, giroDays: 22, daily: '6,8',  weekly: '48',   monthly: '203',  avgDays: 22, statusLabel: 'Médio', tagClass: 'tag-orange' },
        { name: 'Perfume Floral 100ml',          category: 'Perfumaria', units: 38,  revenue: '4.560',  giroPerc: 18, giroDays: 42, daily: '1,4',  weekly: '9',    monthly: '38',   avgDays: 42, statusLabel: 'Baixo', tagClass: 'tag-red'    },
      ],

      stockKpis: [
        { label: 'ESTOQUE TOTAL',      value: '3.847 un.',  icon: 'inventory_2',    cls: 'k-blue',   sub: 'valor: R$ 284.300'  },
        { label: 'PRODUTOS EM RUPTURA',value: '2',          icon: 'remove_shopping_cart', cls: 'k-red', sub: 'sem estoque'     },
        { label: 'PRODUTOS PARADOS',   value: '3',          icon: 'pause_circle',   cls: 'k-yellow', sub: 'acima de 45 dias'   },
        { label: 'GIRO MÉDIO GERAL',   value: '18,4 dias',  icon: 'sync',           cls: 'k-green',  sub: 'entrada → saída'   },
      ],

      inventoryAlerts: [
        { name: 'Máscara Capilar Wella 500g', desc: 'Restam 4 un. · reposição urgente', tag: 'Crítico', color: RED,    googleIcon: 'error'         },
        { name: 'Escova Elétrica Gamma X1',   desc: 'Parado há 67 dias · sem saída',    tag: 'Parado',  color: '#ca8a04', googleIcon: 'pause_circle' },
        { name: 'Kit Selagem 1L',             desc: '182 unidades · acima do limite',   tag: 'Excesso', color: BLUE,   googleIcon: 'arrow_upward'  },
        { name: 'Óleo de Coco Puro 200ml',    desc: 'Restam 6 un. · repor urgente',     tag: 'Baixo',   color: RED,    googleIcon: 'warning'       },
        { name: 'Spray Finalizador 300ml',    desc: 'Parado há 54 dias',                tag: 'Parado',  color: '#ca8a04', googleIcon: 'history'    },
      ],

      suppliers: [
        { name: "L'Oréal Brasil",      cat: 'Cabelos · Coloração',     icon: '🏭', value: '38.240', items: 124, giro: 14, status: 'Ativo'   },
        { name: 'Wella Professionals', cat: 'Coloração · Tratamento',  icon: '🧴', value: '24.180', items: 87,  giro: 18, status: 'Ativo'   },
        { name: 'Truss Professional',  cat: 'Cabelos Profissional',    icon: '💊', value: '16.920', items: 62,  giro: 21, status: 'Regular' },
        { name: 'OX Cosméticos',       cat: 'Massa · Popular',         icon: '🪴', value: '11.340', items: 48,  giro: 9,  status: 'Ativo'   },
        { name: 'Nazca Cosméticos',    cat: 'Coloração',               icon: '🎨', value: '7.840',  items: 31,  giro: 28, status: 'Lento'   },
      ],

      stockStatus: [
        { label: 'Normal',        qty: 1087, pct: 87, color: GREEN  },
        { label: 'Baixo Estoque', qty: 7,    pct: 6,  color: RED    },
        { label: 'Excesso',       qty: 5,    pct: 4,  color: BLUE   },
        { label: 'Parado',        qty: 3,    pct: 2,  color: '#ca8a04' },
        { label: 'Ruptura',       qty: 2,    pct: 1,  color: '#7c3aed' },
      ],

      stockTabs: [
        { key: 'baixo',   label: 'Baixo Est.', count: 7, color: 'badge-red'    },
        { key: 'parados', label: 'Parados',    count: 3, color: 'badge-yellow' },
        { key: 'excesso', label: 'Excesso',    count: 5, color: 'badge-blue'   },
      ],

      stockLists: {
        baixo: [
          { name: 'Máscara Capilar Wella 500g',  category: 'Cabelos', stock: 4,  min: '20', max: '60', detail: '↓ 80% abaixo min', days: null, tag: 'Repor Já'  },
          { name: 'Óleo de Coco Puro 200ml',     category: 'Cabelos', stock: 6,  min: '15', max: '40', detail: '↓ 60% abaixo min', days: null, tag: 'Repor Já'  },
          { name: 'Shampoo Antiqueda 400ml',     category: 'Cabelos', stock: 9,  min: '25', max: '60', detail: '↓ 64% abaixo min', days: null, tag: 'Crítico'   },
          { name: 'Condicionador Liso 300ml',    category: 'Cabelos', stock: 11, min: '20', max: '50', detail: '↓ 45% abaixo min', days: null, tag: 'Baixo'     },
          { name: 'Tônico Capilar 150ml',        category: 'Cabelos', stock: 3,  min: '10', max: '30', detail: '↓ 70% abaixo min', days: null, tag: 'Crítico'   },
        ],
        parados: [
          { name: 'Escova Elétrica Gamma X1',   category: 'Acessórios', stock: 14, min: '—', max: '—', detail: 'Sem saídas',   days: 67, tag: 'Ação Urgente' },
          { name: 'Perfume Floral 100ml',        category: 'Perfumaria', stock: 22, min: '—', max: '—', detail: 'Sem saídas',   days: 54, tag: 'Promover'     },
          { name: 'Spray Fixador Extra Forte',   category: 'Cabelos',    stock: 8,  min: '—', max: '—', detail: 'Sem saídas',   days: 48, tag: 'Revisar'      },
        ],
        excesso: [
          { name: 'Kit Selagem 1L',              category: 'Tratamento', stock: 182, min: '20', max: '80',  detail: '↑ 127% acima max', days: null, tag: 'Excesso' },
          { name: 'Relaxamento Kit Pro',         category: 'Química',    stock: 94,  min: '10', max: '40',  detail: '↑ 135% acima max', days: null, tag: 'Excesso' },
          { name: 'Botox Capilar 250g',          category: 'Tratamento', stock: 71,  min: '8',  max: '30',  detail: '↑ 137% acima max', days: null, tag: 'Excesso' },
          { name: 'Máscara Hidratação 1kg',      category: 'Cabelos',    stock: 65,  min: '10', max: '35',  detail: '↑ 86% acima max',  days: null, tag: 'Excesso' },
          { name: 'Shampoo Low Poo 500ml',       category: 'Cabelos',    stock: 58,  min: '8',  max: '30',  detail: '↑ 93% acima max',  days: null, tag: 'Excesso' },
        ],
      },

      locations: [
        { name: 'Loja Central',        address: 'Av. Paulista, 1000',  sales: '128.430', leader: 'Cond. Prof. 1L', ticket: '69,72', trend: 11.4, icon: 'storefront'  },
        { name: 'Filial Norte',        address: 'Av. Brasil, 342',     sales: '89.210',  leader: 'Shampoo Hidr.',  ticket: '61,30', trend: 8.2,  icon: 'store'       },
        { name: 'Filial Sul',          address: 'R. das Flores, 88',   sales: '64.870',  leader: 'Creme Trat.',    ticket: '74,10', trend: -2.1, icon: 'store'       },
        { name: 'Quiosque Shopping A', address: 'Shopping Morumbi',    sales: '34.120',  leader: 'Óleo Argan',     ticket: '55,40', trend: 4.7,  icon: 'shopping_bag'},
        { name: 'E-commerce',          address: 'Loja Virtual',        sales: '28.940',  leader: 'Kit Coloração',  ticket: '82,30', trend: 31.2, icon: 'public'      },
      ],

      weekDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      heatmapData: [
        { hour: '08h', vals: [0,1,0,1,1,2,0] },
        { hour: '09h', vals: [1,2,1,2,2,3,0] },
        { hour: '10h', vals: [2,3,2,3,3,4,1] },
        { hour: '11h', vals: [3,4,3,4,5,5,2] },
        { hour: '12h', vals: [4,5,4,5,5,5,2] },
        { hour: '13h', vals: [3,4,3,4,4,4,1] },
        { hour: '14h', vals: [2,3,2,3,3,3,1] },
        { hour: '15h', vals: [2,2,2,3,3,3,1] },
        { hour: '16h', vals: [3,3,3,4,4,4,2] },
        { hour: '17h', vals: [4,5,4,5,5,5,3] },
        { hour: '18h', vals: [5,5,5,5,5,5,3] },
        { hour: '19h', vals: [3,4,3,4,4,4,2] },
        { hour: '20h', vals: [1,2,1,2,3,3,1] },
      ],
      peakProducts: [
        {
          hour: '11h - 13h', label: 'Pico manhã', total: '12.840',
          products: [
            { name: 'Condicionador Profissional 1L', pct: 34 },
            { name: 'Shampoo Hidratante 500ml',      pct: 22 },
            { name: 'Creme de Tratamento 300g',      pct: 17 },
          ]
        },
        {
          hour: '17h - 19h', label: 'Pico tarde', total: '18.230',
          products: [
            { name: 'Escova Titanium Pro',        pct: 28 },
            { name: 'Kit Coloração Profissional', pct: 24 },
            { name: 'Óleo Capilar Argan 60ml',    pct: 19 },
          ]
        },
      ],

      _charts: {},
    };
  },

  computed: {
    periodLabel() {
      const labels = { hoje: 'Hoje', semana: 'Esta semana', mes: 'Este mês', tri: 'Este trimestre', ano: 'Este ano', custom: `${this.dateFrom} a ${this.dateTo}` };
      return labels[this.activePeriod] || 'Período personalizado';
    },
    locationLabel() {
      const labels = { all: 'Todas as lojas', central: 'Loja Central', norte: 'Filial Norte', sul: 'Filial Sul', shopping: 'Quiosque Shopping A', ecom: 'E-commerce' };
      return labels[this.selectedLocation];
    },
    fullStockList() {
      return this.stockLists[this.activeStockTab];
    },
    stockTabColor() {
      return { baixo: RED, parados: '#ca8a04', excesso: BLUE }[this.activeStockTab];
    },
  },

  mounted() {
    this.$nextTick(() => this.initCharts());
  },

  beforeUnmount() {
    Object.values(this._charts).forEach(c => c && c.destroy());
  },

  methods: {
    setPreset(key) {
      this.activePeriod = key;
      const today = new Date();
      if (key === 'hoje')   { this.dateFrom = this.dateTo = today.toISOString().split('T')[0]; }
      if (key === 'semana') { const d = new Date(today); d.setDate(d.getDate()-7); this.dateFrom = d.toISOString().split('T')[0]; this.dateTo = today.toISOString().split('T')[0]; }
      if (key === 'mes')    { this.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]; this.dateTo = today.toISOString().split('T')[0]; }
      if (key === 'tri')    { const d = new Date(today); d.setMonth(d.getMonth()-3); this.dateFrom = d.toISOString().split('T')[0]; this.dateTo = today.toISOString().split('T')[0]; }
      if (key === 'ano')    { this.dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]; this.dateTo = today.toISOString().split('T')[0]; }
    },
    applyCustomRange() { this.activePeriod = 'custom'; },
    toggleModule(key) {
      const idx = this.activeModules.indexOf(key);
      if (idx > -1) this.activeModules.splice(idx, 1);
      else this.activeModules.push(key);
    },
    exportToPDF() { window.print(); },
    exportSection(sec) { alert(`Exportar PDF da seção: ${sec}. Integre com html2pdf.js ou jsPDF.`); },

    initCharts() {
      const evoCtx = document.getElementById('evoChart');
      if (evoCtx && !this._charts.evo) {
        this._charts.evo = new ChartJS(evoCtx, {
          type: 'line',
          data: {
            labels: ['01','03','05','07','09','11','13','15','17','19','21','23','25','27','29','31'],
            datasets: [
              { label: 'Venda Bruta',   data: [3200,4100,3800,5200,4800,6100,5400,7200,6800,8100,7400,9200,8600,10100,9800,11200], borderColor: ACCENT, backgroundColor: ACCENT+'22', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
              { label: 'Venda Líquida', data: [2800,3600,3400,4600,4200,5400,4800,6400,6000,7200,6600,8200,7600,8900,8700,9900],  borderColor: GREEN,  backgroundColor: GREEN+'18',  fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: TEXT, font: { size: 11 } } }, tooltip: baseTooltip }, scales: { x: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 11 } } }, y: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 11 }, callback: v => 'R$'+(v/1000).toFixed(0)+'k' } } } },
        });
      }

      const mCtx = document.getElementById('monthlyChart');
      if (mCtx && !this._charts.monthly) {
        this._charts.monthly = new ChartJS(mCtx, {
          type: 'bar',
          data: {
            labels: ['Out','Nov','Dez','Jan','Fev','Mar'],
            datasets: [
              { label: 'Bruta',   data: [92000,104000,118000,109000,115000,128430], backgroundColor: ACCENT+'88', borderRadius: 4 },
              { label: 'Líquida', data: [81000,91000,104000,96000,101000,113730],   backgroundColor: GREEN+'88',  borderRadius: 4 },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: TEXT, font: { size: 11 } } }, tooltip: baseTooltip }, scales: { x: { grid: { display: false }, ticks: { color: TEXT } }, y: { grid: { color: GRID }, ticks: { color: TEXT, callback: v => 'R$'+(v/1000).toFixed(0)+'k' } } } },
        });
      }

      const sbCtx = document.getElementById('sellerBarChart');
      if (sbCtx && !this._charts.sellerBar) {
        this._charts.sellerBar = new ChartJS(sbCtx, {
          type: 'bar',
          data: {
            labels: ['Ana Paula','Carlos','Fernanda','Rafael','Mariana','Diego'],
            datasets: [{ label: 'Vendas', data: [24870,19320,17640,14210,12890,9480], backgroundColor: [ACCENT,BLUE,GREEN,YELLOW,PURPLE,RED].map(c => c+'cc'), borderRadius: 4 }],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: baseTooltip }, scales: { x: { grid: { display: false }, ticks: { color: TEXT } }, y: { grid: { color: GRID }, ticks: { color: TEXT, callback: v => 'R$'+(v/1000).toFixed(0)+'k' } } } },
        });
      }

      const spCtx = document.getElementById('sellerPieChart');
      if (spCtx && !this._charts.sellerPie) {
        this._charts.sellerPie = new ChartJS(spCtx, {
          type: 'doughnut',
          data: {
            labels: ['Ana Paula','Carlos','Fernanda','Rafael','Mariana','Diego'],
            datasets: [{ data: [24870,19320,17640,14210,12890,9480], backgroundColor: [ACCENT,BLUE,GREEN,YELLOW,PURPLE,RED], borderWidth: 0, hoverOffset: 4 }],
          },
          options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: true, position: 'bottom', labels: { color: TEXT, font: { size: 11 } } }, tooltip: baseTooltip } },
        });
      }

      const catCtx = document.getElementById('categoryChart');
      if (catCtx && !this._charts.category) {
        this._charts.category = new ChartJS(catCtx, {
          type: 'doughnut',
          data: {
            labels: ['Cabelos','Coloração','Pele & Corpo','Acessórios','Perfumaria'],
            datasets: [{ data: [412,187,143,98,76], backgroundColor: [ACCENT,BLUE,GREEN,YELLOW,PURPLE], borderWidth: 0, hoverOffset: 4 }],
          },
          options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false }, tooltip: baseTooltip } },
        });
      }

      const stCtx = document.getElementById('stockTimeChart');
      if (stCtx && !this._charts.stockTime) {
        this._charts.stockTime = new ChartJS(stCtx, {
          type: 'bar',
          data: {
            labels: ['Perfumaria','Coloração','Pele & Corpo','Acessórios','Cabelos'],
            datasets: [{ label: 'Dias no estoque', data: [42,28,22,18,7], backgroundColor: [RED+'aa', YELLOW+'aa', '#f97316aa', BLUE+'aa', GREEN+'aa'], borderRadius: 4 }],
          },
          options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...baseTooltip, callbacks: { label: ctx => ` ${ctx.parsed.x} dias` } } }, scales: { x: { grid: { color: GRID }, ticks: { color: TEXT, callback: v => v+'d' } }, y: { grid: { display: false }, ticks: { color: TEXT } } } },
        });
      }

      const ssCtx = document.getElementById('stockStatusChart');
      if (ssCtx && !this._charts.stockStatus) {
        this._charts.stockStatus = new ChartJS(ssCtx, {
          type: 'doughnut',
          data: {
            labels: ['Normal','Baixo Est.','Excesso','Parado','Ruptura'],
            datasets: [{ data: [1087,7,5,3,2], backgroundColor: [GREEN,RED,BLUE,'#ca8a04',PURPLE], borderWidth: 0, hoverOffset: 4 }],
          },
          options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false }, tooltip: baseTooltip } },
        });
      }

      const locCtx = document.getElementById('locationChart');
      if (locCtx && !this._charts.location) {
        this._charts.location = new ChartJS(locCtx, {
          type: 'bar',
          data: {
            labels: ['Loja Central','Filial Norte','Filial Sul','Quiosque A','E-commerce'],
            datasets: [
              { label: 'Receita', data: [128430,89210,64870,34120,28940], backgroundColor: ACCENT+'bb', borderRadius: 4, yAxisID: 'y' },
              { label: 'Ticket Méd.', data: [6972,6130,7410,5540,8230], backgroundColor: BLUE+'88', borderRadius: 4, yAxisID: 'y1' },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: TEXT, font: { size: 11 } } }, tooltip: baseTooltip }, scales: { x: { grid: { display: false }, ticks: { color: TEXT } }, y: { grid: { color: GRID }, ticks: { color: TEXT, callback: v => 'R$'+(v/1000).toFixed(0)+'k' } }, y1: { position: 'right', grid: { display: false }, ticks: { color: BLUE, callback: v => 'R$'+(v/100).toFixed(0) } } } },
        });
      }

      const hCtx = document.getElementById('hourlyChart');
      if (hCtx && !this._charts.hourly) {
        this._charts.hourly = new ChartJS(hCtx, {
          type: 'bar',
          data: {
            labels: ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h'],
            datasets: [{ label: 'Vendas', data: [1200,2100,3400,4800,5200,4100,2900,2800,3600,5800,6200,4200,1800], backgroundColor: (ctx) => { const v = ctx.parsed?.y ?? 0; return v >= 5000 ? ACCENT : v >= 3500 ? ACCENT+'80' : ACCENT+'30'; }, borderRadius: 4 }],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: baseTooltip }, scales: { x: { grid: { display: false }, ticks: { color: TEXT } }, y: { grid: { color: GRID }, ticks: { color: TEXT, callback: v => 'R$'+(v/1000).toFixed(1)+'k' } } } },
        });
      }
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════
   TOKENS - Igual ao DashMain
══════════════════════════════════════ */
.reports-root {
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
  --bg:       #f8f9fa;
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
  --shadow:   0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  --shadow-md:0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.03);

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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
}
.rh-left { display: flex; align-items: center; gap: 16px; }
.rh-brand { display: flex; align-items: center; gap: 12px; }
.rh-brand-icon {
  width: 40px; height: 40px;
  background: var(--accent);
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
  cursor: pointer; border: none;
  transition: all 0.15s; font-family: inherit;
}
.btn-pdf { background: var(--accent); color: white; }
.btn-pdf:hover { background: var(--acc-h); }
.btn-xls { background: var(--bg-el); color: var(--text2); border: 1px solid var(--border); }
.btn-xls:hover { background: var(--bg-el2); }

/* ══ FILTER BAR ══ */
.filter-bar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 12px 28px;
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  gap: 12px;
}
.filter-section { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.4px;
  white-space: nowrap;
}
.filter-divider { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }
.period-chips, .mod-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.pchip, .mchip {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 11px; border-radius: 20px;
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); font-size: 11.5px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.pchip.active, .mchip.active {
  background: var(--accent2); border-color: var(--accent);
  color: var(--accent); font-weight: 700;
}
.pchip:hover:not(.active), .mchip:hover:not(.active) { background: var(--bg-el2); }
.date-range {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-el); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 4px 10px;
}
.dr-label { font-size: 11px; color: var(--muted); }
.dr-input {
  border: none; background: transparent; font-size: 12px;
  color: var(--text1); font-family: inherit; outline: none;
}
.btn-apply {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 12px; border-radius: var(--radius-s);
  background: var(--accent); color: white;
  border: none; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.btn-apply:hover { background: var(--acc-h); }
.sel-custom {
  padding: 5px 10px; border-radius: var(--radius-s);
  border: 1px solid var(--border); background: var(--bg-el);
  color: var(--text1); font-size: 12px; font-family: inherit;
  outline: none; cursor: pointer;
}

/* ══ PERIOD BADGE ══ */
.period-badge-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 28px;
  border-bottom: 1px solid var(--border);
  background: var(--accent2);
  flex-wrap: wrap;
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

/* ══ CONTENT ══ */
.reports-content { padding: 24px 28px; flex: 1; display: flex; flex-direction: column; gap: 32px; }

/* ══ SECTION BLOCK ══ */
.section-block { display: flex; flex-direction: column; gap: 16px; }
.section-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px;
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.section-icon {
  width: 38px; height: 38px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 18px; flex-shrink: 0;
}
.section-title { font-size: 15px; font-weight: 800; color: var(--text1); letter-spacing: -0.3px; }
.section-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
.btn-section-pdf {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: var(--radius-s);
  background: transparent; border: 1px solid var(--accent);
  color: var(--accent); font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-section-pdf:hover { background: var(--accent); color: white; }

/* ══ CARDS ══ */
.card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
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
.chip-badge {
  display: inline-block;
  font-size: 9px; font-weight: 800;
  padding: 1px 5px; border-radius: 10px;
  color: white; margin-left: 3px;
}
.badge-red    { background: var(--red);    }
.badge-yellow { background: var(--yellow); }
.badge-blue   { background: var(--blue);   }

/* ══ COLOR HELPERS ══ */
.c-orange { background: var(--accent); }
.c-green  { background: var(--green);  }
.c-blue   { background: var(--blue);   }
.c-yellow { background: var(--yellow); }
.c-red    { background: var(--red);    }

/* ══ KPI REPORT ══ */
.kpi-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.kpi-report {
  position: relative; overflow: hidden;
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 18px 18px 14px;
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
  font-size: 72px !important; opacity: 0.04;
  pointer-events: none;
}
.k-orange .kr-icon { background: var(--accent); }
.k-green  .kr-icon { background: var(--green);  }
.k-blue   .kr-icon { background: var(--blue);   }
.k-yellow .kr-icon { background: var(--yellow); }
.k-red    .kr-icon { background: var(--red);    }

/* ══ MINI METRICS ══ */
.kpi-grid-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.kpi-mini-r {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 14px 16px;
  box-shadow: var(--shadow);
}
.kmr-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.kmr-value { font-size: 16px; font-weight: 800; color: var(--text1); margin: 6px 0 4px; letter-spacing: -0.4px; }
.kmr-sub   { font-size: 11px; color: var(--muted); }

/* ══ CHARTS ══ */
.chart-wrap { position: relative; width: 100%; padding: 14px 18px; }
.h180 { height: 180px; }
.h200 { height: 200px; }
.h220 { height: 220px; }
.h240 { height: 240px; }
.chart-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* ══ DRE ══ */
.fin-grid { padding: 6px 18px 14px; }
.dre-row {
  display: flex; align-items: center;
  padding: 9px 0; border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.dre-row:last-child { border-bottom: none; }
.dre-highlight { background: var(--bg-el); margin: 0 -18px; padding: 9px 18px; border-radius: 4px; }
.dre-label { color: var(--text2); font-weight: 500; }
.dre-spacer { flex: 1; }
.dre-value { font-weight: 700; min-width: 120px; text-align: right; }
.dre-pct { font-size: 11.5px; color: var(--muted); min-width: 60px; text-align: right; }

/* ══ SELLER CARDS ══ */
.seller-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.seller-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: var(--shadow);
}
.sc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sc-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: white; flex-shrink: 0;
}
.sc-av-1 { background: var(--accent); }
.sc-av-2 { background: var(--blue);   }
.sc-av-3 { background: var(--green);  }
.sc-av-4 { background: var(--yellow); }
.sc-av-5 { background: #7c3aed;       }
.sc-av-6 { background: var(--red);    }
.sc-name  { font-size: 13px; font-weight: 700; color: var(--text1); }
.sc-level { font-size: 11px; color: var(--muted); }
.sc-status {
  margin-left: auto; font-size: 11px; font-weight: 700;
  padding: 3px 8px; border-radius: 10px;
}
.sc-ok     { color: var(--green);  background: var(--green2);  }
.sc-warn   { color: var(--accent); background: var(--accent2); }
.sc-danger { color: var(--red);    background: var(--red2);    }
.sc-meta-bar {
  height: 5px; background: var(--bg-el2); border-radius: 10px;
  overflow: hidden; margin-bottom: 12px;
}
.sc-meta-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }
.sc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid var(--border); padding-top: 10px; }
.sc-stat { text-align: center; }
.sc-stat-val { font-size: 13px; font-weight: 700; color: var(--text1); }
.sc-stat-lbl { font-size: 10px; color: var(--muted); margin-top: 2px; }
.sc-commission {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);
}
.scc-lbl { font-size: 11px; color: var(--muted); }
.scc-val { font-size: 14px; font-weight: 800; color: var(--accent); }

/* ══ TABLES ══ */
.report-table {
  width: 100%; border-collapse: collapse; font-size: 12.5px;
}
.report-table thead tr {
  border-bottom: 2px solid var(--border);
}
.report-table th {
  padding: 10px 16px; text-align: left;
  font-size: 10.5px; font-weight: 700;
  color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.4px; background: var(--bg-el);
  white-space: nowrap;
}
.report-table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text2);
  vertical-align: middle;
}
.report-table tbody tr:last-child td { border-bottom: none; }
.report-table tbody tr:hover { background: var(--bg-el); }
.cell-name  { font-size: 12.5px; font-weight: 600; color: var(--text1); }
.cell-sub   { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.mono-bold  { font-weight: 700; color: var(--text1); }
.accent-text { color: var(--accent); }
.user-cell  { display: flex; align-items: center; gap: 8px; }
.mini-av {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: white; flex-shrink: 0;
}
.rank-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  font-size: 11px; font-weight: 700;
  background: var(--bg-el2); color: var(--muted);
}
.rank-num.gold   { background: #fef9c3; color: #a16207; }
.rank-num.silver { background: #f1f5f9; color: #475569; }
.rank-num.bronze { background: #fef0e7; color: var(--accent); }
.delta-up   { color: var(--green); font-weight: 700; font-size: 12px; }
.delta-down { color: var(--red);   font-weight: 700; font-size: 12px; }
.inline-bar {
  display: flex; align-items: center; gap: 6px;
}
.ib-fill {
  height: 6px; border-radius: 3px;
  transition: width 0.3s;
  min-width: 4px;
  flex: 1;
}
.ib-val { font-size: 11px; color: var(--muted); white-space: nowrap; }

/* ══ TAGS ══ */
.tag-r {
  display: inline-block;
  padding: 2px 8px; border-radius: 8px;
  font-size: 11px; font-weight: 700;
}
.tag-green  { background: var(--green2); color: var(--green); }
.tag-orange { background: var(--accent2); color: var(--accent); }
.tag-red    { background: var(--red2); color: var(--red); }
.tag-blue   { background: var(--blue2); color: var(--blue); }
.tag-blue-soft { background: var(--blue2); color: var(--blue); }

/* ══ CATEGORY DETAIL ══ */
.cat-detail-grid { display: grid; grid-template-columns: 200px 1fr; gap: 16px; padding: 14px 18px; align-items: center; }
.cat-detail-list { display: flex; flex-direction: column; gap: 8px; }
.cat-detail-row { display: flex; align-items: center; gap: 8px; }
.cdr-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cdr-name { font-size: 12px; font-weight: 600; color: var(--text1); width: 100px; }
.cdr-bar-wrap { flex: 1; height: 6px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.cdr-bar { height: 100%; border-radius: 3px; }
.cdr-qty { font-size: 11px; color: var(--muted); width: 52px; text-align: right; }
.cdr-val { font-size: 12px; font-weight: 700; color: var(--text1); width: 90px; text-align: right; }

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

/* ══ ALERT BOXES ══ */
.alert-boxes {
  display: flex; gap: 8px; padding: 12px 18px;
  border-bottom: 1px solid var(--border);
}
.abox {
  flex: 1; border-radius: var(--radius-s); padding: 10px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.abox.red    { background: var(--red2);    border: 1px solid var(--red)'22'; }
.abox.yellow { background: var(--yellow2); border: 1px solid var(--yellow)'22'; }
.abox.blue   { background: var(--blue2);   border: 1px solid var(--blue)'22'; }
.abox.orange { background: var(--accent2); border: 1px solid var(--accent)'22'; }
.abox-num { font-size: 22px; font-weight: 900; color: var(--text1); }
.abox.red    .abox-num { color: var(--red);    }
.abox.yellow .abox-num { color: var(--yellow); }
.abox.blue   .abox-num { color: var(--blue);   }
.abox.orange .abox-num { color: var(--accent); }
.abox-lbl { font-size: 10px; color: var(--muted); font-weight: 600; }

/* ══ ALERT LIST ══ */
.alert-list { padding: 8px 18px 14px; display: flex; flex-direction: column; gap: 8px; }
.alert-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
}
.alert-icon { font-size: 18px !important; flex-shrink: 0; }
.alert-info { flex: 1; min-width: 0; }
.alert-name { font-size: 12.5px; font-weight: 600; color: var(--text1); }
.alert-desc { font-size: 11px; color: var(--muted); margin-top: 1px; }

/* ══ SUPPLIER LIST ══ */
.supplier-list { padding: 10px 18px 14px; display: flex; flex-direction: column; gap: 10px; }
.supplier-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius-s);
  border: 1px solid var(--border); background: var(--bg-el);
}
.sup-icon { font-size: 20px; }
.sup-info { flex: 1; }
.sup-name { font-size: 12.5px; font-weight: 700; color: var(--text1); }
.sup-cat  { font-size: 11px; color: var(--muted); }
.sup-stats { text-align: right; }
.sup-value  { font-size: 13px; font-weight: 800; color: var(--text1); }
.sup-detail { font-size: 11px; color: var(--muted); }

/* ══ STOCK STATUS LEGEND ══ */
.stock-status-legend { padding: 10px 18px 14px; display: flex; flex-direction: column; gap: 7px; }
.ssl-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
.ssl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ssl-label { flex: 1; color: var(--text2); }
.ssl-val { font-weight: 700; }
.ssl-pct { color: var(--muted); font-size: 11.5px; width: 34px; text-align: right; }

/* ══ LOCATION CARDS ══ */
.location-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.loc-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: var(--shadow);
}
.lc-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.lc-icon {
  width: 32px; height: 32px;
  background: var(--accent2); border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent); font-size: 16px; flex-shrink: 0;
}
.lc-name { font-size: 12.5px; font-weight: 700; color: var(--text1); }
.lc-addr { font-size: 10.5px; color: var(--muted); }
.lc-trend { font-size: 11px; font-weight: 700; margin-left: auto; white-space: nowrap; }
.trend-up   { color: var(--green); }
.trend-down { color: var(--red);   }
.lc-sales { font-size: 20px; font-weight: 900; color: var(--accent); letter-spacing: -0.5px; }
.lc-sales-lbl { font-size: 10.5px; color: var(--muted); margin-bottom: 8px; }
.lc-bar-wrap { height: 5px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; margin-bottom: 12px; }
.lc-bar { height: 100%; background: var(--accent); border-radius: 3px; }
.lc-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 10px; }
.lc-stat-val { font-size: 12px; font-weight: 700; color: var(--text1); }
.lc-stat-lbl { font-size: 10px; color: var(--muted); }

/* ══ GRIDS ══ */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

/* ══ HEATMAP ══ */
.heatmap-wrap { padding: 14px 18px 6px; }
.heatmap-grid {
  display: grid;
  grid-template-columns: 30px repeat(7, 1fr);
  gap: 3px;
}
.hm-day  { font-size: 9.5px; font-weight: 700; color: var(--muted); text-align: center; padding-bottom: 2px; }
.hm-hour { font-size: 9.5px; color: var(--muted); display: flex; align-items: center; justify-content: flex-end; padding-right: 5px; }
.hm-cell { height: 22px; border-radius: 4px; cursor: default; transition: transform 0.1s; }
.hm-cell:hover { transform: scale(1.1); }
.h0 { background: var(--bg-el2); }
.h1 { background: #ff804918; }
.h2 { background: #ff804935; }
.h3 { background: #ff804955; }
.h4 { background: #ff804978; }
.h5 { background: var(--accent); }
.hm-legend { display: flex; align-items: center; gap: 4px; justify-content: flex-end; margin-top: 8px; }
.hm-leg-lbl { font-size: 10px; color: var(--muted); }
.peak-section { padding: 0 18px 14px; border-top: 1px solid var(--border); margin-top: 6px; }
.peak-block { margin-top: 12px; }
.peak-header { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
.peak-hour {
  background: var(--bg-el2); border: 1px solid var(--border);
  border-radius: 5px; padding: 3px 8px;
  font-size: 11px; font-weight: 700; color: var(--accent);
}
.peak-label { font-size: 11px; color: var(--muted); flex: 1; }
.peak-total { font-size: 12px; font-weight: 700; }
.peak-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.peak-pname { font-size: 11.5px; color: var(--text2); width: 160px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.peak-pct { font-size: 10.5px; color: var(--muted); width: 28px; text-align: right; }

/* ══ FOOTER ══ */
.reports-footer {
  padding: 14px 28px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--muted);
  background: var(--bg-card);
}

/* ══ PRINT ══ */
@media print {
  .reports-header, .filter-bar, .period-badge-row { position: static; }
  .rh-right { display: none; }
  .btn-section-pdf { display: none; }
  .card { break-inside: avoid; }
  .section-block { break-inside: avoid; }
}

/* ══ RESPONSIVE ══ */
@media (max-width: 1280px) {
  .kpi-grid-4    { grid-template-columns: repeat(2, 1fr); }
  .kpi-grid-6    { grid-template-columns: repeat(3, 1fr); }
  .location-cards { grid-template-columns: repeat(3, 1fr); }
  .seller-summary-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .reports-content { padding: 16px; }
  .chart-section-grid { grid-template-columns: 1fr; }
  .grid-3 { grid-template-columns: 1fr; }
  .kpi-grid-4 { grid-template-columns: 1fr 1fr; }
  .kpi-grid-6 { grid-template-columns: repeat(2, 1fr); }
  .location-cards { grid-template-columns: repeat(2, 1fr); }
  .seller-summary-grid { grid-template-columns: 1fr; }
  .cat-detail-grid { grid-template-columns: 1fr; }
}
</style>