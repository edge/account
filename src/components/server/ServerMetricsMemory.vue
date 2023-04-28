<template>
  <div class="box">
    <h4 class="text-sm">Memory Usage <span class="ml-1 text-gray">last 24 hrs</span></h4>
    <LineChart
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
  name: 'ServerMetricsMemory',
  props: ['data', 'server'],
  components: {
    LineChart
  },
  computed: {
    dataAsPercent() {
      return this.data.map(([t, v]) => [t, 100 * (1 - v / (this.server.spec.ram * 1e6))])
    },
    timeSeries() {
      const dates = this.data.map(([t]) => new Date(t * 1000))
      return dates.map(d => `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`)
    },
    chartData() {
      return {
        labels: this.timeSeries,
        datasets: [{
          data: this.dataAsPercent.map(([, v]) => v),
          fill: true,
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
            min: 0,
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
      return { value: yValue, unit: '%' }
    }
  }
}
</script>

<style scoped>

</style>
