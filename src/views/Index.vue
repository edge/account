<template>
  <Header />
</template>

<script>
import Header from "@/components/Header"

// import { fetchBlocks, fetchTransactions } from '../utils/api'

export default {
  name: 'Index',
  title() {
    return 'Edge Account Portal » Index'
  },
  data: function () {
    return {
      // blockMetadata: null,
      // blocks: [],
      // transactionMetadata: null,
      // transactions: [],
      loading: false
      // pollInterval: 10000,
      // polling: null
    }
  },
  components: {
    Header
  },
  mounted() {
    this.loading = true
    // this.fetchBlocks()
    // this.fetchTransactions()
    // this.pollData()
  },
  watch: {
    $route(to, from) {
      // clearInterval(this.polling)
      // this.polling = null
    }
  },
  methods: {

  }
}
</script>
<style scoped>
  .row {
    @apply grid items-start grid-cols-1 gap-24;
    @apply lg:grid-cols-2;
  }
</style>
