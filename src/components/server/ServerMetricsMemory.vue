<template>
  <div class="box">
    <div class="flex flex-row">
      <h4 class="text-sm flex-grow">Memory Usage <span class="ml-1 text-gray">last 24 hrs</span></h4>
      <p class="flex flex-row">
        <label class="mr-1 text-gray" for="zoom-memory">Zoom</label>
        <input id="zoom-memory" type="checkbox" :checked="zoomed" @change="toggleZoom"/>
      </p>
    </div>
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
  data() {
    return {
      zoomed: false
    }
  },
  computed: {
    timeSeries() {
      const dates = this.data.map(([t]) => new Date(t * 1000))
      return dates.map(d => `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`)
    },
    chartData() {
      return {
        labels: this.timeSeries,
        datasets: [{
          data: this.data.map(([, v]) => v),
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
            max: this.zoomed ? undefined : this.server.spec.ram * (1024 * 1024),
            min: 0,
            ticks: {
              callback: (tickValue) => {
                const { value, unit } = this.formatYScale(tickValue)
                return `${value.toFixed(1)} ${unit}`
              },
              stepSize: this.zoomed ? undefined : (this.server.spec.ram * (1024 * 1024)) / 4
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
      const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
      let value = yValue
      let count = 0
      while (value >= 1024) {
        value = value / 1024
        count++
      }
      return {
        value,
        unit: units[count]
      }
    },
    toggleZoom() {
      this.zoomed = !this.zoomed
    }
  }
}
</script>

<style scoped>

</style>
