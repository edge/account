<template>
  <div class="metrics__grid">
    <div class="box">
      <h4>Requests (last 24h)</h4>
      <Line
        :data=requestsData
        :labels=labels
        :minScale="0"
        :maxScale="10"
        unit="K"
      />
    </div>
    <div class="box">
      <h4>Traffic (last 24h)</h4>
      <Line
        :data=trafficData
        :labels=labels
        :minScale="0"
        :maxScale="10"
        unit=" GB"
      />
    </div>
    <div class="box">
      <h4>Cache (last 24h)</h4>
      <Line
        :data=cacheData
        :labels=labels
        :minScale="0"
        :maxScale="100"
        unit="%"
      />
    </div>
    <div class="box">
      <h4>Bandwidth (last 24h)</h4>
      <Line
        :data=bandwidthData
        :labels=labels
        :minScale="0"
        :maxScale="100"
        unit=" Mbps"
      />
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import Line from '@/components/charts/Line'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationMetrics',
  props: ['integration'],
  components: {
    Line
  },
  data() {
    return {
      iMetrics: null,
      metrics: null
    }
  },
  computed: {
    ...mapState(['session']),
    bandwidthData() {
      return this.getData(100)
    },
    cacheData() {
      return this.getData(100)
    },
    requestsData() {
      return this.getData(10)
    },
    trafficData() {
      return this.getData(10)
    },
    labels() {
      const labels = []
      const now = new Date()
      const lastHour = now.getHours()
      for (let i = 0; i < 24; i++) {
        let hour = lastHour - i
        if (hour < 0) hour += 24
        labels.unshift(`${hour}:00`)
      }
      return labels
    }
  },
  methods: {
    getData(max) {
      const data = []
      for (let i = 0; i < 24; i++) {
        const randomData = Math.floor(Math.random() * max * 100)/100
        data.unshift(randomData)
      }
      return data
    },
    async updateMetrics() {
      const results = await api.integration.getIntegrationMetrics(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.integration._key
      )
      this.metrics = results
    }
  },
  // mounted() {
  //   this.updateMetrics()
  //   this.iMetrics = setInterval(() => {
  //     this.updateMetrics()
  //   }, 60 * 1000)
  // },
  // unmounted() {
  //   clearInterval(this.iMetrics)
  // }
}
</script>

<style scoped>
.metrics__grid {
  @apply grid lg:grid-cols-2 gap-4
}
</style>
