<template>
  <div class="flex w-full min-h-screen">
    <SideNavigation />
    <main class="flex flex-col mainContent">
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
        <h1>{{server.name}}</h1>

        <!-- overview -->
        <div class="flex items-center space-x-3 text-gray-500">
          <div class="flex items-center px-2 py-1 space-x-2 border rounded bg-green bg-opacity-10 border-green">
            <span class="block w-2 h-2 rounded-full bg-green"></span>
            <span class="text-xs text-green">online</span>
          </div>
          <div class="flex items-center justify-center space-x-1">
            <UbuntuIcon v-if="server.os === 'ubuntu'" className="w-4 h-4 text-gray-400" />
            <CentOsIcon v-if="server.os === 'centos'" className="w-4 h-4 text-gray-400" />
            <span>{{server.os}} {{server.osVersion}}</span>
          </div>
          <span class="text-gray-400">/</span>
          <span>{{server.ip}}</span>
          <span class="text-gray-400">/</span>
          <span>{{server.cpu}}</span>
          <span class="text-gray-400">/</span>
          <span>{{server.storage}} storage</span>
          <span class="text-gray-400">/</span>
          <span>{{server.memory}} RAM</span>
        </div>

        <div class="grid items-start grid-cols-12 mt-12 space-x-10">
          <div class="col-span-12">
            <!-- tabs -->
            <TabGroup
              as="div"
            >
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
              </TabList>
              <TabPanels class="mt-5">
                
                <!-- overview -->
                <TabPanel>
                  <ServerOverview />
                </TabPanel>

                <!-- console -->
                <TabPanel>Console</TabPanel>

                <!-- resize -->
                <TabPanel>
                  <ServerResize />
                </TabPanel>

                <TabPanel>Backups</TabPanel>
                <TabPanel>Network</TabPanel>
                <TabPanel>
                  <ServerHistory />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
          <!-- <div class="hidden col-span-3 lg:block">
            <Summary/>
          </div> -->
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import CentOsIcon from '@/components/icons/Centos'
import Line from "@/components/charts/Line"
import ServerHistory from "@/components/server/ServerHistory"
import ServerOverview from "@/components/server/ServerOverview"
import ServerResize from "@/components/server/ServerResize"
import SideNavigation from "@/components/SideNavigation"
import Summary from "@/components/Summary"
import TopNavigation from "@/components/TopNavigation"
import UbuntuIcon from '@/components/icons/Ubuntu'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

import { useRoute } from 'vue-router'
import useSWRV from 'swrv'
import { fetcher } from '../utils/api'

export default {
  name: 'Server',
  title() {
    return 'Edge Account Portal » Server XXX'
  },
  data: function () {
    return {
      // blockMetadata: null,
      // blocks: [],
      // transactionMetadata: null,
      // transactions: [],
      loading: false,
      // pollInterval: 10000,
      // polling: null,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  components: {
    CentOsIcon,
    Line,
    ServerHistory,
    ServerOverview,
    ServerResize,
    SideNavigation,
    Summary,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TopNavigation,
    UbuntuIcon
  },
  mounted() {
    this.loading = true
    // this.fetchBlocks()
    // this.fetchTransactions()
    // this.pollData()
  },
  setup() {
    const route = useRoute()
    const { data: server, error } = useSWRV(() => '/servers?slug=' + route.params.slug, fetcher)

    return {
      server
    }
  },
  watch: {
    $route(to, from) {
      // clearInterval(this.polling)
      // this.polling = null
    }
  },
  methods: {

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

  .tabs {
    @apply flex w-full space-x-8 border-b border-gray-300;
  }
  .tab {
    @apply pb-1 font-medium border-b text-gray-500 border-transparent;
  }
  .tab--selected {
    @apply text-black border-black;
  }
</style>
