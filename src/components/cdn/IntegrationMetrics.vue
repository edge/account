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
          :labels=timeSeries
          :minScale="0"
          :maxScale="10"
          unit="K"
        />
      </div>
      <div class="box">
        <h4>Traffic</h4>
        <Line
          :data=trafficData
          :labels=timeSeries
          :minScale="0"
          :maxScale="10"
          unit=" GB"
        />
      </div>
      <div class="box">
        <h4>Cache</h4>
        <Line
          :data=cacheData
          :labels=timeSeries
          :minScale="0"
          :maxScale="100"
          unit="%"
        />
      </div>
      <div class="box">
        <h4>Bandwidth</h4>
        <Line
          :data=bandwidthData
          :labels=timeSeries
          :minScale="0"
          :maxScale="100"
          unit=" Mbps"
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
      // placeholder
      return this.metrics && this.metrics.map(m => m.cdn.requests.cached)
    },
    cacheData() {
      // placeholder
      return this.metrics && this.metrics.map(m => m.cdn.requests.cached)
    },
    metricsOptions() {
      if (this.selectedPeriod === 'day') return { range: 'hourly', count: 24 }
      else if (this.selectedPeriod === 'week') return { range: 'daily', count: 7 }
      else return { range: 'daily', count: 30 }
    },
    requestsData() {
      // placeholder
      return this.metrics && this.metrics.map(m => m.cdn.requests.cached)
    },
    trafficData() {
      // placeholder
      return this.metrics && this.metrics.map(m => m.cdn.requests.cached)
    }
  },
  methods: {
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
      this.updateTimeSeries(results.reverse())
      this.metrics = results.reverse()
    },
    updateTimeSeries(metrics) {
      this.timeSeries = metrics.map(m => {
        const date = new Date(m.end)
        if (this.selectedPeriod === 'day') return moment(date).format('LT')
        if (this.selectedPeriod === 'week') return moment(date).format('ddd')
        if (this.selectedPeriod === 'month') return moment(date).format('ll')
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
