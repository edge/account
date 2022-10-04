<template>
  <div>
    <!-- range toggle -->
    <IntegrationMetricsRangeToggle :period=selectedPeriod @update-period=onUpdateTimePeriod />
    <!-- charts -->
    <div v-if=metrics class="metrics__grid">
      <div class="box">
        <h4>Requests</h4>
        <Line
          :data=requestsData
          :formatYScale=formatRequestsScale
          :labels=timeSeries
          :minScale="0"
          :maxScale="10"
        />
      </div>
      <div class="box">
        <h4>Traffic</h4>
        <Line
          :data=trafficData
          :decimalPlaces="2"
          :formatYScale=formatTrafficScale
          :labels=timeSeries
          :minScale="0"
          :maxScale="10"
        />
      </div>
      <div class="box">
        <h4>Cache</h4>
        <Line
          :data=cacheData
          :decimalPlaces="1"
          :labels=timeSeries
          :minScale="0"
          :maxScale="100"
          unit=" %"
        />
      </div>
      <div class="box">
        <h4>Bandwidth</h4>
        <Line
          :data=bandwidthData
          :decimalPlaces="2"
          :formatYScale=formatBandwidthScale
          :labels=timeSeries
          :minScale="0"
        />
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import IntegrationMetricsRangeToggle from '@/components/cdn/IntegrationMetricsRangeToggle'
import Line from '@/components/charts/Line'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'IntegrationMetrics',
  props: ['integration'],
  components: {
    IntegrationMetricsRangeToggle,
    Line
  },
  data() {
    return {
      iMetrics: null,
      metrics: null,
      selectedPeriod: 'day',
      timeSeries: []
    }
  },
  computed: {
    ...mapState(['session']),
    bandwidthData() {
      return this.metrics && [{ series: this.metrics.b }]
    },
    cacheData() {
      return this.metrics && [
        {
          series: this.metrics.cr,
          label: 'Requests',
          color: {
            border: 'rgb(14, 204, 95)',
            background: 'rgb(110, 224, 159)'
          }
        },
        {
          series: this.metrics.ct,
          label: 'Traffic',
          color: {
            border: 'rgb(220, 60, 60)',
            background: 'rgb(255, 138, 138)'
          }
        }
      ]
    },
    metricsOptions() {
      if (this.selectedPeriod === 'day') return { range: 'hourly', count: 24 }
      else if (this.selectedPeriod === 'week') return { range: 'daily', count: 7 }
      else return { range: 'daily', count: 30 }
    },
    requestsData() {
      return this.metrics && [{ series: this.metrics.r }]
    },
    trafficData() {
      return this.metrics && [{ series: this.metrics.t }]
    }
  },
  methods: {
    formatBandwidthScale(y) {
      let value = y
      if (y >= 1e3) value = y / 1e3
      if (y >= 1e6) value = y / 1e6
      if (y >= 1e9) value = y / 1e9
      let unit = ''
      if (y >= 1e3) unit = ' Kbps'
      if (y >= 1e6) unit = ' Mbps'
      if (y >= 1e9) unit = ' Gbps'
      return { value, unit }
    },
    formatRequestsScale(y) {
      let value = y
      if (y >= 1e3) value = y / 1e3
      if (y >= 1e6) value = y / 1e6
      let unit = ''
      if (y >= 1e3) unit = 'K'
      if (y >= 1e6) unit = 'M'
      return { value, unit }
    },
    formatTrafficScale(y) {
      let value = y
      if (y >= 1e3) value = y / 1e3
      if (y >= 1e6) value = y / 1e6
      if (y >= 1e9) value = y / 1e9
      if (y >= 1e12) value = y / 1e12
      let unit = ''
      if (y >= 1e3) unit = ' KB'
      if (y >= 1e6) unit = ' MB'
      if (y >= 1e9) unit = ' GB'
      if (y >= 1e12) unit = ' GB'
      return { value, unit }
    },
    onUpdateTimePeriod(period) {
      this.selectedPeriod = period
    },
    async updateMetrics() {
      const results = await api.integration.getIntegrationMetrics(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.integration._key,
        this.metricsOptions
      )
      this.updateTimeSeries(results)
      this.metrics = results
    },
    updateTimeSeries(metrics) {
      this.timeSeries = metrics.ts.map(ts => {
        if (this.selectedPeriod === 'day') return moment(ts * 1000).format('LT')
        if (this.selectedPeriod === 'week') return moment(ts * 1000).format('DD MMM')
        if (this.selectedPeriod === 'month') return moment(ts * 1000).format('DD MMM')
      })
    }
  },
  mounted() {
    this.updateMetrics()
    this.iMetrics = setInterval(() => {
      this.updateMetrics()
    }, 60 * 1000)
  },
  unmounted() {
    clearInterval(this.iMetrics)
  },
  watch: {
    selectedPeriod() {
      this.updateMetrics()
    }
  }
}
</script>

<style scoped>
.metrics__grid {
  @apply grid lg:grid-cols-2 gap-4
}
</style>
