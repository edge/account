<template>
  <div class="flex w-full">
    <SideNavigation />
    <main class="mainContent">
      <UserNav />
    </main>
  </div>
</template>

<script>
import SideNavigation from "@/components/SideNavigation"
import UserNav from "@/components/UserNav"

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
    SideNavigation,
    UserNav
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
  .mainContent {
    @apply relative flex-1 p-8;
  }
</style>
