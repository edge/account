<template>
  <div class="mainContent__inner">
    <div class="flex justify-between">
      <h1>Edge Servers</h1>
      <router-link
        v-if="servers.length"
        :to="{ name: 'ServerDeploy' }"
        class="button button--success button--small h-full"
      >
        Deploy Server
      </router-link>
    </div>

    <div v-if="!loaded" class="flex items-center">
      <span>Loading servers</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <ul v-else-if="servers.length" role="list" class="serverList">
      <ServerListItem
        v-for="server in servers"
        :key="server._key"
        :regions=regions
        :server=server
      />
      <Pagination
        :currentPage=currentPage
        :limit=limit
        :totalCount="metadata.totalCount"
        @change-page=changePage
      />
    </ul>

    <div v-else class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <p>You haven't deployed any servers yet. Once you deploy your first server it will be available here.</p>
        <router-link
          :to="{ name: 'ServerDeploy' }"
          class="button button--success button--small"
        >
          Deploy server
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import ServerListItem from '@/components/server/ServerListItem'
import { mapState } from 'vuex'

export default {
  name: 'Servers',
  title() {
    return 'Edge Account Portal » Servers'
  },
  components: {
    LoadingSpinner,
    Pagination,
    ServerListItem
  },
  data() {
    return {
      iServers: null,
      limit: 10,
      loaded: false,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      regions: [],
      servers: []
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
    },
    async updateRegions() {
      const { results } = await api.region.getRegions(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key
      )
      this.regions = results
    },
    async updateServers() {
      const { results, metadata } = await api.servers.getServers(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.servers = results
      this.metadata = metadata
      this.loaded = true
    }
  },
  async mounted() {
    await this.updateRegions()
    await this.updateServers()
    this.iServers = setInterval(() => {
      this.updateServers()
    }, 10000)
  },
  unmounted() {
    clearInterval(this.iServers)
  },
  watch: {
    pageHistory() {
      this.updateServers()
    }
  }
}
</script>
<style scoped>
  .serverList {
    @apply space-y-2;
  }
</style>
