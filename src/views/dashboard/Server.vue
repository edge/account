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
    <h1 class="mb-0 leading-none">{{ server.settings.name ||server.settings.hostname }}</h1>

    <!-- overview -->
    <div class="flex items-center mt-3 space-x-3 text-gray-500 md:justify-between sm:mt-4">

      <div class="relative flex-1 overflow-hidden">
        <div class="specsGradient" />
        <div class="flex items-center justify-start space-x-2 overflow-auto">
          <div class="flex items-center flex-shrink-0 space-x-1 text-gray-900">
            <DistroIcon
              :os="os.group"
              className="server-icon"
            />
            <span class="server-detail">{{ os.version }}</span>
          </div>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{ server.spec.cpus }} vCPU</span>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{ formattedDisk }} Disk</span>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{ formattedRAM }} RAM</span>
          <span class="text-gray-400 server-detail">/</span>
          <div
            class="flex items-center"
            :class="[
              isActive ? 'active' : '',
              isInactive ? 'inactive' : ''
            ]"
          >
            <span class="serverList__statusDot" />
            <span class="serverList__statusText capitalize">{{ server.status }}</span>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0">
        <ServerStatus :activeTasks=activeTasks :server=server />
      </div>

    </div>

    <div class="grid items-start grid-cols-12 mt-12 space-x-10">
      <div class="col-span-12">
        <div v-if=serverDestroyed class="box">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="flex items-center mt-4">
              <ExclamationIcon class="text-red h-5 mr-2" />
              <h4>Server Destroyed</h4>
            </div>
            <p class="mt-3 mb-1 text-gray-500">This server and all of its associated backups have been destroyed.</p>
            <button
              class="mt-4 button button--success"
              @click.prevent="returnToServers"
            >
              <span>Return to Servers</span>
            </button>
          </div>
        </div>

        <!-- action in progress section -->
        <div v-else-if="creating || destroying || resizing" class="box box--tall">
          <div class="flex flex-col items-center justify-center text-center">
            <h4 class="mt-4">{{ progressTitle }}</h4>
            <p class="mt-2 mb-0 text-gray-500">{{ progressMessage }}</p>
            <div class="mt-4"><ProgressBar :red="destroying" /></div>
          </div>
        </div>

        <!-- tabs -->
        <TabGroup
          v-else
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
            <!-- <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Network
              </button>
            </Tab> -->
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
              <ServerResize :activeTasks=activeTasks :server=server :region=region />
            </TabPanel>

            <!-- backups -->
            <TabPanel>
              <ServerBackups :activeTasks=activeTasks :server=server />
            </TabPanel>

            <!-- network -->
            <!-- <TabPanel>
              <ServerNetwork
                :activeTasks=activeTasks
                :addIP=addIPAddress
                :deleteIP=deleteIPAddress
                :server=server
              />
            </TabPanel> -->

            <!-- history -->
            <TabPanel>
              <ServerHistory :tasks=serverTasks />
            </TabPanel>

            <!-- destroy -->
            <TabPanel>
              <ServerDestroy :activeTasks=activeTasks :server=server />
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
// import ActiveTask from '@/components/ActiveTask'
import DistroIcon from '@/components/icons/DistroIcon'
import { ExclamationIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ProgressBar from '@/components/ProgressBar'
import ServerBackups from '@/components/server/ServerBackups'
import ServerConsole from '@/components/server/ServerConsole'
import ServerDestroy from '@/components/server/ServerDestroy'
import ServerHistory from '@/components/server/ServerHistory'
// import ServerNetwork from '@/components/server/ServerNetwork'
import ServerOverview from '@/components/server/ServerOverview'
import ServerResize from '@/components/server/ServerResize'
import ServerStatus from '@/components/server/ServerStatus'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Server',
  title() {
    return 'Edge Account Portal » Server'
  },
  data: function () {
    return {
      iCheckServerStatus: null,
      iServer: null,
      loading: false,
      region: null,
      server: null
    }
  },
  components: {
    // ActiveTask,
    DistroIcon,
    ExclamationIcon,
    ServerDestroy,
    LoadingSpinner,
    ProgressBar,
    ServerBackups,
    ServerConsole,
    ServerHistory,
    // ServerNetwork,
    ServerOverview,
    ServerResize,
    ServerStatus,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel
  },
  computed: {
    ...mapState(['account', 'session', 'tasks']),
    activeTasks() {
      return this.$store.getters.tasksByServerId(this.serverId)
    },
    creating() {
      return this.activeTasks.some(task => task.action === 'create')
    },
    destroying() {
      return this.activeTasks.some(task => task.action === 'destroy')
    },
    formattedDisk() {
      return `${this.server.spec.disk / 1024} GB`
    },
    formattedRAM() {
      const ram = this.server.spec.ram
      if (ram < 1024) return `${ram} MB`
      return `${ram / 1024} GB`
    },
    isActive() {
      return this.server.status === 'active'
    },
    isInactive() {
      return this.server.status === 'stopped' || this.server.status === 'crashed'
    },
    os() {
      return this.server.settings.os
    },
    progressMessage() {
      // eslint-disable-next-line max-len
      if (this.creating) return 'Server metrics and other information will be displayed here once deployment is complete.'
      // eslint-disable-next-line max-len
      if (this.destroying) return 'All server data and associated backups are being destroyed. Upon destruction, you will no longer be billed for this server.'
      // eslint-disable-next-line max-len
      if (this.resizing) return 'Server metrics and other information will be available again once server resize is complete.'
      else return ''
    },
    progressTitle() {
      if (this.creating) return 'Deploying your new server'
      if (this.destroying) return 'Destroying your server'
      if (this.resizing) return 'Resizing your server'
      else return ''
    },
    resizing() {
      const diskResize = this.activeTasks.some(task => task.action === 'resizeDisk')
      const resourceResize = this.activeTasks.some(task => task.action === 'resizeResource')
      return diskResize || resourceResize
    },
    serverDestroyed() {
      return this.server.status === 'deleted'
    },
    serverId() {
      return this.$route.params.id
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
    returnToServers() {
      this.$router.push({ name: 'Servers' })
    },
    async updateRegion() {
      try {
        const region = await utils.region.getRegion(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.server.region
        )
        this.region = region
      }
      catch (error) {
        console.error(error)
      }
    },
    async updateServer() {
      try {
        const server = await utils.servers.getServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        this.server = server
        await this.updateTasks()
      }
      catch (error) {
        console.error(error)
      }
    },
    async updateTasks() {
      try {
        const tasks = await utils.servers.getTasks(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        this.serverTasks = tasks.results
      }
      catch (error) {
        console.error(error)
      }
    }
  },
  async mounted() {
    this.loading = true
    await this.updateServer()
    await this.updateRegion()
    this.iServer = setInterval(() => {
      this.updateServer()
    }, 5 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iServer)
    this.iServer = null
  },
  watch: {
    tasks() {
      this.updateServer()
    }
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

.box {
  @apply p-4 md:p-6 bg-white rounded-lg w-full;
}
.box.box--tall {
  @apply py-20 !important;
}

/* status dot */
.serverList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.active .serverList__statusDot {
  @apply bg-green;
}
.inactive .serverList__statusDot {
  @apply bg-red;
}
.active .serverList__statusText {
  @apply text-green;
}
.inactive .serverList__statusText {
  @apply text-red;
}
</style>
