<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Edge Servers</h1>
      <router-link
        v-if="servers.length"
        :to="{ name: 'ServerDeploy' }"
        class="button button--success button--small h-full mb-5 sm:mb-0"
      >
        Deploy Server
      </router-link>
    </div>

    <div v-if="!loaded" class="flex items-center">
      <span>Loading servers</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <ul v-else-if="servers.length" role="list" class="serverList">
      <div class="float-right mb-2">
        <ListSortingMenu
          :fields="sortFields"
          :query="sortQuery"
          @update-sort="updateSortQuery"
        />
      </div>
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
          Deploy Server
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import ListSortingMenu from '@/components/ListSortingMenu'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import ServerListItem from '@/components/server/ServerListItem'
import { mapState } from 'vuex'

const sortFields = [
  { label: 'Name', param: 'settings.name'},
  { label: 'Created', param: 'created'},
  { label: 'OS', param: 'settings.os.version'},
  { label: 'vCPUs', param: 'spec.cpus'},
  { label: 'Disk', param: 'spec.disk'},
  { label: 'RAM', param: 'spec.ram'},
  { label: 'Bandwidth', param: 'spec.bandwidth'},
  { label: 'Zone', param: 'region'},
  { label: 'Status', param: 'status' }
]

export default {
  name: 'Servers',
  title() {
    return 'Edge Account Portal » Servers'
  },
  components: {
    ListSortingMenu,
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
      servers: [],
      sortFields: sortFields,
      sortQuery: ''
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
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = this.sortQuery

      const { results, metadata } = await api.servers.getServers(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        params
      )
      this.servers = results
      this.metadata = metadata
      this.loaded = true
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
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
    },
    sortQuery() {
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
