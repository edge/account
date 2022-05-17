<template>
  <div class="mainContent__inner" v-if="server">
    <!-- crumbs -->
    <ul class="crumbs">
      <li>
        <router-link to="/">
          Edge Servers
        </router-link>
      </li>
      <li>/</li>
    </ul>

    <!-- title -->
    <div class="flex flex-col items-start sm:space-x-4 sm:items-center sm:flex-row">
      <div class="relative">
        <h1 class="mb-0 leading-none">{{server.settings.hostname}}</h1>
        <span
          class="absolute top-0 block w-2 h-2 rounded-full -right-1"
          :class="server.status === 'active' ? 'bg-green' : 'bg-gray-300'"
        />
      </div>
      <ActiveTask :task=activeTask />
    </div>

    <!-- overview -->
    <div class="flex items-center mt-3 space-x-3 text-gray-500 md:justify-between sm:mt-4">

      <div class="relative flex-1 overflow-hidden">
        <div class="specsGradient" />
        <div class="flex items-center justify-start space-x-2 overflow-auto">
          <div class="flex items-center flex-shrink-0 space-x-1 text-gray-900">
            <UbuntuIcon v-if="formattedOSGroup === 'Ubuntu'" className="server-icon" />
            <CentOsIcon v-if="formattedOSGroup === 'Centos'" className="server-icon" />
            <span class="server-detail">{{ formattedOSGroup }} - {{ this.server.settings.os.version }}</span>
          </div>
          <!-- <span class="text-gray-400 server-detail">/</span> -->
          <!-- <span class="server-detail">{{ server.ip }}</span> -->
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{ server.spec.cpus }} vCPU</span>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{ formattedDisk }} Storage</span>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{ formattedRAM }} RAM</span>
        </div>
      </div>

      <div class="flex-shrink-0">
        <ServerStatus :server="server" :onToggleStatus="toggleServerStatus" />
      </div>

    </div>

    <div class="grid items-start grid-cols-12 mt-12 space-x-10">
      <div class="col-span-12">
        <!-- tabs -->
        <TabGroup
          as="div"
          class="tabGroup"
        >
          <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />
          <TabList class="tabs">
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Overview
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Console
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Resize
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Backups
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Network
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                History
              </button>
            </Tab>
            <Tab v-slot="{selected}">
              <button
                class="pr-10 tab md:pr-0"
                :class="[selected ? 'tab--selected' : '']"
              >
                Destroy
              </button>
            </Tab>
          </TabList>
          <TabPanels class="mt-5">

            <!-- overview -->
            <TabPanel>
              <ServerOverview :server=server :metrics=server.metrics />
            </TabPanel>

            <!-- console -->
            <TabPanel>
              <ServerConsole :server=server />
            </TabPanel>

            <!-- resize -->
            <TabPanel>
              <ServerResize :activeTask=activeTask :server=server :region="region" />
            </TabPanel>

            <!-- backups -->
            <TabPanel>
              <ServerBackups :activeTask=activeTask :server=server />
            </TabPanel>

            <!-- network -->
            <TabPanel>
              <ServerNetworking :activeTask=activeTask :server=server />
            </TabPanel>

            <!-- history -->
            <TabPanel>
              <ServerHistory :data=server.history />
            </TabPanel>

            <!-- destroy -->
            <TabPanel>
              <Destroy :activeTask=activeTask :server=server :onDeleteServer="deleteServer" />
            </TabPanel>

          </TabPanels>
        </TabGroup>
      </div>
    </div>

  </div>

  <!-- shows if server not yet loaded -->
  <div v-else class="mainContent__inner">
    <div class="flex items-center">
      <span>Loading server</span>
      <LoadingSpinner />
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import ActiveTask from '@/components/ActiveTask'
import CentOsIcon from '@/components/icons/Centos'
import Destroy from '@/components/server/Destroy'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ServerBackups from '@/components/server/ServerBackups'
import ServerConsole from '@/components/server/ServerConsole'
import ServerHistory from '@/components/server/ServerHistory'
import ServerNetworking from '@/components/server/ServerNetworking'
import ServerOverview from '@/components/server/ServerOverview'
import ServerResize from '@/components/server/ServerResize'
import ServerStatus from '@/components/server/ServerStatus'
import UbuntuIcon from '@/components/icons/Ubuntu'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Server',
  title() {
    return 'Edge Account Portal » Server'
  },
  data: function () {
    return {
      activeTask: null,
      iCheckServerStatus: null,
      iServer: null,
      loading: false,
      region: null,
      server: null,
      tasks: [],
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  components: {
    ActiveTask,
    CentOsIcon,
    Destroy,
    LoadingSpinner,
    ServerBackups,
    ServerConsole,
    ServerHistory,
    ServerNetworking,
    ServerOverview,
    ServerResize,
    ServerStatus,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    UbuntuIcon
  },
  computed: {
    ...mapState(['account', 'session']),
    serverId() {
      return this.$route.params.id
    },
    formattedDisk() {
      return `${this.server.spec.disk / 1024} GB`
    },
    formattedOSGroup() {
      const group = this.server.settings.os.group
      return group.slice(0, 1).toUpperCase() + group.slice(1)
    },
    formattedRAM() {
      const ram = this.server.spec.ram
      if (ram < 1024) return `${ram} MB`
      return `${ram / 1024} GB`
    }
  },
  methods: {
    ...mapActions(['setVncSettings']),
    async checkServerStatus(statusList) {
      const pendingStatusList = typeof statusList === 'string' ? [statusList] : statusList

      await this.updateServer()
      // whilst server is in process of starting/stopping, check status every 0.5s
      this.iCheckServerStatus = setInterval(async () => {
        await this.updateServer()
        // eslint-disable-next-line max-len
        if (!pendingStatusList.includes(this.server.status)) clearInterval(this.iCheckServerStatus)
      }, 500)
    },
    async deleteServer() {
      try {
        await utils.servers.deleteServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.server._key
        )
        this.checkServerStatus('deleting')
      }
      catch (error) {
        // TODO - handle error
        console.error(error)
      }
    },
    formatActiveTask(data) {
      const task = {
        id: data.id
      }

      if (data.type === 'vm_backup') {
        task.status = 'Backing up VM'
      }

      if (data.type === 'host_create') {
        task.status = 'Creating VM'
      }

      if (data.type === 'host_delete') {
        task.status = 'Destroying VM'
      }

      if (data.type === 'host_change_params') {
        task.status = 'Changing VM parameters'
      }

      if (data.type === 'host_restart') {
        task.status = 'Restarting VM'
      }

      if (data.type === 'host_restore') {
        task.status = 'Restoring VM'
      }

      if (data.type === 'host_start') {
        task.status = 'Starting VM'
      }

      if (data.type === 'host_stop') {
        task.status = 'Stopping VM'
      }

      if (data.type === 'ip_allocate') {
        task.status = 'Adding IP address'
      }

      if (data.type === 'ip_delete') {
        task.status = 'Removing IP address'
      }

      console.log('data', data)

      return task
    },
    async toggleServerStatus() {
      if (this.server.status === 'active') {
        // power off
        await this.stopServer()
      }
      else {
        // power on
        await this.startServer()
      }
    },
    async startServer() {
      await utils.servers.startServer(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.server._key
      )
      this.checkServerStatus(['stopping', 'starting'])
    },
    async stopServer() {
      await utils.servers.stopServer(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.server._key
      )
      this.checkServerStatus(['stopping', 'starting'])
    },
    async updateRegion() {
      const region = await utils.region.getRegion(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.server.region
      )
      this.region = region
    },
    async updateServer() {
      try {
        const server = await utils.servers.getServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        this.server = server
        await this.updateRegion()
        // await this.updateTasks()
      }
      catch (error) {
        // TODO - handle error
        console.error(error)
      }
    }
  },
  async mounted() {
    this.loading = true
    await this.updateServer()
    this.iServer = setInterval(() => {
      this.updateServer()
    }, 5 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iServer)
    this.iServer = null
  }
}
</script>

<style scoped>
  /* crumbs */
  .crumbs {
    @apply flex space-x-2 mb-2 items-center;
  }
  .crumbs li {
    @apply text-gray-400;
  }
  .crumbs li a {
    @apply text-green hover:text-green hover:underline;
  }
  .tabGroup {
    @apply relative;
  }

  .tabs {
    @apply w-full space-x-4 md:space-x-8 border-b border-gray-300 overflow-auto flex flex-nowrap;
  }
  .tab {
    @apply pb-1 font-medium border-b text-gray-500 border-transparent;
    @apply hover:text-black;
  }
  .tab--selected {
    @apply text-green border-green;
    @apply hover:text-green;
  }
  .server-detail {
    @apply flex-shrink-0;
  }
  .server-icon {
    @apply w-4 h-4 text-gray-500 flex-shrink-0;
  }
  .specsGradient {
    @apply absolute top-0 right-0 w-10 h-full pointer-events-none sm:hidden bg-gradient-to-l from-gray-200;
  }
</style>
