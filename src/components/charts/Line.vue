<template>
  <LineChart :chartData="chartData" :options="options" />
</template>

<script> // Note without lang="ts"
import { defineComponent } from 'vue'
import { LineChart, useLineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables)

export default defineComponent({
  name: 'Line',
  components: { LineChart },
  props: {
    datapoints: Object
  },
  setup(props) {
    const data = JSON.parse(JSON.stringify(props.datapoints))
    const chartData = {
      labels: data.map(point => new Date(point[1] * 1000).toLocaleTimeString('en-us', {hour:'2-digit', minute:'2-digit'})),
      datasets: [{
        data: data.map(point => point[0]),
        fill: false,
        borderColor: 'rgb(78,205,95)',
        borderWidth: 2,
        spanGaps: true,
        tension: 0
      }]
    }
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          intersect: false,
          interaction: {
            intersect: false
          }
        }
      },
    }
    return { chartData, options }
  },
})
</script>