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
    data: Object,
    minScale: Number,
    maxScale: Number,
    postpendValue: String
  },
  setup(props) {
    const data = JSON.parse(JSON.stringify(props.data))
    let postpendValue = ''
    if (props.postpendValue) { 
      postpendValue = props.postpendValue
    }
    const chartData = {
      labels: data.map(point => new Date(point[1] * 1000).toLocaleTimeString('en-us', {hour:'2-digit', minute:'2-digit'})),
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
      scales: {
        y: {
          suggestedMin: props.minScale,
          suggestedMax: props.maxScale,
          ticks: {
            // Include a dollar sign in the ticks
            callback: function(value, index, ticks) {
                return value + postpendValue
            }
          }
        }
      },
    }
    return { chartData, options }
  },
})
</script>