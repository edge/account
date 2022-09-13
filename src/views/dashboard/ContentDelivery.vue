<template>
  <div class="mainContent__inner">
    <h1>Edge CDN</h1>
    <div class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <span>No content delivery deployments yet</span>
        <router-link
          :to="{ name: 'ContentDeliveryDeploy' }"
          class="button button--success button--small"
        >
          Deploy CDN
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

export default {
  name: 'Servers',
  title() {
    return 'Edge Account Portal » CDN'
  },
  components: {
    LoadingSpinner,
    Pagination
  },
  data() {
    return {
      limit: 10,
      loaded: false,
      metadata: { totalCount: 0 },
      pageHistory: [1]
    }
  },
  computed: {
    ...mapState(['account', 'session']),
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    }
  },
  methods: {
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    }
  },
  watch: {
    pageHistory() {
      this.updateServers()
    }
  }
}
</script>

<style scoped>
</style>
