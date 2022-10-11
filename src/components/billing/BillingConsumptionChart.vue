<template>
  <div>
    <h4>Consumption</h4>
    <div>
      <div><span>Daily Usage:</span></div>
      <div>
        <div class="usage__chart">
          <div id="usage__servers" class="usage__area"></div>
          <div id="usage__domains" class="usage__area"></div>
          <div id="usage__cdn" class="usage__area"></div>
        </div>
      </div>
      <div><span>Total: </span><span>{{ balance.reserved.usd }}</span><span> USD</span></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BillingConsumptionChart',
  components: {
  },
  computed: {
    ...mapState(['balance'])
  },
  methods: {
    updateChart() {

    }
  },
  mounted() {
    this.updateChart()
  }
}
</script>

<style scoped>
.usage__chart{
  @apply grid grid-cols-3 w-full;
}

.usage__area {
  @apply border border-gray my-4;
  height: 3rem;
}
</style>
