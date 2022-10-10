<template>
  <div class="box">
    <h4>Cache</h4>
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
        datasets: [
          {
            data: this.metrics.cr,
            label: 'Requests',
            fill: false,
            backgroundColor: 'rgba(110,224,159)',
            borderColor: 'rgb(14, 204, 95)',
            borderWidth: 2,
            spanGaps: true,
            stepped: false,
            pointRadius: 0,
            tension: 0.2
          },
          {
            data: this.metrics.ct,
            label: 'Traffic',
            fill: false,
            backgroundColor: 'rgb(255, 138, 138)',
            borderColor: 'rgb(220, 60, 60)',
            borderWidth: 2,
            spanGaps: true,
            stepped: false,
            pointRadius: 0,
            tension: 0.2
          }
        ]
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
                label: tooltipItem => `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(1)} %`
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
            suggestedMax: 100,
            ticks: {
              callback: (tickValue) => `${tickValue} %`
            },
            grid: {
              display: false
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
