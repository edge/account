<template>
  <LineChart :chartData="chartData" :options="options" />
</template>

<script> // Note without lang="ts"
import { defineComponent } from 'vue'
import { LineChart, useLineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables)

export default defineComponent({
  name: 'MultiLine',
  components: { LineChart },
  props: {
    data: Object,
    minScale: Number,
    maxScale: Number,
    postpendValue: String,
    labels: Array
  },
  setup(props) {
    const data = JSON.parse(JSON.stringify(props.data))
    const labels = props.labels
    let postpendValue = ''
    if (props.postpendValue) { 
      postpendValue = props.postpendValue
    }
    const borderColors = [
      'rgb(78,205,95)',
      'rgb(78,100,99)',
      'rgb(78,205,95)'
    ] 
    // data.map((item, index) => (
    //   console.log(
    //     data[0].map(point => new Date(point[1] * 1000).toLocaleTimeString('en-us', {hour:'2-digit', minute:'2-digit'}))
    //   )
    // ))
    const chartData = {
      labels: data[0].map(point => new Date(point[1] * 1000).toLocaleTimeString('en-us', {hour:'2-digit', minute:'2-digit'})),
      datasets: data.map((item, index) => ({
        label: labels[index],
        data: item.map(point => point[0]),
        fill: false,
        borderColor: borderColors[index],
        backgroundColor: borderColors[index],
        borderWidth: 2,
        spanGaps: true,
        stepped: false,
        tension: 0,
        pointRadius: 0
      }))
    }
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            paddding: 30
          }
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