<template>
  <LineChart
    v-if="chartData"
    :chartData="chartData"
    :options="options"
    :height="300"
  />
</template>

<script>
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'Line',
  components: { LineChart },
  props: {
    data: Object,
    labels: Array,
    minScale: Number,
    maxScale: Number,
    unit: String,
    xLabel: String,
    yLabel: String
  },
  data() {
    return {
      chartData: null,
      options: null
    }
  },
  mounted() {
    this.chartData = {
      labels: this.labels,
      datasets: [{
        data: this.data,
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

    this.options = {
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
              label: tooltipItem => ` ${tooltipItem.raw.toFixed(2)} ${this.unit}`
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
          title: {
            display: true,
            text: this.xLabel
          }
        },
        y: {
          suggestedMin: this.minScale,
          suggestedMax: this.maxScale,
          title: {
            display: true,
            text: this.yLabel
          },
          ticks: {
            callback: (tickValue) => this.unit === '%' ? tickValue : tickValue.toFixed(1)
          }
        }
      }
    }
  }
}
</script>
