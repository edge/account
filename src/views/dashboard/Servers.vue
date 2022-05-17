<template>
  <div class="mainContent__inner">
    <h1>Edge Servers</h1>

    <div v-if="loading" class="flex items-center">
      <span>Loading servers</span>
      <LoadingSpinner />
    </div>

    <ul v-else-if="servers.length" role="list" class="serverList">
      <ServerListItem
        v-for="server in servers"
        :key="server._key"
        :server="server"
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
import {  ServerIcon } from '@heroicons/vue/outline'
import ServerListItem from '@/components/ServerListItem'
import { mapState } from 'vuex'

export default {
  name: 'Servers',
  title() {
    return 'Edge Account Portal » Servers'
  },
  components: {
    LoadingSpinner,
    ServerIcon,
    ServerListItem
  },
  data() {
    return {
      loading: false,
      regions: [],
      servers: []
    }
  },
  computed: {
    ...mapState(['account', 'session'])
  },
  methods: {
    getServerRegion(regionId) {
      return this.regions.find(region => region._key == regionId)
    },
    formatDisk(disk) {
      if (disk < 1024) return `${disk} MB`
      return `${disk / 1024} GB`
    },
    formatOSName(os) {
      return os.group.slice(0, 1).toUpperCase() + os.group.slice(1)
    },
    formatOSVersion(os) {
      return os.version
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
        // TODO - handle error
        console.error(error)
      }
    },
    async updateServers() {
      this.loading = true
      try {
        const servers = await utils.servers.getServers(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        await this.updateRegions()
        servers.results.forEach(server => {
          server.region = this.getServerRegion(server.region)
        })
        this.servers = servers.results
      }
      catch (error) {
        // TODO - handle error
        console.error(error)
      }
      this.loading = false
    }
  },
  mounted() {
    this.updateServers()
  }
}
</script>
<style scoped>
  .serverList {
    @apply mt-5 lg:mt-5 space-y-2;
  }
</style>
