<template>
  <LineChart v-if="chartData" :chartData="chartData" :options="options" />
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
    minScale: Number,
    maxScale: Number,
    labels: Array,
    postpendValue: String,
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
      // cubicInterpolationMode: 'monotone',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          intersect: false,
          interaction: {
            intersect: false
          }
        }
      },
      scales: {
        x: {
          // grid: {display: false},
          title: {
            display: true,
            text: this.xLabel
          }
        },
        y: {
          // grid: {display: false},
          suggestedMin: this.minScale,
          suggestedMax: this.maxScale,
          title: {
            display: true,
            text: this.yLabel
          }
          // ticks: {
          //   callback: function(value, index, ticks) {
          //     return value + this.postpendValue
          //   }
          // }
        }
      }
    }
  }
}
</script>
