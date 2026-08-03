<template>
  <div class="dashboard-root">
    <div class="main-area">

        <div class="content">

        <div class="news-banner-container">
          <Carousel 
            :value="banners" 
            :numVisible="1" 
            :numScroll="1" 
            :circular="true" 
            :autoplayInterval="5000"
            :showNavigators="false" 
            class="direct-carousel"
          >
            <template #item="slotProps">
              <div class="news-slide" :class="slotProps.data.colorClass">
                <div class="news-body">
                  <div class="news-badge">
                    <span class="material-symbols-outlined">campaign</span>
                    NOTICIÁRIO DA LOJA
                  </div>
                  
                  <h2 class="news-title">{{ slotProps.data.title }}</h2>
                  <p class="news-text">{{ slotProps.data.description }}</p>
                  
                  <div class="news-footer">
                    <button class="news-btn">
                      {{ slotProps.data.buttonLabel }}
                      <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                    <span class="news-time">Atualizado agora</span>
                  </div>
                </div>

                <div class="news-bg-icon">
                  <span class="material-symbols-outlined">{{ slotProps.data.icon }}</span>
                </div>
              </div>
            </template>
          </Carousel>
        </div>

        <div class="alert-bar" v-if="showAlert">
          <span class="material-symbols-outlined" style="color:var(--accent); font-size: 20px;">error</span>
          <span>
            <strong>7 produtos</strong> com estoque crítico ·
            <strong>3 produtos parados</strong> há mais de 60 dias ·
            <strong style="color:var(--accent)">Condicionador Profissional</strong> é o mais vendido desta semana.
          </span>
          <span 
            class="material-symbols-outlined" 
            style="margin-left:auto; cursor:pointer; color:var(--muted); font-size: 18px;" 
            @click="showAlert=false">close</span>
        </div>

        <div class="kpi-grid">
          <div
            v-for="kpi in currentKpis"
            :key="kpi.label"
            class="kpi-card"
            :class="kpi.accent"
          >
            <div class="kpi-label">
              <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 4px;">{{ kpi.googleIcon }}</span> 
              {{ kpi.label }}
            </div>
            <div class="kpi-value">
              <span v-if="kpi.prefix" class="kpi-prefix">{{ kpi.prefix }}</span>
              {{ kpi.value }}
            </div>
            <div class="kpi-footer">
              <span :class="['kpi-delta', kpi.trendUp ? 'up' : 'down']">
                <span class="material-symbols-outlined" style="font-size: 14px;">
                  {{ kpi.trendUp ? 'trending_up' : 'trending_down' }}
                </span>
                {{ kpi.trend }}
              </span>
              <span class="kpi-sub">vs período anterior</span>
            </div>
            <span class="material-symbols-outlined kpi-bg-icon">{{ kpi.googleIcon }}</span>
          </div>
        </div>

        <div class="kpi-mini-grid">
          <div v-for="m in miniKpis" :key="m.label" class="kpi-mini">
            <div class="kpi-mini-label">{{ m.label }}</div>
            <div class="kpi-mini-value">{{ m.value }}</div>
            <div class="kpi-mini-sub">
              <span v-if="m.showLegend" class="material-symbols-outlined" style="font-size: 14px;" :style="{ color: m.trendUp ? 'var(--green)' : 'var(--red)' }">
                {{ m.trendUp ? 'trending_up' : 'trending_down' }} 
              </span>
              <span  v-if="m.showLegend" :style="{ color: m.trendUp ? 'var(--green)' : 'var(--red)' }" style="font-weight: 800;">
                {{ m.delta }}
              </span>
              {{ m.sub }}
            </div>
          </div>
        </div>

        <div class="grid-2-1">
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">monitoring</span>
              </div>
              <div>
                <div class="card-title">Evolução de Vendas</div>
                <div class="card-sub">Bruta vs Líquida · período selecionado</div>
              </div>
              <div class="card-actions">
                <span class="chip active">Bruta</span>
                <span class="chip">Líquida</span>
              </div>
            </div>
            <div class="chart-wrap h220">
              <Line :data="evolutionData" :options="lineOptions" />
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue">
                <span class="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <div class="card-title">Vendas por Horário</div>
                <div class="card-sub">Pico: 11h–13h · 17h–19h</div>
              </div>
            </div>
            <div class="chart-wrap h220">
              <Bar :data="hourlyData" :options="barOptions" />
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">group</span>
              </div>
              <div>
                <div class="card-title">Ranking de Vendedores</div>
                <div class="card-sub">Performance individual · mês atual</div>
              </div>
              <div class="card-actions">
                <SelectButton v-model="sellerFilter" :options="['Valor','Qtd.']" class="sb-custom" />
              </div>
            </div>
            <DataTable :value="sellers" class="dt-custom" size="small">
              <Column header="#" style="width:36px">
                <template #body="{ index }">
                  <span class="rank-num" :class="['gold','silver','bronze'][index]||''">{{ index + 1 }}</span>
                </template>
              </Column>
              <Column header="VENDEDOR">
                <template #body="{ data }">
                  <div class="user-cell">
                    <Avatar :label="data.initials" shape="circle" class="av" :class="'av-'+data.avColor" />
                    <div>
                      <div class="cell-name">{{ data.name }}</div>
                      <div class="cell-sub">{{ data.level }}</div>
                    </div>
                  </div>
                </template>
              </Column>
              <Column header="VENDAS">
                <template #body="{ data }">
                  <span class="mono-bold">R$ {{ data.sales }}</span>
                </template>
              </Column>
              <Column header="META" style="width:120px">
                <template #body="{ data }">
                  <div class="meta-cell">
                    <ProgressBar :value="data.meta" :showValue="false"
                      class="pb-custom" :class="data.meta >= 100 ? 'pb-green' : 'pb-orange'" />
                    <span class="meta-pct">{{ data.meta }}%</span>
                  </div>
                </template>
              </Column>
              <Column header="TICKET MÉD.">
                <template #body="{ data }">
                  <span style="color:var(--text2)">R$ {{ data.ticket }}</span>
                </template>
              </Column>
              <Column header="STATUS">
                <template #body="{ data }">
                  <Tag :value="data.status" :class="['tag-custom', data.meta >= 100 ? 'tag-green' : 'tag-orange']" />
                </template>
              </Column>
            </DataTable>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-green">
                <span class="material-symbols-outlined">star</span>
              </div>
              <div>
                <div class="card-title">Ranking de Produtos</div>
                <div class="card-sub">Mais vendidos · receita e volume</div>
              </div>
              <div class="card-actions">
                <SelectButton v-model="productFilter" :options="['Receita','Unid.']" class="sb-custom" />
              </div>
            </div>
            <DataTable :value="products" class="dt-custom" size="small">
              <Column header="#" style="width:36px">
                <template #body="{ index }">
                  <span class="rank-num" :class="['gold','silver','bronze'][index]||''">{{ index + 1 }}</span>
                </template>
              </Column>
              <Column header="PRODUTO">
                <template #body="{ data }">
                  <div class="cell-name">{{ data.name }}</div>
                  <div class="cell-sub">{{ data.category }}</div>
                </template>
              </Column>
              <Column field="units" header="UNID." />
              <Column header="RECEITA">
                <template #body="{ data }">
                  <span class="mono-bold">R$ {{ data.revenue }}</span>
                </template>
              </Column>
              <Column header="GIRO" style="width:120px">
                <template #body="{ data }">
                  <div class="meta-cell">
                    <ProgressBar :value="data.giroPerc" :showValue="false" class="pb-custom pb-green" />
                    <span class="meta-pct">{{ data.giroDays }}d</span>
                  </div>
                </template>
              </Column>
              <Column header="STATUS">
                <template #body="{ data }">
                  <Tag :value="data.statusLabel" :class="['tag-custom', data.tagClass]" />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <div class="grid-3">

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-yellow">
                <span class="material-symbols-outlined">category</span>
              </div>
              <div>
                <div class="card-title">Classes de Produtos</div>
                <div class="card-sub">Estoque · giro por categoria</div>
              </div>
            </div>
            <div class="donut-wrap">
              <Doughnut :data="categoryData" :options="donutOptions" />
            </div>
            <div class="cat-list">
              <div v-for="cat in categories" :key="cat.name" class="cat-item">
                <span class="cat-dot" :style="{ background: cat.color }"></span>
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-qty">{{ cat.qty }} un.</span>
                <div class="pb-wrap-sm">
                  <ProgressBar :value="cat.pct" :showValue="false" class="pb-custom pb-dyn"
                    :style="{ '--pb-color': cat.color }" />
                </div>
                <span class="cat-val">R$ {{ cat.monthly }}<span class="cat-per">/mês</span></span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue">
                <span class="material-symbols-outlined">local_shipping</span>
              </div>
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
                <Tag :value="s.status" :class="['tag-custom', s.status === 'Ativo' ? 'tag-green' : 'tag-yellow']" />
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-red">
                <span class="material-symbols-outlined">warning</span>
              </div>
              <div>
                <div class="card-title">Alertas de Estoque</div>
                <div class="card-sub">Itens críticos · ação necessária</div>
              </div>
            </div>
            <div class="alert-boxes">
              <div class="abox red"><span class="abox-num">7</span><span class="abox-lbl">Baixo</span></div>
              <div class="abox yellow"><span class="abox-num">3</span><span class="abox-lbl">Parados</span></div>
              <div class="abox blue"><span class="abox-num">5</span><span class="abox-lbl">Excesso</span></div>
            </div>
            <div class="alert-list">
              <div v-for="a in inventoryAlerts" :key="a.name" class="alert-item">
                <span 
                  class="material-symbols-outlined alert-icon" 
                  :style="{ color: a.color }">{{ a.googleIcon || 'notification_important' }}</span>
                <div class="alert-info">
                  <div class="alert-name">{{ a.name }}</div>
                  <div class="alert-desc">{{ a.desc }}</div>
                </div>
                <Tag :value="a.tag" class="tag-custom" :style="{ background: a.color + '22', color: a.color, border: '1px solid ' + a.color + '44' }" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid-2">

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-orange">
                <span class="material-symbols-outlined">grid_view</span>
              </div>
              <div>
                <div class="card-title">Mapa de Calor — Vendas por Horário</div>
                <div class="card-sub">Intensidade por hora e dia da semana</div>
              </div>
            </div>
            <div class="heatmap-wrap">
              <div class="heatmap-grid">
                <div></div>
                <div v-for="d in weekDays" :key="d" class="hm-day">{{ d }}</div>
                <template v-for="row in heatmapData" :key="row.hour">
                  <div class="hm-hour">{{ row.hour }}</div>
                  <div
                    v-for="(val, di) in row.vals"
                    :key="di"
                    class="hm-cell"
                    :class="'h'+val"
                    :title="weekDays[di] + ' ' + row.hour + ' · intensidade ' + val"
                  ></div>
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
                  <div class="pb-wrap-sm" style="flex:1">
                    <ProgressBar :value="p.pct" :showValue="false" class="pb-custom pb-orange" />
                  </div>
                  <span class="peak-pct">{{ p.pct }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="card" style="flex:1">
              <div class="card-head">
                <div class="card-icon c-green">
                  <span class="material-symbols-outlined">timer</span>
                </div>
                <div>
                  <div class="card-title">Tempo Médio no Estoque</div>
                  <div class="card-sub">Entrada → saída por categoria</div>
                </div>
              </div>
              <div class="chart-wrap h180">
                <Bar :data="stockTimeData" :options="hBarOptions" />
              </div>
              <div class="stock-summary">
                <div class="ss-item">
                  <div class="ss-val accent">18,4d</div>
                  <div class="ss-lbl">Média Geral</div>
                </div>
                <div class="ss-item">
                  <div class="ss-val green">7,2d</div>
                  <div class="ss-lbl">Melhor Cat.</div>
                </div>
                <div class="ss-item">
                  <div class="ss-val red">42d</div>
                  <div class="ss-lbl">Pior Cat.</div>
                </div>
                <div class="ss-item">
                  <div class="ss-val blue">↑1,8d</div>
                  <div class="ss-lbl">vs mês ant.</div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-head">
                <div class="card-icon c-orange">
                  <span class="material-symbols-outlined">calculate</span>
                </div>
                <div>
                  <div class="card-title">Resumo Financeiro</div>
                  <div class="card-sub">Mês atual consolidado</div>
                </div>
              </div>
              <div class="fin-list">
                <div v-for="f in financialSummary" :key="f.label" class="fin-row">
                  <span class="fin-label">{{ f.label }}</span>
                  <span class="fin-value" :style="{ color: f.color || 'var(--text1)' }">{{ f.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-1-2">

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-blue">
                <span class="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <div class="card-title">Análise por Local de Venda</div>
                <div class="card-sub">Desempenho por ponto · produto líder</div>
              </div>
            </div>
            <DataTable :value="locations" class="dt-custom" size="small">
              <Column header="LOCAL">
                <template #body="{ data }">
                  <div class="cell-name">{{ data.name }}</div>
                  <div class="cell-sub">{{ data.address }}</div>
                </template>
              </Column>
              <Column header="VENDA BRUTA">
                <template #body="{ data }">
                  <span class="mono-bold">R$ {{ data.sales }}</span>
                </template>
              </Column>
              <Column header="PRODUTO LÍDER">
                <template #body="{ data }">
                  <span style="color:var(--text2);font-size:11.5px">{{ data.leader }}</span>
                </template>
              </Column>
              <Column header="TICKET MÉD.">
                <template #body="{ data }">R$ {{ data.ticket }}</template>
              </Column>
              <Column header="TREND">
                <template #body="{ data }">
                  <Tag :value="(data.trend > 0 ? '+' : '') + data.trend + '%'"
                    :class="['tag-custom', data.trend > 0 ? 'tag-green' : 'tag-red']" />
                </template>
              </Column>
            </DataTable>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-green">
                <span class="material-symbols-outlined">bar_chart</span>
              </div>
              <div>
                <div class="card-title">Comparativo Mensal</div>
                <div class="card-sub">Venda Bruta vs Líquida · últimos 6 meses</div>
              </div>
            </div>
            <div class="chart-wrap h250">
              <Bar :data="monthlyData" :options="monthlyOptions" />
            </div>
          </div>
        </div>

        <div class="grid-2">

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-yellow">
                <span class="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <div class="card-title">Médias de Venda por Produto</div>
                <div class="card-sub">Diária · semanal · mensal · prazo médio</div>
              </div>
            </div>
            <DataTable :value="productAverages" class="dt-custom" size="small">
              <Column header="PRODUTO">
                <template #body="{ data }">
                  <div class="cell-name">{{ data.name }}</div>
                  <div class="cell-sub">{{ data.category }}</div>
                </template>
              </Column>
              <Column header="DIÁRIA">
                <template #body="{ data }">
                  <span class="mono-bold">{{ data.daily }}</span>
                </template>
              </Column>
              <Column header="SEMANAL">
                <template #body="{ data }">
                  <span class="mono-bold">{{ data.weekly }}</span>
                </template>
              </Column>
              <Column header="MENSAL">
                <template #body="{ data }">
                  <span class="mono-bold">{{ data.monthly }}</span>
                </template>
              </Column>
              <Column header="PRAZO MÉD.">
                <template #body="{ data }">
                  <Tag :value="data.avgDays + 'd'" :class="['tag-custom', data.avgDays <= 14 ? 'tag-green' : data.avgDays <= 28 ? 'tag-orange' : 'tag-red']" />
                </template>
              </Column>
            </DataTable>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-icon c-red">
                <span class="material-symbols-outlined">warehouse</span>
              </div>
              <div>
                <div class="card-title">Situação do Estoque</div>
                <div class="card-sub">Parados · baixo · excesso</div>
              </div>
              <div class="card-actions">
                <div class="tab-group">
                  <button v-for="t in stockTabs" :key="t.key"
                    class="stab"
                    :class="{ active: activeStockTab === t.key }"
                    @click="activeStockTab = t.key">
                    {{ t.label }}
                    <span class="stab-badge" :class="t.color">{{ t.count }}</span>
                  </button>
                </div>
              </div>
            </div>
            <DataTable :value="currentStockList" class="dt-custom" size="small">
              <Column header="PRODUTO">
                <template #body="{ data }">
                  <div class="cell-name">{{ data.name }}</div>
                  <div class="cell-sub">{{ data.category }}</div>
                </template>
              </Column>
              <Column header="ESTOQUE">
                <template #body="{ data }">
                  <span class="mono-bold" :style="{ color: stockTabColor }">{{ data.stock }} un.</span>
                </template>
              </Column>
              <Column header="REFERÊNCIA">
                <template #body="{ data }">
                  <span style="color:var(--muted)">{{ data.ref }}</span>
                </template>
              </Column>
              <Column header="DETALHE">
                <template #body="{ data }">
                  <span style="font-size:11px;color:var(--text2)">{{ data.detail }}</span>
                </template>
              </Column>
              <Column header="">
                <template #body="{ data }">
                  <Tag :value="data.tag" class="tag-custom" :style="{ background: stockTabColor + '22', color: stockTabColor, border: '1px solid ' + stockTabColor + '44' }" />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

      </div><footer class="dash-footer">
        <span>Market Vizium ERP Varejo · Loja Central · Dados via ERP</span>
        <span>©2026 Todos os dados reservados · Última sync: {{ new Date().toLocaleTimeString() }}</span>
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
import SelectButton from 'primevue/selectbutton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import { Carousel } from 'primevue';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement, ArcElement, Filler);

const ACCENT = '#FF8049';
const GREEN  = '#3ecf8e';
const BLUE   = '#60a5fa';
const YELLOW = '#fbbf24';
const RED    = '#f06060';
const GRID   = 'rgba(255,255,255,0.05)';
const TEXT   = '#5a5a6e';
const TOOLTIP_BG = '#1f1f2e';

const baseTooltip = {
  backgroundColor: TOOLTIP_BG,
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#f0f0f4',
  bodyColor: '#9494a8',
  padding: 10,
};

const baseScales = {
  x: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 11 } } },
  y: { grid: { color: GRID }, ticks: { color: TEXT, font: { size: 11 } } },
};

export default {
  name: 'SalesDashboard',
  components: { Line, Bar, Doughnut, SelectButton, DataTable, Column, ProgressBar, Tag, Avatar, Carousel },

  data() {
    return {
      showAlert: true,
      activePeriod: 'mes',
      sellerFilter: 'Valor',
      productFilter: 'Receita',
      activeStockTab: 'parados',
      currentMonth: 'Março 2025',

      banners :[
        {
          title: "Bem-vindo ao Centro de Comando",
          description: "Analise as estatísticas de faturamento, ticket médio e performance da sua loja em tempo real.",
          icon: "monitoring",
          buttonLabel: "Ver Estatísticas",
          colorClass: "bg-orange"
        },
        {
          title: "Cotações Inteligentes Ativas",
          description: "O sistema identificou itens abaixo do estoque mínimo. Realize cotações automáticas agora.",
          icon: "request_quote",
          buttonLabel: "Fazer Cotação",
          colorClass: "bg-dark"
        },
        {
          title: "Monitoramento de Equipe",
          description: "Acompanhe as atividades dos colaboradores no caixa e estoque para garantir a eficiência operacional.",
          icon: "groups",
          buttonLabel: "Gerenciar Equipe",
          colorClass: "bg-blue"
        },
        {
          title: "Gestão de Vendedores",
          description: "Controle as metas, comissões e o ranking de vendas dos colaboradores associados à sua loja.",
          icon: "person_celebrate",
          buttonLabel: "Acessar Ranking",
          colorClass: "bg-green"
        }
      ],

      periods: [
        { key: 'dia',    label: 'Dia' },
        { key: 'semana', label: 'Semana' },
        { key: 'mes',    label: 'Mês' },
        { key: 'ano',    label: 'Ano' },
      ],

      kpisByPeriod: {
        dia:    [
          { label: 'VENDA BRUTA',      value: '3.247',   prefix: 'R$', trend: '8,2%',  trendUp: true,  icon: 'pi pi-dollar',        accent: 'k-orange' },
          { label: 'VENDA LÍQUIDA',    value: '2.891',   prefix: 'R$', trend: '7,8%',  trendUp: true,  icon: 'pi pi-wallet',        accent: 'k-green'  },
          { label: 'TICKETS VENDIDOS', value: '47',      prefix: '',   trend: '5,4%',  trendUp: true,  icon: 'pi pi-shopping-cart', accent: 'k-blue'   },
          { label: 'TICKET MÉDIO',     value: '69,10',   prefix: 'R$', trend: '2,3%',  trendUp: true,  icon: 'pi pi-tag',           accent: 'k-yellow' },
        ],
        semana: [
          { label: 'VENDA BRUTA',      value: '22.730',  prefix: 'R$', trend: '5,1%',  trendUp: true,  icon: 'pi pi-dollar',        accent: 'k-orange' },
          { label: 'VENDA LÍQUIDA',    value: '20.210',  prefix: 'R$', trend: '4,8%',  trendUp: true,  icon: 'pi pi-wallet',        accent: 'k-green'  },
          { label: 'TICKETS VENDIDOS', value: '318',     prefix: '',   trend: '3,2%',  trendUp: true,  icon: 'pi pi-shopping-cart', accent: 'k-blue'   },
          { label: 'TICKET MÉDIO',     value: '71,47',   prefix: 'R$', trend: '1,2%',  trendUp: false, icon: 'pi pi-tag',           accent: 'k-yellow' },
        ],
        mes: [
          { label: 'VENDA BRUTA',      value: '128.430', prefix: 'R$', trend: '11,4%', trendUp: true,  icon: 'pi pi-dollar',        accent: 'k-orange' },
          { label: 'VENDA LÍQUIDA',    value: '113.730', prefix: 'R$', trend: '10,9%', trendUp: true,  icon: 'pi pi-wallet',        accent: 'k-green'  },
          { label: 'TICKETS VENDIDOS', value: '1.842',   prefix: '',   trend: '9,7%',  trendUp: true,  icon: 'pi pi-shopping-cart', accent: 'k-blue'   },
          { label: 'TICKET MÉDIO',     value: '69,72',   prefix: 'R$', trend: '1,6%',  trendUp: true,  icon: 'pi pi-tag',           accent: 'k-yellow' },
        ],
        ano: [
          { label: 'VENDA BRUTA',      value: '1.124.300', prefix: 'R$', trend: '18,2%', trendUp: true, icon: 'pi pi-dollar',        accent: 'k-orange' },
          { label: 'VENDA LÍQUIDA',    value: '987.400',   prefix: 'R$', trend: '17,6%', trendUp: true, icon: 'pi pi-wallet',        accent: 'k-green'  },
          { label: 'TICKETS VENDIDOS', value: '18.220',    prefix: '',   trend: '14,3%', trendUp: true, icon: 'pi pi-shopping-cart', accent: 'k-blue'   },
          { label: 'TICKET MÉDIO',     value: '69,42',     prefix: 'R$', trend: '3,4%',  trendUp: true, icon: 'pi pi-tag',           accent: 'k-yellow' },
        ],
      },

      miniKpis: [
        { label: 'MÉDIA DIÁRIA',         value: 'R$ 3.247',   delta: '8,2%',  trendUp: true,  sub: 'vs ontem',    showLegend: true },
        { label: 'MÉDIA SEMANAL',        value: 'R$ 22.730',  delta: '5,1%',  trendUp: true,  sub: 'vs sem. ant.',showLegend: true },
        { label: 'MÉDIA MENSAL',         value: 'R$ 98.420',  delta: '11,4%', trendUp: true,  sub: 'vs mês ant.', showLegend: true  },
        { label: 'PRAZO MÉDIO VENDA',    value: '18,4 dias',  delta: '2,1d',  trendUp: false, sub: 'no estoque',  showLegend: true   },
        { label: 'PRODUTOS ATIVOS',      value: '1.248',      delta: '1.412', trendUp: true,  sub: 'Ativos no varejo', showLegend: false  },
        { label: 'PRODUTOS NO COMÉRCIO', value: '130',        delta: '1,3pp', trendUp: true,  sub: 'Estoque + Loja', showLegend: false  },
      ],

      sellers: [
        { name: 'Ana Paula Silva', initials: 'AP', avColor: '1', level: 'Senior', sales: '24.870', meta: 108, ticket: '127,50', status: 'Meta'    },
        { name: 'Carlos Mendes',   initials: 'CM', avColor: '2', level: 'Pleno',  sales: '19.320', meta: 94,  ticket: '98,20',  status: 'Prog.'   },
        { name: 'Fernanda Costa',  initials: 'FC', avColor: '3', level: 'Senior', sales: '17.640', meta: 88,  ticket: '104,00', status: 'Prog.'   },
        { name: 'Rafael Souza',    initials: 'RS', avColor: '4', level: 'Junior', sales: '14.210', meta: 82,  ticket: '87,40',  status: 'Prog.'   },
        { name: 'Mariana Lopes',   initials: 'ML', avColor: '5', level: 'Pleno',  sales: '12.890', meta: 76,  ticket: '93,10',  status: 'Atenção' },
        { name: 'Diego Ferreira',  initials: 'DF', avColor: '6', level: 'Junior', sales: '9.480',  meta: 61,  ticket: '72,80',  status: 'Atenção' },
      ],

      products: [
        { name: 'Condicionador Profissional 1L', category: 'Cabelos',    units: 482, revenue: '14.460', giroPerc: 90, giroDays: 7,  statusLabel: 'Hot',   tagClass: 'tag-green'  },
        { name: 'Shampoo Hidratante 500ml',      category: 'Cabelos',    units: 398, revenue: '9.950',  giroPerc: 80, giroDays: 10, statusLabel: 'Alto',  tagClass: 'tag-green'  },
        { name: 'Creme de Tratamento 300g',      category: 'Cabelos',    units: 341, revenue: '12.276', giroPerc: 72, giroDays: 12, statusLabel: 'Alto',  tagClass: 'tag-green'  },
        { name: 'Escova Titanium Pro',           category: 'Acessórios', units: 187, revenue: '18.700', giroPerc: 55, giroDays: 18, statusLabel: 'Médio', tagClass: 'tag-orange' },
        { name: 'Óleo Capilar Argan 60ml',       category: 'Cabelos',    units: 312, revenue: '8.424',  giroPerc: 68, giroDays: 14, statusLabel: 'Médio', tagClass: 'tag-orange' },
        { name: 'Kit Coloração Profissional',    category: 'Coloração',  units: 203, revenue: '15.225', giroPerc: 43, giroDays: 22, statusLabel: 'Médio', tagClass: 'tag-orange' },
      ],

      categories: [
        { name: 'Cabelos',     qty: 412, pct: 85, monthly: '18.240', color: ACCENT  },
        { name: 'Coloração',   qty: 187, pct: 65, monthly: '10.890', color: BLUE    },
        { name: 'Pele & Corpo',qty: 143, pct: 48, monthly: '7.620',  color: GREEN   },
        { name: 'Acessórios',  qty:  98, pct: 42, monthly: '5.480',  color: YELLOW  },
        { name: 'Perfumaria',  qty:  76, pct: 30, monthly: '3.340',  color: '#a78bfa'},
      ],

      suppliers: [
        { name: "L'Oréal Brasil",      cat: 'Cabelos · Coloração',     icon: '🏭', value: '38.240', items: 124, giro: 14, status: 'Ativo'   },
        { name: 'Wella Professionals', cat: 'Coloração · Tratamento',  icon: '🧴', value: '24.180', items: 87,  giro: 18, status: 'Ativo'   },
        { name: 'Truss Professional',  cat: 'Cabelos Profissional',    icon: '💊', value: '16.920', items: 62,  giro: 21, status: 'Regular' },
        { name: 'OX Cosméticos',       cat: 'Massa · Popular',         icon: '🪴', value: '11.340', items: 48,  giro: 9,  status: 'Ativo'   },
        { name: 'Nazca Cosméticos',    cat: 'Coloração',               icon: '🎨', value: '7.840',  items: 31,  giro: 28, status: 'Lento'   },
      ],

      inventoryAlerts: [
        { name: 'Máscara Capilar Wella 500g', desc: 'Restam 4 unidades · reposição urgente', tag: 'Crítico', color: RED,    icon: 'pi-exclamation-triangle' },
        { name: 'Escova Elétrica Gamma X1',   desc: 'Parado há 67 dias · sem saída',          tag: 'Parado',  color: YELLOW, icon: 'pi-pause-circle'          },
        { name: 'Kit Selagem 1L',             desc: '182 unidades · acima do limite',          tag: 'Excesso', color: BLUE,   icon: 'pi-arrow-up'              },
        { name: 'Óleo de Coco Puro 200ml',    desc: 'Restam 6 unidades · repor urgente',       tag: 'Baixo',   color: RED,    icon: 'pi-minus-circle'          },
        { name: 'Spray Finalizador 300ml',    desc: 'Parado há 54 dias',                        tag: 'Parado',  color: YELLOW, icon: 'pi-clock'                 },
      ],

      locations: [
        { name: 'Loja Central',        address: 'Av. Paulista, 1000',  sales: '128.430', leader: 'Cond. Profissional 1L', ticket: '69,72', trend: 11.4  },
        { name: 'Filial Norte',        address: 'Av. Brasil, 342',     sales: '89.210',  leader: 'Shampoo Hidratante',     ticket: '61,30', trend: 8.2   },
        { name: 'Filial Sul',          address: 'R. das Flores, 88',   sales: '64.870',  leader: 'Creme Tratamento',       ticket: '74,10', trend: -2.1  },
        { name: 'Quiosque Shopping A', address: 'Shopping Morumbi',    sales: '34.120',  leader: 'Óleo Argan',             ticket: '55,40', trend: 4.7   },
        { name: 'E-commerce',          address: 'Loja Virtual',        sales: '28.940',  leader: 'Kit Coloração',          ticket: '82,30', trend: 31.2  },
      ],

      peakProducts: [
        {
          hour: '11h – 13h', label: 'Pico manhã', total: '12.840',
          products: [
            { name: 'Condicionador Profissional 1L', pct: 34 },
            { name: 'Shampoo Hidratante 500ml',      pct: 22 },
            { name: 'Creme de Tratamento 300g',      pct: 17 },
          ]
        },
        {
          hour: '17h – 19h', label: 'Pico tarde', total: '18.230',
          products: [
            { name: 'Escova Titanium Pro',        pct: 28 },
            { name: 'Kit Coloração Profissional', pct: 24 },
            { name: 'Óleo Capilar Argan 60ml',    pct: 19 },
          ]
        },
      ],

      financialSummary: [
        { label: 'Receita Bruta',      value: 'R$ 128.430', color: ACCENT  },
        { label: 'Descontos',          value: '- R$ 11.280', color: RED    },
        { label: 'Devoluções',         value: '- R$ 3.420',  color: RED    },
        { label: 'Receita Líquida',    value: 'R$ 113.730',  color: GREEN  },
        { label: 'CMV',                value: 'R$ 74.180',   color: null   },
        { label: 'Lucro Bruto',        value: 'R$ 39.550',   color: GREEN  },
        { label: 'Margem Bruta',       value: '34,7%',        color: GREEN  },
        { label: 'Prazo Médio Venda',  value: '18,4 dias',   color: BLUE   },
      ],

      productAverages: [
        { name: 'Condicionador Profissional 1L', category: 'Cabelos',    daily: '16,1', weekly: '112',  monthly: '482',  avgDays: 7  },
        { name: 'Shampoo Hidratante 500ml',      category: 'Cabelos',    daily: '13,3', weekly: '93',   monthly: '398',  avgDays: 10 },
        { name: 'Creme de Tratamento 300g',      category: 'Cabelos',    daily: '11,4', weekly: '80',   monthly: '341',  avgDays: 12 },
        { name: 'Escova Titanium Pro',           category: 'Acessórios', daily: '6,2',  weekly: '43',   monthly: '187',  avgDays: 18 },
        { name: 'Kit Coloração Profissional',    category: 'Coloração',  daily: '6,8',  weekly: '48',   monthly: '203',  avgDays: 22 },
        { name: 'Perfume Floral 100ml',          category: 'Perfumaria', daily: '1,4',  weekly: '9',    monthly: '38',   avgDays: 42 },
      ],

      stockTabs: [
        { key: 'parados', label: 'Parados',   count: 3,  color: 'badge-yellow' },
        { key: 'baixo',   label: 'Baixo Est.',count: 7,  color: 'badge-red'    },
        { key: 'excesso', label: 'Excesso',   count: 5,  color: 'badge-blue'   },
      ],

      stockLists: {
        parados: [
          { name: 'Escova Elétrica Gamma X1',   category: 'Acessórios', stock: 14,  ref: 'Min: —',   detail: 'Parado há 67 dias',   tag: 'Ação Urgente' },
          { name: 'Perfume Floral 100ml',        category: 'Perfumaria', stock: 22,  ref: 'Min: —',   detail: 'Parado há 54 dias',   tag: 'Promover'     },
          { name: 'Spray Fixador Extra Forte',   category: 'Cabelos',    stock: 8,   ref: 'Min: —',   detail: 'Parado há 48 dias',   tag: 'Revisar'      },
        ],
        baixo: [
          { name: 'Máscara Capilar Wella 500g',  category: 'Cabelos',    stock: 4,   ref: 'Min: 20',  detail: '↓ 80% abaixo min',   tag: 'Repor Já'    },
          { name: 'Óleo de Coco Puro 200ml',     category: 'Cabelos',    stock: 6,   ref: 'Min: 15',  detail: '↓ 60% abaixo min',   tag: 'Repor Já'    },
          { name: 'Shampoo Antiqueda 400ml',     category: 'Cabelos',    stock: 9,   ref: 'Min: 25',  detail: '↓ 64% abaixo min',   tag: 'Crítico'     },
          { name: 'Condicionador Liso 300ml',    category: 'Cabelos',    stock: 11,  ref: 'Min: 20',  detail: '↓ 45% abaixo min',   tag: 'Baixo'       },
          { name: 'Tônico Capilar 150ml',        category: 'Cabelos',    stock: 3,   ref: 'Min: 10',  detail: '↓ 70% abaixo min',   tag: 'Crítico'     },
        ],
        excesso: [
          { name: 'Kit Selagem 1L',              category: 'Tratamento', stock: 182, ref: 'Max: 80',  detail: '↑ 127% acima max',   tag: 'Excesso'     },
          { name: 'Relaxamento Kit Pro',         category: 'Química',    stock: 94,  ref: 'Max: 40',  detail: '↑ 135% acima max',   tag: 'Excesso'     },
          { name: 'Botox Capilar 250g',          category: 'Tratamento', stock: 71,  ref: 'Max: 30',  detail: '↑ 137% acima max',   tag: 'Excesso'     },
          { name: 'Máscara Hidratação 1kg',      category: 'Cabelos',    stock: 65,  ref: 'Max: 35',  detail: '↑ 86% acima max',    tag: 'Excesso'     },
          { name: 'Shampoo Low Poo 500ml',       category: 'Cabelos',    stock: 58,  ref: 'Max: 30',  detail: '↑ 93% acima max',    tag: 'Excesso'     },
        ],
      },

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

      // ── Chart data ──
      evolutionData: {
        labels: ['01','03','05','07','09','11','13','15','17','19','21','23','25','27','29','31'],
        datasets: [
          {
            label: 'Venda Bruta',
            data: [3200,4100,3800,5200,4800,6100,5400,7200,6800,8100,7400,9200,8600,10100,9800,11200],
            borderColor: ACCENT, backgroundColor: ACCENT + '22',
            fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2,
          },
          {
            label: 'Venda Líquida',
            data: [2800,3600,3400,4600,4200,5400,4800,6400,6000,7200,6600,8200,7600,8900,8700,9900],
            borderColor: GREEN, backgroundColor: GREEN + '18',
            fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2,
          },
        ],
      },

      hourlyData: {
        labels: ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h'],
        datasets: [{
          label: 'Vendas',
          data: [1200,2100,3400,4800,5200,4100,2900,2800,3600,5800,6200,4200,1800],
          backgroundColor: (ctx) => {
            const v = ctx.parsed?.y ?? 0;
            return v >= 5000 ? ACCENT : v >= 3500 ? ACCENT + '80' : ACCENT + '30';
          },
          borderRadius: 4, borderSkipped: false,
        }],
      },

      categoryData: {
        labels: ['Cabelos','Coloração','Pele & Corpo','Acessórios','Perfumaria'],
        datasets: [{
          data: [412, 187, 143, 98, 76],
          backgroundColor: [ACCENT, BLUE, GREEN, YELLOW, '#a78bfa'],
          borderWidth: 0, hoverOffset: 4,
        }],
      },

      stockTimeData: {
        labels: ['Perfumaria','Coloração','Pele & Corpo','Acessórios','Cabelos'],
        datasets: [{
          label: 'Dias',
          data: [42, 31, 24, 19, 7],
          backgroundColor: [RED+'90', YELLOW+'90', BLUE+'70', ACCENT+'70', GREEN+'90'],
          borderRadius: 4, borderSkipped: false,
        }],
      },

      monthlyData: {
        labels: ['Out','Nov','Dez','Jan','Fev','Mar'],
        datasets: [
          {
            label: 'Bruta',
            data: [98400, 112300, 134800, 108200, 115600, 128430],
            backgroundColor: ACCENT + '55', borderColor: ACCENT,
            borderWidth: 1.5, borderRadius: 5, borderSkipped: false,
          },
          {
            label: 'Líquida',
            data: [86200, 98700, 118400, 95100, 101800, 113730],
            backgroundColor: GREEN + '40', borderColor: GREEN,
            borderWidth: 1.5, borderRadius: 5, borderSkipped: false,
          },
        ],
      },

      // ── Chart options ──
      lineOptions: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip, callbacks: { label: ctx => ` R$ ${ctx.parsed.y.toLocaleString('pt-BR')}` } },
        },
        scales: {
          ...baseScales,
          y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, callback: v => 'R$' + (v/1000).toFixed(0) + 'k' } },
        },
      },

      barOptions: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip, callbacks: { label: ctx => ` R$ ${ctx.parsed.y.toLocaleString('pt-BR')}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 11 } } },
          y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, callback: v => 'R$' + (v/1000).toFixed(0) + 'k' } },
        },
      },

      donutOptions: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip },
        },
      },

      hBarOptions: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...baseTooltip, callbacks: { label: ctx => ` ${ctx.parsed.x} dias` } },
        },
        scales: {
          x: { ...baseScales.x, ticks: { ...baseScales.x.ticks, callback: v => v + 'd' } },
          y: { grid: { display: false }, ticks: { color: TEXT, font: { size: 11 } } },
        },
      },

      monthlyOptions: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true, position: 'bottom',
            labels: { color: TEXT, font: { size: 11 }, padding: 14, boxWidth: 10, boxHeight: 10 },
          },
          tooltip: { ...baseTooltip, callbacks: { label: ctx => ` ${ctx.dataset.label}: R$ ${(ctx.parsed.y/1000).toFixed(1)}k` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 11 } } },
          y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, callback: v => 'R$' + (v/1000).toFixed(0) + 'k' } },
        },
      },
    };
  },

  computed: {
    currentKpis() {
      return this.kpisByPeriod[this.activePeriod];
    },
    currentStockList() {
      return this.stockLists[this.activeStockTab];
    },
    stockTabColor() {
      return { parados: YELLOW, baixo: RED, excesso: BLUE }[this.activeStockTab];
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════════════
   TOKENS
══════════════════════════════════════════════ */
.dashboard-root {
  /* --- PALETA DE CORES (MODO CLARO) --- */
  --accent:   #FF8049;           /* Laranja Principal */
  --accent2:  #FF804915;         /* Laranja Soft (mais opaco no claro) */
  --acc-h:    #E65D26;           /* Laranja Hover (mais escuro) */
  
  --green:    #16a34a;           /* Verde Sucesso (ajustado para leitura no branco) */
  --green2:   #dcfce7;           /* Verde Fundo */
  
  --blue:     #2563eb;           /* Azul Info */
  --blue2:    #dbeafe;           /* Azul Fundo */
  
  --yellow:   #ca8a04;           /* Amarelo Atenção */
  --yellow2:  #fef9c3;           /* Amarelo Fundo */
  
  --red:      #dc2626;           /* Vermelho Alerta */
  --red2:     #fee2e2;           /* Vermelho Fundo */

  /* --- ESTRUTURA E FUNDOS --- */
  --bg:       #f8f9fa;           /* Fundo da aplicação (Cinza muito claro) */
  --bg-card:  #ffffff;           /* Fundo dos Cartões (Branco puro) */
  --bg-el:    #f1f3f5;           /* Elementos secundários (inputs/hovers) */
  --bg-el2:   #e9ecef;           /* Elementos de destaque/divisores */
  
  /* --- BORDAS E TEXTOS --- */
  --border:   #e2e8f0;           /* Bordas suaves */
  --border2:  #cbd5e1;           /* Bordas de foco/divisores */
  
  --text1:    #1e293b;           /* Texto Principal (Azul escuro quase preto) */
  --text2:    #64748b;           /* Texto Secundário (Cinza azulado) */
  --muted:    #94a3b8;           /* Texto desativado/placeholder */

  /* --- EFEITOS --- */
  --radius:   13px;
  --radius-s: 8px;
  --shadow:   0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);

  /* --- LAYOUT --- */
  display: flex;
  background: var(--bg);
  color: var(--text1);
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  font-size: 13.5px;
  min-height: 100vh;
}

/* Ajuste específico para a Barra de Alerta no modo claro */
.alert-bar {
  background: var(--bg-card);
  border: 1px solid var(--accent2);
  color: var(--text1);
  box-shadow: var(--shadow);
}

/* Ajuste nos Cards de KPI para não ficarem "chapados" */
.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

/* Ajuste nas Tabelas (DataTable do PrimeVue) */
.dt-custom :deep(.p-datatable-thead > tr > th) {
  background: var(--bg-el);
  color: var(--text2);
  border-bottom: 2px solid var(--border);
}

.dt-custom :deep(.p-datatable-tbody > tr) {
  background: var(--bg-card);
  color: var(--text1);
  border-bottom: 1px solid var(--border);
}

/* Chips e Tabs */
.chip, .stab {
  background: var(--bg-el);
  color: var(--text2);
  border: 1px solid var(--border);
}

.chip.active, .stab.active {
  background: var(--accent2);
  color: var(--accent);
  border-color: var(--accent);
}

/* ══ SIDEBAR ══ */
.sidebar {
  width: 224px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 18px 18px;
  border-bottom: 1px solid var(--border);
}
.brand-icon {
  width: 32px; height: 32px;
  background: var(--accent);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; color: #fff;
  flex-shrink: 0;
}
.brand-name { font-weight: 700; font-size: 15px; letter-spacing: -0.3px; }
.brand-sub  { font-size: 10px; color: var(--muted); margin-top: 1px; letter-spacing: 0.4px; }

.nav-section { padding: 14px 10px 4px; }
.nav-label {
  font-size: 9.5px; font-weight: 700; letter-spacing: 1.4px;
  text-transform: uppercase; color: var(--muted);
  padding: 0 8px; margin-bottom: 4px;
}
.nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; border-radius: var(--radius-s);
  cursor: pointer; color: var(--text2); font-size: 12.5px;
  margin-bottom: 2px; transition: all 0.15s;
}
.nav-item:hover { background: var(--bg-el); color: var(--text1); }
.nav-item.active { background: var(--accent2); color: var(--accent); font-weight: 500; }
.nav-item i { font-size: 13px; width: 17px; text-align: center; }
.nav-badge {
  margin-left: auto; background: var(--accent); color: #fff;
  font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 20px;
}
.sidebar-footer { margin-top: auto; padding: 14px 10px; border-top: 1px solid var(--border); }
.store-chip {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-el); border: 1px solid var(--border2);
  border-radius: var(--radius-s); padding: 9px 11px; cursor: pointer;
}
.store-dot { width: 7px; height: 7px; background: var(--green); border-radius: 50%; flex-shrink: 0; }
.store-name   { font-size: 12px; font-weight: 500; }
.store-status { font-size: 10px; color: var(--muted); margin-top: 1px; }
.store-info { flex: 1; }

/* ══ MAIN ══ */
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column;  }

/* ══ TOPBAR ══ */
.topbar {
  position: sticky; top: 0; z-index: 50;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 13px 24px;
  display: flex; align-items: center; gap: 14px;
  backdrop-filter: blur(12px);
}
.topbar-title { font-weight: 700; font-size: 17px; letter-spacing: -0.4px; }
.topbar-sub   { font-size: 11.5px; color: var(--muted); margin-top: 1px; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 9px; }
.period-tabs {
  display: flex; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius-s); padding: 3px; gap: 2px;
}
.ptab {
  padding: 5px 11px; border-radius: 5px; font-size: 12px; font-weight: 500;
  cursor: pointer; color: var(--muted); transition: all 0.15s;
  background: transparent; border: none; font-family: inherit;
}
.ptab.active { background: var(--accent); color: #fff; }
.tbtn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 13px; border-radius: var(--radius-s);
  border: 1px solid var(--border2); background: var(--bg-card);
  color: var(--text2); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.tbtn:hover { background: var(--bg-el); color: var(--text1); }
.tbtn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.tbtn.primary:hover { background: var(--acc-h); }
.user-avatar {
  width: 31px; height: 31px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ff4d4d);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 11px; color: #fff; flex-shrink: 0;
}

/* ══ CONTENT ══ */
.content { padding: 22px 24px; flex: 1; }

/* ══ ALERT BAR ══ */
.alert-bar {
  display: flex; align-items: center; gap: 10px;
  background: #FFF; border: 1px solid #ff804340;
  border-radius: var(--radius); padding: 11px 15px;
  font-size: 12.5px; margin-bottom: 20px;
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
  position: relative; overflow: hidden; transition: border-color 0.2s;
}
.kpi-card:hover { border-color: var(--border2); }
.kpi-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
}
.kpi-card.k-orange::before { background: linear-gradient(90deg, var(--accent), transparent); }
.kpi-card.k-green::before  { background: linear-gradient(90deg, var(--green),  transparent); }
.kpi-card.k-blue::before   { background: linear-gradient(90deg, var(--blue),   transparent); }
.kpi-card.k-yellow::before { background: linear-gradient(90deg, var(--yellow), transparent); }

.kpi-label {
  font-size: 10.5px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.7px; color: var(--muted);
  display: flex; align-items: center; gap: 5px; margin-bottom: 9px;
}
.kpi-value {
  font-size: 25px; font-weight: 800; letter-spacing: -0.8px;
  color: var(--text1); line-height: 1; margin-bottom: 9px;
}
.kpi-prefix { font-size: 13px; font-weight: 600; letter-spacing: 0; }
.kpi-footer { display: flex; align-items: center; gap: 6px; font-size: 11.5px; }
.kpi-delta  { font-weight: 700; display: flex; align-items: center; gap: 3px; }
.kpi-delta.up   { color: var(--green); }
.kpi-delta.down { color: var(--red);   }
.kpi-sub { color: var(--muted); }
.kpi-bg-icon {
  position: absolute; bottom: 4px; right: 10px;
  font-size: 48px; opacity: 0.06; color: var(--text1);
  pointer-events: none; line-height: 1;
}

/* ══ KPI MINI ══ */
.kpi-mini-grid {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 13px; margin-bottom: 16px;
}
.kpi-mini {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 13px 15px;
}
.kpi-mini-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--muted); margin-bottom: 5px; }
.kpi-mini-value { font-size: 18px; font-weight: 800; letter-spacing: -0.4px; color: var(--text1); }
.kpi-mini-sub   { font-size: 10.5px; color: var(--muted); margin-top: 3px; display: flex; align-items: center; gap: 5px;}

/* ══ GRID LAYOUTS ══ */
.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 14px; }
.grid-1-2 { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; margin-bottom: 14px; }
.grid-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.grid-3   { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }

/* ══ CARD ══ */
.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px 13px; border-bottom: 1px solid var(--border);
}
.card-title { font-size: 13px; font-weight: 700; letter-spacing: -0.2px; }
.card-sub   { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.card-actions { margin-left: auto; display: flex; gap: 6px; align-items: center; }
.card-icon {
  width: 29px; height: 29px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px !important; flex-shrink: 0;
}

.card-icon .material-symbols-outlined {
  font-size: 18px !important; /* 8px é extremamente pequeno, quase invisível. 18px fica bom em um card de 29px */
  display: block;
  width: auto;
  height: auto;
}

.c-orange { background: var(--accent2); color: var(--accent); }
.c-green  { background: var(--green2);  color: var(--green);  }
.c-blue   { background: var(--blue2);   color: var(--blue);   }
.c-yellow { background: var(--yellow2); color: var(--yellow); }
.c-red    { background: var(--red2);    color: var(--red);    }

.chip {
  padding: 3px 9px; border-radius: 20px; font-size: 11px;
  background: var(--bg-el2); border: 1px solid var(--border); color: var(--muted); cursor: pointer;
}
.chip.active { background: var(--accent2); border-color: var(--accent); color: var(--accent); }

/* ══ CHART ══ */
.chart-wrap { position: relative; }
.h220 { height: 220px; padding: 14px 18px; }
.h180 { height: 180px; padding: 14px 18px; }
.h250 { height: 250px; padding: 14px 18px; }

/* ══ DATATABLE ══ */
:deep(.dt-custom.p-datatable) { background: transparent; }
:deep(.dt-custom .p-datatable-thead > tr > th) {
  background: transparent; border-bottom: 1px solid var(--border) !important;
  color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: 0.7px;
  text-transform: uppercase; padding: 9px 14px;
}
:deep(.dt-custom .p-datatable-tbody > tr > td) {
  background: transparent; border-bottom: 1px solid var(--border) !important;
  color: var(--text1); padding: 10px 14px; font-size: 12.5px;
}
:deep(.dt-custom .p-datatable-tbody > tr:last-child > td) { border-bottom: none !important; }
:deep(.dt-custom .p-datatable-tbody > tr:hover > td) { background: var(--bg-el) !important; }

.rank-num        { font-weight: 800; font-size: 12px; color: var(--muted); display: inline-block; width: 20px; text-align: center; }
.rank-num.gold   { color: #fbbf24; }
.rank-num.silver { color: #94a3b8; }
.rank-num.bronze { color: #cd7f32; }

.user-cell   { display: flex; align-items: center; gap: 9px; }
.cell-name   { font-weight: 500; font-size: 12.5px; }
.cell-sub    { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.mono-bold   { font-weight: 700; }

/* Avatars */
:deep(.av.p-avatar) { width: 28px; height: 28px; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; }
:deep(.av-1.p-avatar) { background: linear-gradient(135deg, #FF8049, #ff4d4d); }
:deep(.av-2.p-avatar) { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
:deep(.av-3.p-avatar) { background: linear-gradient(135deg, #3ecf8e, #059669); }
:deep(.av-4.p-avatar) { background: linear-gradient(135deg, #fbbf24, #d97706); }
:deep(.av-5.p-avatar) { background: linear-gradient(135deg, #a78bfa, #7c3aed); }
:deep(.av-6.p-avatar) { background: linear-gradient(135deg, #f472b6, #db2777); }

/* Progress bars */
.meta-cell { display: flex; align-items: center; gap: 6px; }
.meta-pct  { font-size: 10.5px; color: var(--muted); width: 28px; }
:deep(.pb-custom.p-progressbar) { height: 5px; border-radius: 4px; background: var(--bg-el2); }
:deep(.pb-orange.p-progressbar .p-progressbar-value) { background: var(--accent); }
:deep(.pb-green.p-progressbar .p-progressbar-value)  { background: var(--green);  }
:deep(.pb-dyn.p-progressbar .p-progressbar-value)    { background: var(--pb-color, var(--accent)); }

/* Tags */
:deep(.tag-custom.p-tag) { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
:deep(.tag-green.p-tag)  { background: var(--green2) !important;  color: var(--green)  !important; }
:deep(.tag-orange.p-tag) { background: var(--accent2) !important; color: var(--accent) !important; }
:deep(.tag-red.p-tag)    { background: var(--red2) !important;    color: var(--red)    !important; }
:deep(.tag-yellow.p-tag) { background: var(--yellow2) !important; color: var(--yellow) !important; }
:deep(.tag-blue.p-tag)   { background: var(--blue2) !important;   color: var(--blue)   !important; }

/* SelectButton */
:deep(.sb-custom .p-selectbutton .p-button) {
  background: var(--bg-el2); border: 1px solid var(--border); color: var(--muted);
  font-size: 11px; padding: 4px 10px; border-radius: 5px !important;
}
:deep(.sb-custom .p-selectbutton .p-button.p-highlight) {
  background: var(--accent2) !important; border-color: var(--accent) !important; color: var(--accent) !important;
}

/* ══ CATEGORIES ══ */
.donut-wrap { height: 130px; padding: 10px 18px 6px; }
.cat-list   { padding: 0 18px 14px; }
.cat-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 0; border-bottom: 1px solid var(--border);
}
.cat-item:last-child { border-bottom: none; }
.cat-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.cat-name { font-size: 12.5px; font-weight: 500; flex: 1; }
.cat-qty  { font-size: 11px; color: var(--muted); width: 44px; text-align: right; }
.pb-wrap-sm { flex: 1; }
.cat-val  { font-size: 12px; font-weight: 700; white-space: nowrap; }
.cat-per  { font-size: 9.5px; color: var(--muted); }

/* ══ SUPPLIERS ══ */
.supplier-list { padding: 0 18px 14px; }
.supplier-row {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 0; border-bottom: 1px solid var(--border);
}
.supplier-row:last-child { border-bottom: none; }
.sup-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--bg-el2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.sup-name   { font-size: 12.5px; font-weight: 500; }
.sup-cat    { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.sup-info   { flex: 1; }
.sup-stats  { text-align: right; }
.sup-value  { font-weight: 700; font-size: 13px; }
.sup-detail { font-size: 10.5px; color: var(--muted); }

/* ══ ALERTS ══ */
.alert-boxes { display: flex; gap: 8px; padding: 14px 18px 10px; }
.abox {
  flex: 1; border-radius: 8px; padding: 10px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1px solid transparent;
}
.abox.red    { background: var(--red2);    border-color: var(--red) + '40';    }
.abox.yellow { background: var(--yellow2); border-color: var(--yellow) + '40'; }
.abox.blue   { background: var(--blue2);   border-color: var(--blue) + '40';   }
.abox-num  { font-size: 20px; font-weight: 800; line-height: 1; }
.abox.red    .abox-num  { color: var(--red);    }
.abox.yellow .abox-num  { color: var(--yellow); }
.abox.blue   .abox-num  { color: var(--blue);   }
.abox-lbl  { font-size: 9.5px; color: var(--muted); margin-top: 2px; }
.alert-list { padding: 0 18px 14px; }
.alert-item {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 10px 0; border-bottom: 1px solid var(--border);
}
.alert-item:last-child { border-bottom: none; }
.alert-icon { font-size: 13px; margin-top: 1px; flex-shrink: 0; }
.alert-name { font-size: 12.5px; font-weight: 500; }
.alert-desc { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.alert-info { flex: 1; }

/* ══ HEATMAP ══ */
.heatmap-wrap { padding: 12px 18px; }
.heatmap-grid {
  display: grid;
  grid-template-columns: 34px repeat(7, 1fr);
  gap: 3px;
}
.hm-day  { text-align: center; font-size: 10px; font-weight: 700; color: var(--muted); padding-bottom: 4px; }
.hm-hour { display: flex; align-items: center; justify-content: flex-end; padding-right: 5px; font-size: 9.5px; color: var(--muted); }
.hm-cell {
  height: 24px; border-radius: 4px;
  cursor: default; transition: transform 0.1s;
}
.hm-cell:hover { transform: scale(1.1); }
.h0 { background: var(--bg-el2); }
.h1 { background: #ff804918; }
.h2 { background: #ff804935; }
.h3 { background: #ff804955; }
.h4 { background: #ff804978; }
.h5 { background: var(--accent); }
.hm-legend {
  display: flex; align-items: center; gap: 4px;
  justify-content: flex-end; margin-top: 8px;
}
.hm-leg-lbl { font-size: 10px; color: var(--muted); }

/* PEAK SECTION */
.peak-section { padding: 0 18px 14px; border-top: 1px solid var(--border); }
.peak-block { margin-top: 12px; }
.peak-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 7px;
}
.peak-hour  {
  background: var(--bg-el2); border: 1px solid var(--border);
  border-radius: 5px; padding: 3px 8px;
  font-size: 11px; font-weight: 700; color: var(--accent);
}
.peak-label { font-size: 11px; color: var(--muted); flex: 1; }
.peak-total { font-size: 12px; font-weight: 700; }
.peak-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.peak-pname { font-size: 11.5px; color: var(--text2); width: 175px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.peak-pct   { font-size: 10.5px; color: var(--muted); width: 28px; text-align: right; }

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

/* ══ FINANCIAL SUMMARY ══ */
.fin-list { padding: 6px 18px 14px; }
.fin-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 12.5px;
}
.fin-row:last-child { border-bottom: none; }
.fin-label { color: var(--text2); }
.fin-value { font-weight: 700; }

/* ══ STOCK TABS ══ */
.tab-group { display: flex; gap: 4px; }
.stab {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: var(--radius-s);
  background: var(--bg-el2); border: 1px solid var(--border);
  color: var(--muted); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.stab.active { border-color: var(--accent); color: var(--accent); background: var(--accent2); }
.stab-badge {
  font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 10px; color: #fff;
}
.badge-yellow { background: var(--yellow); }
.badge-red    { background: var(--red);    }
.badge-blue   { background: var(--blue);   }

/* ══ FOOTER ══ */
.dash-footer {
  padding: 14px 24px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--muted);
}

/* Container Geral - O segredo é o max-width e overflow hidden */
.news-banner-container {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* Garante que nada saia daqui */
}

/* Forçar o Carousel a respeitar o container pai */
:deep(.p-carousel) {
  width: 100%;
}

:deep(.p-carousel-content) {
  overflow: hidden;
}

/* Slide Interno */
.news-slide {
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
  color: white;
  border-radius: 16px;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0 4px; /* Pequeno respiro entre os slides se houver mais de um visível */
}

/* Ajuste das Bolinhas (Indicadores) */
:deep(.p-carousel-indicators) {
  padding: 1rem 0;
  justify-content: center;
  gap: 10px;
  list-style: none; /* Remove pontos de lista indesejados */
}

/* Reset do botão padrão do PrimeVue para as bolinhas */
:deep(.p-carousel-indicator button) {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1; /* Garante que a cor apareça */
}

/* Bolinha Ativa preenchida com #FF8049 */
:deep(.p-carousel-indicator.p-highlight button) {
  background-color: #FF8049 !important;
  width: 30px !important; /* Efeito pílula */
  border-radius: 6px !important;
}

/* Variações de Cores (Gradientes) */
.bg-orange { background: linear-gradient(135deg, #FF8049 0%, #E65D26 100%); }
.bg-dark   { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
.bg-blue   { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); }
.bg-green  { background: linear-gradient(135deg, #10b981 0%, #064e3b 100%); }

/* Conteúdo */
.news-body {
  position: relative;
  z-index: 2;
  transform: translateX(40px);
  max-width: 65%;
}

.news-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  padding: 5px 12px;
  border-radius: 50px;
  margin-bottom: 1rem;
}

.news-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.news-text {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.news-btn {
  background: #ffffff;
  color: #1e293b;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* Ícone de Fundo */
.news-bg-icon {
  position: absolute;
  right: -5%;
  bottom: -15%;
  z-index: 1;
  opacity: 0.1;
  pointer-events: none;
}

.news-bg-icon span {
  font-size: 200px !important;
}

.news-footer{
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Responsividade */
@media (max-width: 768px) {
  .news-slide {
    padding: 1.5rem;
    min-height: 300px;
  }
  .news-body {
    max-width: 100%;
  }
  .news-title {
    font-size: 1.5rem;
  }
  .news-bg-icon span {
    font-size: 120px !important;
  }
}
</style>