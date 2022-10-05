<template>
  <div class="box">
    <h4>Traffic</h4>
    <LineChart
      v-if="chartData"
      :chartData="chartData"
      :options="options"
      :height="300"
    />
  </div>
</template>

<script>
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'IntegrationMetricsTraffic',
  props: ['metrics', 'timeSeries'],
  components: {
    LineChart
  },
  computed: {
    chartData() {
      return {
        labels: this.timeSeries,
        datasets: [{
          data: this.metrics.t.map(t => t / 1000),
          fill: false,
          backgroundColor: 'rgba(110,224,159)',
          borderColor: 'rgb(14, 204, 95)',
          borderWidth: 2,
          spanGaps: true,
          stepped: false,
          pointRadius: 0,
          tension: 0.2
        }]
      }
    },
    options() {
      return {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            interaction: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: tooltipItem =>  {
                  const { value, unit } = this.formatYScale(tooltipItem.raw)
                  return `${value.toFixed(1)} ${unit}`
                }
              }
            },
            hover: {
              mode: 'index',
              intersect: false
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            suggestedMin: 0,
            ticks: {
              callback: (tickValue) => {
                const { value, unit } = this.formatYScale(tickValue)
                return `${value} ${unit}`
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    }
  },
  methods: {
    formatYScale(yValue) {
      const units = ['KB', 'MB', 'GB', 'TB']
      let value = yValue
      let count = 0
      while (value >= 1000) {
        value = value / 1000
        count++
      }
      return {
        value,
        unit: units[count]
      }
    }
  }
}
</script>

<style scoped>

</style>
