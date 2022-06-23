<template>
  <div class="mainContent__inner" v-if="server">
    <!-- title -->
    <h1 class="mb-0 leading-none">{{ server.settings.name ||server.settings.hostname }}</h1>

    <span v-if="disableActions"></span>

    <!-- ip and domain -->
    <div class="flex items-center space-x-2 mt-1 text-gray-500 truncate collapse sub-header">
      <span>{{ serverIp }}</span>
      <span v-if=serverIp class="divider"/>
      <span class="truncate">{{ server.settings.domain }}</span>
    </div>

    <!-- overview -->
    <div class="flex items-center mt-3 space-x-3 text-gray-500 md:justify-between sm:mt-4 collapse status-row">
      <div class="relative flex-1 overflow-hidden">
        <div class="flex items-center justify-start space-x-2 overflow-auto collapse server-info">
          <div class="flex items-center flex-shrink-0 space-x-1 text-gray-900">
            <DistroIcon
              :os="os.group"
              className="server-icon"
            />
            <span class="server-detail">{{ os.version }}</span>
          </div>
          <span class="divider"/>
          <div class="flex items-center space-x-2 flex-shrink-0 specs">
            <span class="server-detail">{{ server.spec.cpus }} vCPU</span>
            <span class="divider"/>
            <span class="server-detail">{{ formattedDisk }} Disk</span>
            <span class="divider"/>
            <span class="server-detail">{{ formattedRAM }} RAM</span>
          </div>
          <span class="divider"/>
          <ServerStatus :server=server />
        </div>
      </div>
      <div class="flex-shrink-0">
        <ServerPowerToggle
          :activeTasks=activeTasks
          :disableActions=disableActions
          :server=server
        />
      </div>

    </div>

    <div class="grid items-start grid-cols-12 mt-4 space-x-10">
      <div class="col-span-12">
        <div v-if=isDestroyed class="box">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="flex items-center mt-4">
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
        <div v-else-if="isCreating || isDestroying || isResizing" class="box box--tall">
          <div class="flex flex-col items-center justify-center text-center">
            <h4 class="mt-4">{{ progressTitle }}</h4>
            <p class="mt-2 mb-0 text-gray-500">This may take a few minutes. Feel free to close this page.</p>
            <div class="mt-4 max-w-full"><ProgressBar :red="isDestroying" /></div>
          </div>
        </div>

        <!-- tabs -->
        <TabGroup
          v-else
          as="div"
          class="tabGroup"
        >
          <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />
          <TabList class="tabs pr-6">
            <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Metrics
              </button>
            </Tab>
            <!-- <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Console
              </button>
            </Tab> -->
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
                class="tab md:pr-0"
                :class="[selected ? 'tab--selected' : '']"
              >
                Destroy
              </button>
            </Tab>
          </TabList>

          <TabPanels class="mt-5">
            <!-- overview -->
            <TabPanel>
              <ServerMetrics
                :server=server
              />
            </TabPanel>

            <!-- console -->
            <!-- <TabPanel>
              <ServerConsole :server=server />
            </TabPanel> -->

            <!-- resize -->
            <TabPanel>
              <ServerResize
                :activeTasks=activeTasks
                :disableActions=disableActions
                :server=server
                :region=region
              />
            </TabPanel>

            <!-- backups -->
            <TabPanel>
              <ServerBackups
                :activeTasks=activeTasks
                :backups=backups
                :disableActions=disableActions
                :server=server
              />
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
              <ServerHistory />
            </TabPanel>

            <!-- destroy -->
            <TabPanel>
              <ServerDestroy
                :activeTasks=activeTasks
                :disableActions=disableActions
                :server=server
              />
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
import DistroIcon from '@/components/icons/DistroIcon'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ProgressBar from '@/components/ProgressBar'
import ServerBackups from '@/components/server/ServerBackups'
// import ServerConsole from '@/components/server/ServerConsole'
import ServerDestroy from '@/components/server/ServerDestroy'
import ServerHistory from '@/components/server/ServerHistory'
// import ServerNetwork from '@/components/server/ServerNetwork'
import ServerMetrics from '@/components/server/ServerMetrics'
import ServerPowerToggle from '@/components/server/ServerPowerToggle'
import ServerResize from '@/components/server/ServerResize'
import ServerStatus from '@/components/server/ServerStatus'
import moment from 'moment'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { mapActions, mapState } from 'vuex'

moment.locale('en-GB')

export default {
  name: 'Server',
  title() {
    return 'Edge Account Portal » Server'
  },
  data: function () {
    return {
      backups: [],
      iCheckServerStatus: null,
      iServer: null,
      isUpdatingBackups: false,
      loadedBackups: false,
      loading: false,
      region: null,
      server: null
    }
  },
  components: {
    DistroIcon,
    ServerDestroy,
    LoadingSpinner,
    ProgressBar,
    ServerBackups,
    // ServerConsole,
    ServerHistory,
    // ServerNetwork,
    ServerMetrics,
    ServerPowerToggle,
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
    disableActions() {
      return this.activeTasks.length > 0 || this.isDestroyed
    },
    formattedDisk() {
      return `${this.server.spec.disk / 1024} GB`
    },
    formattedRAM() {
      const ram = this.server.spec.ram
      if (ram < 1024) return `${ram} MB`
      return `${ram / 1024} GB`
    },
    isCreating() {
      return this.activeTasks.some(task => task.action === 'create')
    },
    isDestroyed() {
      return this.server.status === 'deleted'
    },
    isDestroying() {
      return this.activeTasks.some(task => task.action === 'destroy')
    },
    isLoadingBackups() {
      if (this.backups.length) return false
      return this.isUpdatingBackups
    },
    isResizing() {
      const diskResize = this.activeTasks.some(task => task.action === 'resizeDisk')
      const resourceResize = this.activeTasks.some(task => task.action === 'resizeResource')
      return diskResize || resourceResize
    },
    isRestoring() {
      return this.activeTasks.some(task => task.action === 'restoreBackup')
    },
    os() {
      return this.server.settings.os
    },
    progressTitle() {
      if (this.isCreating) return 'Deploying your new server'
      if (this.isDestroying) return 'Destroying your server'
      if (this.isResizing) return 'Resizing your server'
      if (this.isRestoring) return 'Restoring backup'
      else return ''
    },
    serverId() {
      return this.$route.params.id
    },
    serverIp() {
      if (this.server.network) return this.server.network.ip[0]
      return ''
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
  @apply absolute top-0 right-0 w-10 h-full pointer-events-none bg-gradient-to-l from-gray-200;
}

.box {
  @apply p-4 md:p-6 bg-white rounded-lg w-full;
}
.box.box--tall {
  @apply py-20 !important;
}

.divider {
  @apply h-4 bg-gray-400 w-px flex-shrink-0;
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

@media (max-width: 350px) {
  .collapse .specs {
    @apply flex-col items-start space-x-0
  }

  .collapse .specs .divider {
    @apply hidden;
  }
}

@media (max-width: 450px) {
  .collapse.sub-header {
    @apply flex-col space-x-0 items-start;
  }
  .collapse .divider {
    @apply hidden;
  }
}

@media (min-width: 350px) and (max-width: 650px) {
  .collapse .specs .divider {
    @apply block
  }
}

@media (max-width: 650px) {
  .collapse.server-info {
    @apply flex-col items-start space-x-0 space-y-1;
  }

  .collapse .sub-header {
    @apply flex-col space-x-0 items-start;
  }
  .collapse .divider {
    @apply hidden;
  }
}
</style>
