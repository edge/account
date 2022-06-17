<template>
  <div class="mainContent__inner">
    <h1>Edge Servers</h1>

    <div v-if="loading && !servers.length" class="flex items-center">
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

    <div v-else class="">
      <p>You haven't deployed any servers yet. Once you deploy your first server it will be available here.</p>
      <button class="button button--success" @click="$router.push('/servers/deploy')">
        <ServerIcon class="w-5 h-5 mr-2"/>
        <span>Deploy your first server</span>
      </button>
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { ServerIcon } from '@heroicons/vue/outline'
import ServerListItem from '@/components/ServerListItem'
import { mapState } from 'vuex'

export default {
  name: 'Servers',
  title() {
    return 'Edge Account Portal » Servers'
  },
  components: {
    LoadingSpinner,
    Pagination,
    ServerIcon,
    ServerListItem
  },
  data() {
    return {
      iServers: null,
      limit: 10,
      loading: false,
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
      try {
        const regions = await utils.region.getRegions(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        this.regions = regions.results
      }
      catch (error) {
        console.error(error)
      }
    },
    async updateServers() {
      this.loading = true
      try {
        const servers = await utils.servers.getServers(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
            limit: this.limit,
            page: this.currentPage
          }
        )
        this.servers = servers.results
        this.metadata = servers.metadata
      }
      catch (error) {
        console.error(error)
      }
      this.loading = false
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
    @apply mt-5 lg:mt-5 space-y-2;
  }
</style>
