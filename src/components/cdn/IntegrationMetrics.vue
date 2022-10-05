<template>
  <div>
    <!-- range toggle -->
    <IntegrationMetricsRangeToggle :period=selectedPeriod @update-period=onUpdateTimePeriod />
    <!-- charts -->
    <div v-if=metrics class="metrics__grid">
      <IntegrationMetricsRequests :metrics=metrics :timeSeries=timeSeries />
      <IntegrationMetricsTraffic :metrics=metrics :timeSeries=timeSeries />
      <IntegrationMetricsCache :metrics=metrics :timeSeries=timeSeries />
      <IntegrationMetricsBandwidth :metrics=metrics :timeSeries=timeSeries />
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import IntegrationMetricsBandwidth from '@/components/cdn/IntegrationMetricsBandwidth'
import IntegrationMetricsCache from '@/components/cdn/IntegrationMetricsCache'
import IntegrationMetricsRangeToggle from '@/components/cdn/IntegrationMetricsRangeToggle'
import IntegrationMetricsRequests from '@/components/cdn/IntegrationMetricsRequests'
import IntegrationMetricsTraffic from '@/components/cdn/IntegrationMetricsTraffic'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'IntegrationMetrics',
  props: ['integration'],
  components: {
    IntegrationMetricsBandwidth,
    IntegrationMetricsCache,
    IntegrationMetricsRangeToggle,
    IntegrationMetricsRequests,
    IntegrationMetricsTraffic
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
    formatValueUnits(yValue, units) {
      let value = yValue
      let count = 0
      while (value >= 1000) {
        value = value / 1000
        count++
      }
      if (count > 0) value = value.toFixed(1)
      return `${value}${units[count]}`
    },
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
      let unit = 'bps'
      const fixed = 1
      if (y >= 1e3) {
        value = y / 1e3
        unit = ' Kbps'
      }
      if (y >= 1e6) {
        value = y / 1e6
        unit = ' Mbps'
      }
      if (y >= 1e9) {
        value = y / 1e9
        unit = ' Gbps'
      }
      if (y >= 1e12) {
        value = y / 1e12
        unit = ' Tbps'
      }
      return { value, unit, fixed }
    },
    formatTrafficScale(y) {
      let value = y
      let unit = 'bytes'
      let fixed = 0
      if (y >= 1e3) {
        value = y / 1e3
        unit = ' KB'
        fixed = 1
      }
      if (y >= 1e6) {
        value = y / 1e6
        unit = ' MB'
      }
      if (y >= 1e9) {
        value = y / 1e9
        unit = ' GB'
      }
      if (y >= 1e12) {
        value = y / 1e12
        unit = ' TB'
      }
      return { value, unit, fixed }
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
