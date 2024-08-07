<template>
  <div class="flex flex-col items-start space-y-4">
    <!-- if metrics don't exist -->
    <div v-if="server.status === 'pending'" class="box box--tall">
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

    <div v-else-if="loading" class="flex flex-col items-center justify-center text-center w-full">
      <div class="flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
      <h4 class="mt-4">Loading metrics</h4>
    </div>

    <div v-else-if="metrics" class="grid w-full grid-cols-1 xl:grid-cols-2 gap-5">
      <ServerMetricsCPU v-if="metrics.cpu" :data="metrics.cpu"/>
      <ServerMetricsMemory v-if="metrics.mem" :data="metrics.mem" :server="server"/>
      <ServerMetricsDisk v-if="metrics.disk" :data="metrics.disk" :server="server"/>
      <ServerMetricsNet
        v-if="metrics.bwin || metrics.bwout"
        :bwin="metrics.bwin"
        :bwout="metrics.bwout"
        :server="server"
      />
    </div>

    <div v-else-if="error" class="box box--tall">
      <div class="flex flex-col items-center justify-center text-center">
        <h4 class="mt-4">{{ error.status === 503 ? 'Service unavailable' : 'Error' }}</h4>
        Please try again later or contact support for assistance if this issue persists.
      </div>
    </div>

    <div v-else class="box box--tall">
      <div class="flex flex-col items-center justify-center text-center">
        <h4 class="mt-4">Failed to load metrics</h4>
      </div>
    </div>
</div>
</template>

<script>
/* global process */

import * as utils from '@edge/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import RocketIcon from '@/components/icons/RocketIcon.vue'
import ServerMetricsCPU from './ServerMetricsCPU.vue'
import ServerMetricsDisk from './ServerMetricsDisk.vue'
import ServerMetricsMemory from './ServerMetricsMemory.vue'
import ServerMetricsNet from './ServerMetricsNet.vue'
import { mapState } from 'vuex'

export default {
  name: 'ServerMetrics',
  props: ['server'],
  data() {
    return {
      error: null,
      loading: true,
      metrics: null
    }
  },
  components: {
    LoadingSpinner,
    RocketIcon,
    ServerMetricsCPU,
    ServerMetricsDisk,
    ServerMetricsMemory,
    ServerMetricsNet
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
      try {
        const res = await utils.getServerMetrics(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.server._key)
        this.metrics = res
      }
      catch (err) {
        this.error = err
      }
      finally {
        this.loading = false
      }
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
