<template>
  <div class="box">
    <h4 class="text-sm">Network <span class="ml-1 text-gray">last 24 hrs</span></h4>
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
  name: 'ServerMetricsNet',
  props: ['bwin', 'bwout'],
  components: {
    LineChart
  },
  computed: {
    timeSeries() {
      const dates = this.bwin.map(([t]) => new Date(t * 1000))
      return dates.map(d => `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`)
    },
    chartData() {
      return {
        labels: this.timeSeries,
        datasets: [
          this.bwout && {
            data: this.bwout.map(([, v]) => v),
            fill: true,
            backgroundColor: 'rgb(255,138,138)',
            borderColor: 'rgb(220, 60, 60)',
            borderWidth: 2,
            label: 'Data Out',
            spanGaps: true,
            stepped: false,
            pointRadius: 0,
            tension: 0.2
          },
          this.bwin && {
            data: this.bwin.map(([, v]) => v),
            fill: true,
            backgroundColor: 'rgba(110,224,159)',
            borderColor: 'rgb(14, 204, 95)',
            borderWidth: 2,
            label: 'Data In',
            spanGaps: true,
            stepped: false,
            pointRadius: 0,
            tension: 0.2
          },
          this.bwin && this.bwout && {
            data: this.bwin.map(([, v], i) => v + this.bwout[i][1]),
            fill: false,
            backgroundColor: 'rgba(128,128,128)',
            borderColor: 'rgb(96, 96, 96)',
            borderDash: [6, 14],
            borderWidth: 2,
            label: 'Total',
            spanGaps: true,
            stepped: false,
            pointRadius: 0,
            tension: 0.2
          }
        ].filter(Boolean)
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
                  return `${tooltipItem.dataset.label} ${value.toFixed(1)} ${unit}`
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