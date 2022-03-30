<template>
  <LineChart :chartData="chartData" :options="options" />
</template>

<script>
import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables)

export default {
  name: 'MultiLine',
  components: { LineChart },
  props: {
    data: Object,
    minScale: Number,
    maxScale: Number,
    period: String,
    postpendValue: String,
    labels: Array
  },
  data() {
    return {
      chartData: null,
      options: null
    }
  },
  mounted() {
    const data = JSON.parse(JSON.stringify(this.data))
    const labels = this.labels
    let postpendValue = ''
    if (this.postpendValue) { 
      postpendValue = this.postpendValue
    }
    const borderColors = [
      'rgb(78,205,95)',
      'rgb(78,100,99)',
      'rgb(78,205,95)'
    ] 

    this.chartData = {
      labels: data[0].map(point => {
        if (this.period === 'day') {
          return new Date(point[1] * 1000).toLocaleTimeString('en-us', {hour:'2-digit', minute:'2-digit'})
        } else {
          return new Date(point[1] * 1000).toLocaleDateString('en-us', {})
        }
      }),
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
    
    this.options = {
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
          suggestedMin: this.minScale,
          suggestedMax: this.maxScale,
          ticks: {
            // Include a dollar sign in the ticks
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