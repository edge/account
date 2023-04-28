<template>
  <div class="flex flex-col items-start space-y-4">
    <div v-if="hasMetrics" class="grid w-full grid-cols-1 xl:grid-cols-2 gap-5">
      <ServerMetricsCPU v-if="metrics.cpu" :data="metrics.cpu"/>
      <ServerMetricsMemory v-if="metrics.mem" :data="metrics.mem" :server="server"/>
      <ServerMetricsDisk v-if="metrics.disk" :data="metrics.disk" :server="server"/>

      <!-- <div class="box">
        <h4 :class="this.graphMetrics && this.graphMetrics.mem_usage ? 'mb-8' : ''">Memory Usage</h4>
        <Line
          v-if="this.graphMetrics"
          :key="componentKey"
          :labels="labels"
          :xLabel="this.xLabel"
          yLabel="Memory Usage (GB)"
          :data="graphMetrics.mem_usage"
          :minScale="0"
          :maxScale="this.server.spec.ram  / 1024"
          unit="GB"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">Memory usage statistics will appear here as they become available.</p>
      </div>

      <div class="box xl:col-span-2">
        <h4 :class="this.graphMetrics && this.graphMetrics.disk_usage ? 'mb-8' : ''">Disk Usage</h4>
        <Line
          v-if="this.graphMetrics && this.graphMetrics.disk_usage"
          :key="componentKey"
          :labels="labels"
          :xLabel="this.xLabel"
          yLabel="Disk Usage (GB)"
          :data="this.graphMetrics.disk_usage"
          :minScale="0"
          :maxScale="this.server.spec.disk / 1024"
          unit="GB"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">Disk usage statistics will appear here as they become available.</p>
      </div> -->

      <!-- <div class="box">
        <h4 class="mb-8">Disk I/O</h4>
        <Line
          v-if="this.graphMetrics && this.graphMetrics['iops']"
          :key="componentKey"
          :period="currentPeriod"
          :data="this.graphMetrics.dataIn"
        />
      </div> -->

      <!-- <div class="box">
        <h4 class="mb-8">Net RX/TX</h4>
        <MultiLine
          v-if="this.graphMetrics && this.graphMetrics['net_rx'][0]"
          :key="componentKey"
          :period="currentPeriod"
          :data='[
            removeEmptyPoints(this.graphMetrics["net_rx"][0].datapoints),
            removeEmptyPoints(this.graphMetrics["net_tx"][0].datapoints)
          ]'
          :labels="['RX', 'TX']"
        />
      </div> -->
    </div>

    <!-- if metrics don't exist -->
    <div v-else class="box box--tall">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center justify-center w-16 h-16 p-4 border-2 border-green-100 rounded-full border-opacity-10 animate-pulse bg-green-50">
          <RocketIcon />
        </div>
        <h4 class="mt-4">Deploying your new server</h4>
        <p class="mt-2 mb-0 text-gray-500">
          Server metrics and other information will be displayed here once deployment is complete.
        </p>
      </div>
    </div>
</div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import RocketIcon from '@/components/icons/RocketIcon'
import ServerMetricsCPU from './ServerMetricsCPU.vue'
import ServerMetricsDisk from './ServerMetricsDisk.vue'
import ServerMetricsMemory from './ServerMetricsMemory.vue'
import { mapState } from 'vuex'

export default {
  name: 'ServerMetrics',
  props: ['server'],
  data() {
    return {
      metrics: null
    }
  },
  components: {
    RocketIcon,
    ServerMetricsCPU,
    ServerMetricsDisk,
    ServerMetricsMemory
  },
  computed: {
    ...mapState(['session']),
    hasMetrics() {
      // if (this.server.status...)
      if (this.metrics === null) return false
      return true
    }
  },
  methods: {
    async reload() {
      const res = await api.servers.getMetrics(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.server._key)
      console.log(res)
      this.metrics = res
    }
  },
  mounted() {
    this.reload()
  }
}
</script>
<style scoped>
.box.box--tall {
  @apply py-20 !important;
}
.buttonGroup {
  @apply flex border border-gray-300 rounded-md overflow-hidden bg-white;
}
.buttonGroup__button {
  @apply px-3 md:px-4 py-2 md:py-3 border-r border-gray-300 bg-white focus:outline-none text-xs text-gray-500 uppercase;
  @apply hover:bg-gray-100;
}
.buttonGroup__button.active {
  @apply bg-green bg-opacity-10 text-green;
}

@media (max-width: 350px) {
  .buttonGroup {
    @apply w-full grid grid-cols-2
  }
}
</style>
