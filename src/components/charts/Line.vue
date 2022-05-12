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
    period: String,
    postpendValue: String
  },
  data() {
    return {
      chartData: null,
      options: null
    }
  },
  mounted() {
    const data = JSON.parse(JSON.stringify(this.data))
    let postpendValue = ''

    if (this.postpendValue) {
      postpendValue = this.postpendValue
    }

    this.chartData = {
      labels: data.map(point => {
        if (this.period === 'day') {
          return new Date(point[1] * 1000).toLocaleTimeString('en-us', {hour:'2-digit', minute:'2-digit'})
        }
        else {
          return new Date(point[1] * 1000).toLocaleDateString('en-us', {})
        }
      }),
      datasets: [{
        data: data.map(point => point[0]),
        fill: false,
        borderColor: 'rgb(78,205,95)',
        borderWidth: 2,
        spanGaps: true,
        stepped: false,
        tension: 0,
        pointRadius: 0
      }]
    }

    this.options = {
      responsive: true,
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
        y: {
          suggestedMin: this.minScale,
          suggestedMax: this.maxScale,
          ticks: {
            callback: function(value, index, ticks) {
              return value + postpendValue
            }
          }
        }
      }
    }
  }
}
</script>
