<template>
  <div>
    <h4>Consumption</h4>
    <div v-if=consumingServices >
      <p class="mb-0">This chart shows the accrued costs since your last payment and is updated each hour. </p>
      <div id="usage__chart" v-if=consumingServices>
        <!-- <Tooltip :text="`Servers $${balance.consumption.servers.currentCost.toFixed(2)}`"> -->
          <div id="usage__servers" class="usage__area">
            <span v-if="balance.consumption.servers.currentCost">Servers ${{ balance.consumption.servers.currentCost.toFixed(2) }}</span>
          </div>
        <!-- </Tooltip> -->
        <!-- <Tooltip :text="`Domains $${balance.consumption.dns.currentCost.toFixed(2)}`"> -->
          <div id="usage__dns" class="usage__area">
            <span v-if="balance.consumption.dns.currentCost">Domains ${{ balance.consumption.dns.currentCost.toFixed(2) }}</span>
          </div>
        <!-- </Tooltip> -->
        <!-- <Tooltip :text="`Content Delivery $${balance.consumption.cdn.currentCost.toFixed(2)}`"> -->
          <div id="usage__cdn" class="usage__area">
            <span v-if="balance.consumption.cdn.currentCost">CDN ${{ balance.consumption.cdn.currentCost.toFixed(2) }}</span>
          </div>
        <!-- </Tooltip> -->
      </div>
      <div class="text-right text-md">
        <span>Total: </span>
        <span>{{ balance.reserved.usd.toFixed(2) }}</span>
        <span class="text-xs"> USD</span>
      </div>
    </div>
    <p v-else>You do not currently have any services. Once deployed, your accrued costs will show here.</p>
  </div>
</template>

<script>
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'

export default {
  name: 'BillingConsumptionChart',
  components: {
    Tooltip
  },
  computed: {
    ...mapState(['balance']),
    cdnCount() {
      return this.balance.consumption.cdn.used
    },
    consumingServices() {
      return this.total || this.cdnCount || this.dnsCount || this.serverCount
    },
    dnsCount() {
      return this.balance.consumption.dns.used
    },
    serverCount() {
      return this.balance.consumption.servers.used
    },
    total() {
      return this.balance.reserved.usd
    }
  },
  methods: {
    updateChart() {
      if (!this.consumingServices) return
      const chart = document.getElementById('usage__chart')
      const width = chart.offsetWidth
      const consumption = this.balance.consumption
      const serversWidth = (consumption.servers.currentCost / this.total) * width
      const dnsWidth = (consumption.dns.currentCost / this.total) * width
      const cdnWidth = (consumption.cdn.currentCost / this.total) * width
      chart.style.gridTemplateColumns = `${serversWidth}px ${dnsWidth}px ${cdnWidth}px`
    }
  },
  mounted() {
    this.updateChart()
    window.addEventListener('resize', this.updateChart)
  },
  unmounted() {
    window.removeEventListener('resize', this.updateChart)
  },
  watch: {
    balance() {
      this.updateChart()
    }
  }
}
</script>

<style scoped>
#usage__chart{
  @apply grid grid-cols-3 w-full;
}

.usage__area {
  @apply flex items-center justify-center text-white text-xs border border-white rounded my-4 bg-green;
  /* background-color: rgb(110,224,159); */
  height: 2.5rem;
}
</style>
