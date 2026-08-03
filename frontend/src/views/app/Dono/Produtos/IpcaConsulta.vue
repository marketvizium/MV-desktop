<template>
  <div class="totalPage">
    <!-- TOPO -->
    <div class="top-bar">
      <Calendar
        v-model="periodoSelecionado"
        view="month"
        dateFormat="mm/yy"
        placeholder="Selecionar período"
        class="calendar-custom"
      />

      <Button
        label="Buscar"
        icon="pi pi-search"
        class="btn-sbmt"
        @click="buscarIPCA"
      />
    </div>

    <!-- GRÁFICO -->
    <div class="chart-container">
      <canvas ref="ipcaChart"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto'
import Calendar from 'primevue/calendar'
import { Button } from 'primevue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'FornecedoresPage',

  components: {
    Calendar,
    Button
  },

  data () {
    return {
      chart: null,
      auth: null,
      periodoSelecionado: null
    }
  },

  methods: {
    formatarPeriodo (date) {
      const ano = date.getFullYear()
      const mes = String(date.getMonth() + 1).padStart(2, '0')
      return `${ano}${mes}`
    },

    async buscarIPCA () {
      let periodo = null

      if (this.periodoSelecionado) {
        periodo = this.formatarPeriodo(this.periodoSelecionado)
      }

      const auth = useAuthStore()

      const response = await api.get(
        `/mvpu/produto/consultarIPCA/${auth.id_loja}`
      )

      const dados = response.data.data

      // Ordena do mais antigo → mais recente
      dados.sort((a, b) => a.atualizado_em.localeCompare(b.atualizado_em))

      const labels = dados.map(item =>
        `${item.atualizado_em.slice(4, 6)}/${item.atualizado_em.slice(0, 4)}`
      )

      const valores = dados.map(item => item.aliquota)

      this.renderChart(labels, valores)
    },

    renderChart (labels, valores) {
      if (this.chart) {
        this.chart.destroy()
      }

      this.chart = new Chart(this.$refs.ipcaChart, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'IPCA (%)',
              data: valores,

              /* 🔥 ESTILO DA LINHA */
              borderColor: '#FF8049',
              backgroundColor: '#FF8049',
              fill: false,
              tension: 0.1,
              borderWidth: 3,

              /* 🔥 PONTOS */
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: '#FF8049',
              pointBorderColor: '#FF8049'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.raw}%`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => `${value}%`
              }
            }
          }
        }
      })
    }
  },

  mounted () {
    // 🚀 Primeira carga automática
    this.buscarIPCA()
  }
}
</script>

<style scoped>
.totalPage {
  width: 100%;
  height: 100vh;
  padding: 20px;
}

.top-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 80%;
}

:deep(.calendar-custom .p-inputtext) {
  height: 40px;
}
</style>
