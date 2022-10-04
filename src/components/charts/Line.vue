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
    decimalPlaces: Number,
    formatYScale: Function,
    labels: Array,
    minScale: Number,
    maxScale: Number,
    unit: String,
    xLabel: String,
    yLabel: String
  },
  computed: {
    chartData() {
      return {
        labels: this.labels,
        datasets: this.data.map(data => ({
          label: data.label,
          data: data.series,
          fill: false,
          backgroundColor: data.color ? data.color.background : 'rgba(110,224,159)',
          borderColor: data.color ? data.color.border : 'rgb(14, 204, 95)',
          borderWidth: 2,
          spanGaps: true,
          stepped: false,
          pointRadius: 0,
          tension: 0.2
        }))
      }
    },
    options() {
      return {
        responsive: true,
        plugins: {
          legend: {
            display: this.data.length > 1
          },
          tooltip: {
            interaction: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: tooltipItem => {
                  let value = tooltipItem.raw
                  let unit = this.unit
                  if (this.formatYScale) {
                    const scales = this.formatYScale(tooltipItem.raw)
                    value = scales.value
                    unit = scales.unit
                  }
                  // eslint-disable-next-line max-len
                  return `${tooltipItem.dataset.label ? ` ${tooltipItem.dataset.label}:` : ''} ${value.toFixed(this.decimalPlaces)}${unit || ''}`
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
            title: {
              display: true,
              text: this.xLabel
            },
            grid: {
              display: false
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
              callback: (tickValue) => {
                let value = tickValue
                let unit = this.unit
                if (this.formatYScale) {
                  const scales = this.formatYScale(tickValue)
                  value = scales.value
                  unit = scales.unit
                }
                return `${value}${unit || ''}`
              }
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
