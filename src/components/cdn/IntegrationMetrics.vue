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
    metricsOptions() {
      if (this.selectedPeriod === 'day') return { range: 'hourly', count: 24 }
      else if (this.selectedPeriod === 'week') return { range: 'daily', count: 7 }
      else return { range: 'daily', count: 30 }
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
