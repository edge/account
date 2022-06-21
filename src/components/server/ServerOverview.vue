<template>
  <div class="flex flex-col items-start space-y-5">

    <!-- if metrics exist -->
    <div v-if="displayMetrics" class="buttonGroup">
      <button @click.prevent="updateMetrics('day')"
        class="buttonGroup__button"
        :class="currentPeriod == 'day' ? 'active' : ''"
      >
        Today
      </button>
      <button @click.prevent="updateMetrics('week')"
        class="buttonGroup__button"
        :class="currentPeriod == 'week' ? 'active' : ''"
      >
        This week
      </button>
      <button @click.prevent="updateMetrics('month')"
        class="buttonGroup__button"
        :class="currentPeriod == 'month' ? 'active' : ''"
      >
        This month
      </button>
      <button @click.prevent="updateMetrics('year')"
        class="border-none buttonGroup__button"
        :class="currentPeriod == 'year' ? 'active' : ''"
      >
        This year
      </button>
    </div>
    <div v-if="displayMetrics" class="grid w-full grid-cols-1 gap-5">
      <div class="box">
        <h4 :class="this.graphMetrics && this.graphMetrics.cpu_load ? 'mb-8' : ''">CPU Load</h4>
        <Line
          v-if="this.graphMetrics"
          :key="componentKey"
          :labels="labels"
          :xLabel="this.xLabel"
          yLabel="CPU Load (%)"
          :data="graphMetrics.cpu_load"
          :minScale="0"
          :maxScale="100"
          :postpendValue="'%'"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">CPU load statistics will appear here as they become available.</p>
      </div>

      <div class="box">
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
          postpendValue="GB"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">Memory usage statistics will appear here as they become available.</p>
      </div>

      <div class="box">
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
          postpendValue="GB"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">Disk usage statistics will appear here as they become available.</p>
      </div>

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
        <!-- eslint-disable-next-line max-len-->
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
import Line from '@/components/charts/Line'
// import MultiLine from '@/components/charts/MultiLine'
import RocketIcon from '@/components/icons/RocketIcon'
import moment from 'moment'

const intervalLookup = {
  'day': {
    format: 'LT',
    interval: 'hour',
    intervalMs: 3.6e6,
    steps: 24,
    xLabel: 'Time'
  },
  'week': {
    format: 'ddd',
    interval: 'day',
    intervalMs: 8.64e6,
    steps: 7,
    xLabel: 'Day'
  },
  'month': {
    format: 'll',
    interval: 'day',
    intervalMs: 8.64e6,
    steps: 30,
    xLabel: 'Date'
  },
  'year': {
    format: 'MMM',
    interval: 'month',
    intervalMs: 26.29746e8,
    steps: 12,
    xLabel: 'Month'
  }
}

export default {
  name: 'ServerOverview',
  props: ['server'],
  data() {
    return {
      componentKey: 0,
      currentPeriod: 'day',
      graphMetrics: null,
      timeLabels: [],
      xLabel: 'Time'
    }
  },
  components: {
    Line,
    // MultiLine,
    RocketIcon
  },
  computed: {
    displayMetrics() {
      const status = this.server.status
      return status !== 'pending' && status !== 'creating' && status !== 'createFailed'
    }
  },
  mounted() {
    this.updateMetrics('day')
  },
  methods: {
    // formatDatapoints(data, sizeType = 'MB') {
    //   const divisor = sizeType === 'MB' ? 1048576 : 1073741824

    //   data.forEach(datapoint => {
    //     if (datapoint[0]) {
    //       datapoint[0] = datapoint[0]/divisor
    //     }
    //   })

    //   return data
    // },
    updateLabels(intervalObj) {
      const now = Date.now()
      const labels = []

      const { format, intervalMs, steps, xLabel } = intervalObj

      for (let i = 0; i < steps; i++) {
        const label = moment(now - (i * intervalMs)).format(format)
        labels.unshift(label)
      }
      this.labels = labels
      this.xLabel = xLabel
    },
    async updateMetrics(period) {
      this.currentPeriod = period
      const intervalObj = intervalLookup[period]
      const { steps } = intervalObj

      this.updateLabels(intervalObj)

      // generate random dummy data
      const getRanAmount = (max) => Math.random() * max
      const cpu_load = []
      const mem_usage = []
      const disk_usage = []
      for (let i = 0; i < steps; i++) {
        cpu_load.push(getRanAmount(100))
        mem_usage.push(getRanAmount(this.server.spec.ram / 1024))
        disk_usage.push(getRanAmount(this.server.spec.disk / 1024))
      }
      this.graphMetrics = {
        cpu_load,
        mem_usage,
        disk_usage
      }

      // charts re-render when key changes
      this.componentKey += 1
    }
  }
}
</script>
<style scoped>
  .box {
    @apply p-4 md:p-6 bg-white rounded-lg w-full;
  }
  .box.box--tall {
    @apply py-20 !important;
  }
  .buttonGroup {
    @apply flex border border-gray-300 rounded-md overflow-hidden bg-white;
  }
  .buttonGroup__button {
    @apply px-3 md:px-4 py-2 md:py-3 border-r border-gray-300 bg-white focus:outline-none text-sm text-gray-500;
    @apply hover:bg-gray-100;
  }
  .buttonGroup__button.active {
    @apply bg-green bg-opacity-10 text-green;
  }
</style>
