<template>
  <div class="flex w-full min-h-screen">
    <SideNavigation />
    <main class="flex flex-col w-full mainContent">
      <TopNavigation />

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
            <h1 class="mb-0 leading-none">{{server.name}}</h1>
            <span
              class="absolute top-0 block w-2 h-2 rounded-full -right-1"
              :class="server.status === 'active' ? 'bg-green' : 'bg-gray-300'"
            />
          </div>
          <ActiveTask status="Changing the VM parameters" />
          {{tasks}}
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
            <ServerStatus :currentStatus="server.status" :onToggleStatus="toggleServerStatus" />
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
                  <ServerOverview :metrics=server.metrics />
                </TabPanel>

                <!-- console -->
                <TabPanel>Console</TabPanel>

                <!-- resize -->
                <TabPanel>
                  <ServerResize :server=server />
                </TabPanel>

                <!-- backups -->
                <TabPanel>
                  <ServerBackups :server=server />
                </TabPanel>

                <!-- network -->
                <TabPanel>Network</TabPanel>

                <!-- history -->
                <TabPanel>
                  <ServerHistory :data=server.history />
                </TabPanel>

                <!-- destroy -->
                <TabPanel>
                  <Destroy />
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

    </main>
  </div>
</template>

<script>
import ActiveTask from "@/components/ActiveTask"
import CentOsIcon from '@/components/icons/Centos'
import Destroy from "@/components/server/Destroy"
import Line from "@/components/charts/Line"
import ServerBackups from "@/components/server/ServerBackups"
import ServerHistory from "@/components/server/ServerHistory"
import ServerOverview from "@/components/server/ServerOverview"
import ServerResize from "@/components/server/ServerResize"
import ServerStatus from "@/components/server/ServerStatus"
import SideNavigation from "@/components/SideNavigation"
import TopNavigation from "@/components/TopNavigation"
import UbuntuIcon from '@/components/icons/Ubuntu'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

import { useRoute } from 'vue-router'
import useSWRV from 'swrv'
import { fetcher } from '../utils/api'
import { mapMutations, mapState } from 'vuex'
import { onMounted, onUnmounted } from 'vue'
import { startStopHost } from '../utils/api'

export default {
  name: 'Server',
  title() {
    return 'Edge Account Portal » Server XXX'
  },
  data: function () {
    return {
      loading: false,
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
    ServerHistory,
    ServerOverview,
    ServerResize,
    ServerStatus,
    SideNavigation,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TopNavigation,
    UbuntuIcon
  },
  computed: {
    // ...mapState(['tasks'])
  },
  methods: {
    async toggleServerStatus() {
      console.log('this.server', this.server)
      if (this.server.status === 'active') {
        // Power off.
        await startStopHost(this.server.id, 'stop')
      } else {
        // Power on.
        await startStopHost(this.server.id, 'start')
      }
    }
  },
  mounted() {
    this.loading = true
  },
  setup() {
    const route = useRoute()
    const { data: server, error: serverFetchError } = useSWRV(() => '/servers?slug=' + route.params.slug, fetcher)
    const { data: tasks, error: taskFetchError, mutate } = useSWRV(() => '/tasks?id=' + route.params.slug, fetcher)

    let polling

    onMounted(() => {
      console.log('mounted!')
      polling = setInterval(() => {
        console.log('Mutating')
        mutate()
      }, 5000)
    })
    
    onUnmounted(() => {
      console.log('unmounted!')
      clearInterval(polling)
      polling = null
    })

    return {
      server,
      tasks
    }
  },
  watch: {
    $route(to, from) {
    }
  }
}
</script>
<style scoped>
  .mainContent {
    @apply relative flex-1;
  }
  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-7;
  }

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
