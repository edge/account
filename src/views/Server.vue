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
                <TabPanel>History</TabPanel>
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
      datapoints: {
        cpu_load:[
          {
            datapoints:[
                [
                  10,
                  1642993740
                ],
                [
                  10,
                  1642993800
                ],
                [
                  10,
                  1642993860
                ],
                [
                  10,
                  1642993920
                ],
                [
                  10,
                  1642993980
                ],
                [
                  10,
                  1642994040
                ],
                [
                  10,
                  1642994100
                ],
                [
                  10,
                  1642994160
                ],
                [
                  10,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.cpu.time"
            },
            target:"summarize(round(scale(1.host.100_test2.cpu.time,100),-1),'0min','avg')"
          }
        ],
        mem_usage:[
          {
            datapoints:[
                [
                  209585493.33333337,
                  1642993740
                ],
                [
                  211518805.33333337,
                  1642993800
                ],
                [
                  212429482.66666663,
                  1642993860
                ],
                [
                  210232661.33333337,
                  1642993920
                ],
                [
                  209668778.66666663,
                  1642993980
                ],
                [
                  210301610.66666663,
                  1642994040
                ],
                [
                  209231189.33333337,
                  1642994100
                ],
                [
                  209377962.66666663,
                  1642994160
                ],
                [
                  211016362.66666663,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.mem.available"
            },
            target:"summarize(diffSeries(1.host.100_test2.mem.available, 1.host.100_test2.mem.usable),'0min','avg')"
          }
        ],
        "df.root.used":[
          {
            datapoints:[
                [
                  2585493504,
                  1642993740
                ],
                [
                  2585559040,
                  1642993800
                ],
                [
                  2585559040,
                  1642993860
                ],
                [
                  2585559040,
                  1642993920
                ],
                [
                  2585559040,
                  1642993980
                ],
                [
                  2585559040,
                  1642994040
                ],
                [
                  2585559040,
                  1642994100
                ],
                [
                  2585559040,
                  1642994160
                ],
                [
                  2585591808,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.hdd.allocation"
            },
            target:"summarize(1.host.100_test2.hdd.allocation,'0min','avg')"
          }
        ],
        iops:[
          {
            datapoints:[
                [
                  0.18333333333333335,
                  1642993740
                ],
                [
                  2.216666666666667,
                  1642993800
                ],
                [
                  0.06666666666666667,
                  1642993860
                ],
                [
                  0.05000000000000001,
                  1642993920
                ],
                [
                  2.6833333333333336,
                  1642993980
                ],
                [
                  2.4666666666666663,
                  1642994040
                ],
                [
                  3.266666666666666,
                  1642994100
                ],
                [
                  0.08333333333333333,
                  1642994160
                ],
                [
                  1.8499999999999999,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.hdd.read_req"
            },
            target:"summarize(sumSeries(1.host.100_test2.hdd.{read_req,write_req}),'0min','avg')"
          }
        ],
        net_rx:[
          {
            datapoints:[
                [
                  1100.8166666666668,
                  1642993740
                ],
                [
                  1020.4500000000002,
                  1642993800
                ],
                [
                  968,
                  1642993860
                ],
                [
                  1019.5,
                  1642993920
                ],
                [
                  1146.1,
                  1642993980
                ],
                [
                  1246.1500000000003,
                  1642994040
                ],
                [
                  1040.2666666666667,
                  1642994100
                ],
                [
                  1145,
                  1642994160
                ],
                [
                  1102.05,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.net.net0.rx.bytes.avg"
            },
            target:"summarize(sumSeries(1.host.100_test2.net..rx.bytes.avg),'0min','avg')"
          }
        ],
        net_tx:[
          {
            datapoints:[
                [
                  116.64999999999998,
                  1642993740
                ],
                [
                  14.65,
                  1642993800
                ],
                [
                  11.333333333333334,
                  1642993860
                ],
                [
                  35.5,
                  1642993920
                ],
                [
                  224.9333333333333,
                  1642993980
                ],
                [
                  370.84999999999997,
                  1642994040
                ],
                [
                  70.3,
                  1642994100
                ],
                [
                  9.7,
                  1642994160
                ],
                [
                  168,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.net.net0.tx.bytes.avg"
            },
            target:"summarize(sumSeries(1.host.100_test2.net..tx.bytes.avg),'0min','avg')"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  components: {
    CentOsIcon,
    Line,
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
