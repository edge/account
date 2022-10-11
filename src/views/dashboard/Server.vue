<template>
  <div class="mainContent__inner server" v-if="server">
    <div class="w-max">
      <router-link :to="{ name: 'Servers' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>Servers</span>
      </router-link>
    </div>
    <!-- title -->
    <h1 class="mb-0 leading-none">{{ server.settings.name || server.settings.hostname }}</h1>

    <!-- ip and domain -->
    <div
      class="flex items-center mt-1 text-gray-500 truncate collapse sub-header"
      :class="serverIp ? 'space-x-2' : ''"
    >
      <span>{{ serverIp }}</span>
      <span v-if=serverIp class="divider"/>
      <span class="truncate">{{ server.settings.domain }}</span>
    </div>

    <!-- overview -->
    <div class="flex items-center mt-3 space-x-3 text-gray-500 md:justify-between sm:mt-4 collapse status-row">
      <div class="relative flex-1">
        <div class="flex items-center justify-start space-x-2 collapse server-info">
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
            <span class="divider"/>
            <span class="server-detail">{{ server.spec.bandwidth }} Mbps</span>
          </div>
          <span class="divider"/>
          <div class="flex items-center space-x-1">
            <StatusDot
              :isActive=isActive
              :isInactive=isInactive
              :statusText=statusText
            />
            <!-- eslint-disable-next-line max-len -->
            <Tooltip v-if="server.suspended" position="right" theme="error" text="Your server has been suspended due to unpaid invoices. When you add funds to your account it will automatically restart."
            >
              <InformationCircleIcon class="w-4" />
            </Tooltip>
          </div>
        </div>
      </div>
      <div class="flex-shrink-0" v-if="!isDestroyed && !isCrashed">
        <ServerPowerToggle
          :activeTasks=activeTasks
          :disableActions=disableActions
          :server=server
        />
      </div>

    </div>

    <div class="grid items-start grid-cols-12 mt-4 space-x-10">
      <div class="col-span-12">
        <!-- destroyed -->
        <div v-if=isDestroyed class="box">
          <div class="flex flex-col items-center justify-center text-center">
            <h4>Server Destroyed</h4>
            <p class="mb-0 text-gray-500">This server and all of its associated backups have been destroyed.</p>
            <router-link
              class="mt-4 button button--success button--small"
              :to="{ name: 'Servers' }"
            >
              <span>Return to Servers</span>
            </router-link>
          </div>
        </div>

        <!-- crashed -->
        <div v-else-if=isCrashed  class="box">
          <div class="flex flex-col items-center justify-center text-center">
            <h4>Server Crashed</h4>
            <!-- eslint-disable-next-line max-len -->
            <p class="mb-0 text-gray-500">There was a problem with your server, please either delete and re-deploy the server or contact support@edge.network for assistance.</p>
            <button
              class="mt-4 button button--error button--small w-full md:max-w-xs"
              :disabled="isDestroying || disableActions"
              @click.prevent="toggleDestroyConfirmationModal"
            >
              <div v-if=isDestroying class="flex">
                <span>Destroying</span>
                <span class="ml-2"><LoadingSpinner /></span>
              </div>
              <span v-else>Destroy server</span>
            </button>
          </div>
          <!-- destroy confirmation modal -->
          <DestroyServerConfirmation
            v-if=showDestroyConfirmationModal
            @modal-confirm=destroyServer
            @modal-close=toggleDestroyConfirmationModal
            :serverName="server.settings.name || server.settings.hostname"
          />
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
                Overview
              </button>
            </Tab>
            <!-- <Tab v-slot="{selected}">
              <button
                class="tab"
                :class="[selected ? 'tab--selected' : '']"
              >
                Metrics
              </button>
            </Tab> -->
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
              <ServerOverview
                :activeTasks=activeTasks
                :region=region
                :server=server
              />
            </TabPanel>

            <!-- server metrics -->
            <!-- <TabPanel>
              <ServerMetrics
                :server=server
              />
            </TabPanel> -->

            <!-- console -->
            <!-- <TabPanel>
              <ServerConsole :server=server />
            </TabPanel> -->

            <!-- resize -->
            <TabPanel>
              <ServerResize
                :activeTasks=activeTasks
                :disableActions=disableActions
                :region=region
                :server=server
                @update-region=updateRegion
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
  <div v-else-if=loading class="mainContent__inner server">
    <div class="flex items-center">
      <span>Loading server</span>
      <LoadingSpinner />
    </div>
  </div>

  <div v-else-if=notFound class="mainContent__inner server">
    <div class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Server not found</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This server does not exist or has been destroyed.</p>
        <router-link
          class="mt-4 button button--success button--small"
          :to="{ name: 'Servers'}"
        >
          <span>Return to Servers</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as format from '@/utils/format'
import { ArrowLeftIcon } from '@heroicons/vue/outline'
import DestroyServerConfirmation from '@/components/confirmations/DestroyServerConfirmation'
import DistroIcon from '@/components/icons/DistroIcon'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ProgressBar from '@/components/ProgressBar'
import ServerBackups from '@/components/server/ServerBackups'
// import ServerConsole from '@/components/server/ServerConsole'
import ServerDestroy from '@/components/server/ServerDestroy'
import ServerHistory from '@/components/server/ServerHistory'
// import ServerNetwork from '@/components/server/ServerNetwork'
import ServerOverview from '@/components/server/ServerOverview'
// import ServerMetrics from '@/components/server/ServerMetrics'
import ServerPowerToggle from '@/components/server/ServerPowerToggle'
import ServerResize from '@/components/server/ServerResize'
import StatusDot from '@/components/StatusDot'
import Tooltip from '@/components/Tooltip'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { mapActions, mapState } from 'vuex'

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
      notFound: false,
      region: null,
      selectedIndex: 0,
      server: null,
      showDestroyConfirmationModal: false
    }
  },
  components: {
    ArrowLeftIcon,
    DestroyServerConfirmation,
    DistroIcon,
    InformationCircleIcon,
    LoadingSpinner,
    ProgressBar,
    ServerBackups,
    // ServerConsole,
    ServerDestroy,
    ServerHistory,
    // ServerNetwork,
    // ServerMetrics,
    ServerOverview,
    ServerPowerToggle,
    ServerResize,
    StatusDot,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tooltip
  },
  computed: {
    ...mapState(['account', 'session', 'tasks']),
    activeTasks() {
      return this.$store.getters.tasksByServerId(this.serverId)
    },
    disableActions() {
      return this.activeTasks.length > 0 || this.isDestroyed
    },
    disablingTaskInProgress() {
      // server status and active tasks aren't always 100% in sync
      // these tasks are where the status will be displayed in grey whilst running
      return this.isStopping || this.isStarting || this.isResizing || this.isRestoring
    },
    formattedDisk() {
      return format.mib(this.server.spec.disk)
    },
    formattedRAM() {
      return format.mib(this.server.spec.ram)
    },
    isCrashed() {
      return this.server.status === 'crashed'
    },
    isCreating() {
      return this.activeTasks.some(task => task.action === 'create')
    },
    isActive() {
      return (!this.disablingTaskInProgress) && this.server.status === 'active'
    },
    isDestroyed() {
      return this.server.status === 'deleted' && !this.activeTasks.some(task => task.action === 'destroy')
    },
    isDestroying() {
      return this.activeTasks.some(task => task.action === 'destroy')
    },
    isInactive() {
      // eslint-disable-next-line max-len
      return (!this.disablingTaskInProgress) && (['deleted', 'deleting', 'stopped'].includes(this.server.status) || this.isDestroying || this.isCrashed)
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
    isStarting() {
      return this.activeTasks.some(task => task.action === 'start')
    },
    isStopping() {
      return this.activeTasks.some(task => task.action === 'stop')
    },
    statusText() {
      if (this.isStopping) return 'Stopping'
      if (this.isDestroying) return 'Deleting'
      if (this.isResizing) return 'Resizing'
      if (this.isRestoring) return 'Restoring'
      if (this.isStarting) return 'Starting'
      return this.server.status
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
    async destroyServer() {
      this.isLoading = true
      try {
        this.toggleDestroyConfirmationModal()
        const response = await api.servers.deleteServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        if (response.task) this.$store.commit('addTask', response.task)
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.isLoading = false
        }, 500)
      }
    },
    returnToServers() {
      this.$router.push({ name: 'Servers' })
    },
    toggleDestroyConfirmationModal() {
      this.showDestroyConfirmationModal = !this.showDestroyConfirmationModal
    },
    async updateRegion() {
      try {
        const { region } = await api.region.getRegion(
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
        const { server } = await api.servers.getServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        this.server = server
      }
      catch (error) {
        console.error(error)
        if (error.status === 404) {
          this.loading = false
          this.notFound = true
          clearInterval(this.iServer)
        }
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
.mainContent__inner.server {
  @apply pt-0 mt-6;
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

.box.box--tall {
  @apply py-20 !important;
}

.divider {
  @apply h-4 bg-gray-400 w-px flex-shrink-0;
}


@media (max-width: 450px) {
  .collapse.sub-header {
    @apply flex-col space-x-0 items-start;
  }
  .collapse .divider {
    @apply hidden;
  }
  .collapse .specs {
    @apply flex-col items-start space-x-0
  }
  .collapse .specs .divider {
    @apply hidden;
  }
}

@media (min-width: 450px) and (max-width: 650px) {
  .collapse .specs .divider {
    @apply block
  }
  .collapse.sub-header .divider {
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

@screen md {
  .collapse.server-info {
    @apply flex-col items-start space-x-0 space-y-1;
  }
  .collapse.server-info .divider {
    @apply hidden;
  }
  .collapse .specs .divider {
    @apply block
  }
}

@screen lg {
  .collapse.server-info {
    @apply flex-row items-center space-x-2 space-y-0;
  }
  .collapse.server-info .divider {
    @apply block;
  }
}
</style>
