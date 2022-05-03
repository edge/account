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
        <h1 class="mb-0 leading-none">{{server.hostname}}</h1>
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
            <UbuntuIcon v-if="server.os === 'ubuntu'" className="server-icon" />
            <CentOsIcon v-if="server.os === 'centos'" className="server-icon" />
            <span class="server-detail">{{server.os}} {{server.osVersion}}</span>
          </div>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{server.ip}}</span>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{server.cpu}}</span>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{server.storage}} storage</span>
          <span class="text-gray-400 server-detail">/</span>
          <span class="server-detail">{{server.memory}} RAM</span>
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
              <ServerResize :activeTask=activeTask :server=server />
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
              <Destroy :activeTask=activeTask :server=server />
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
      <svg class="w-4 ml-1 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <line x1="12" y1="6" x2="12" y2="3" />
        <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
        <line x1="18" y1="12" x2="21" y2="12" />
        <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
        <line x1="12" y1="18" x2="12" y2="21" />
        <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
        <line x1="6" y1="12" x2="3" y2="12" />
        <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
      </svg>
    </div>
  </div>
</template>

<script>
import ActiveTask from "@/components/ActiveTask"
import CentOsIcon from '@/components/icons/Centos'
import Destroy from "@/components/server/Destroy"
import Line from "@/components/charts/Line"
import ServerBackups from "@/components/server/ServerBackups"
import ServerConsole from "@/components/server/ServerConsole"
import ServerHistory from "@/components/server/ServerHistory"
import ServerNetworking from "@/components/server/ServerNetworking"
import ServerOverview from "@/components/server/ServerOverview"
import ServerResize from "@/components/server/ServerResize"
import ServerStatus from "@/components/server/ServerStatus"
import UbuntuIcon from '@/components/icons/Ubuntu'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

import { useRoute } from 'vue-router'
import useSWRV from 'swrv'
import { fetcher } from '../../utils/api'
import { mapActions } from 'vuex'
import { startStopHost } from '../../utils/api'

export default {
  name: 'Server',
  title() {
    return 'Edge Account Portal » Server'
  },
  data: function () {
    return {
      activeTask: null,
      loading: false,
      polling: null,
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
    Line,
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
  methods: {
    ...mapActions(['setVncSettings']),
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
        // Power off.
        await startStopHost(this.server.serverId, 'stop')
      } else {
        // Power on.
        await startStopHost(this.server.serverId, 'start')
      }
    }
  },
  mounted() {
    this.loading = true
    const route = useRoute()
    const { data: server, error: serverFetchError, mutate: refetchServer } = useSWRV(() => '/servers?id=' + (route.params.id || this.server.id), fetcher)
    const { data: tasks, error: taskFetchError, mutate: refetchTasks } = useSWRV(() => '/tasks?id=' + route.params.id, fetcher)

    this.server = server
    this.tasks = tasks.value

    this.polling = setInterval(() => {
      console.log('Mutating')
      refetchServer()
      refetchTasks()

      this.server = server
      this.tasks = tasks.value

      if (this.server) {
        this.setVncSettings(this.server.vnc_settings)
      }
      
      if (this.tasks[0]) {
        this.activeTask = this.formatActiveTask(this.tasks[0])
      } else {
        this.activeTask = null
      }
    }, 10000)
  },
  unmounted() {
    clearInterval(this.polling)
    this.polling = null
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