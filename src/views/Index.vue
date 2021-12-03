<template>
  <div class="flex w-full min-h-screen">
    <SideNavigation />
    <main class="flex flex-col mainContent">
      <TopNavigation />

      <!-- if no servers yet created -->
      <div class="flex flex-col justify-center flex-1 hidden w-full max-w-lg mx-auto my-auto text-center">
        <div class="pt-0 border-opacity-50 rounded-md border-green">
          <span class="inline-block px-5 uppercase bg-gray-200 text-green loose">Your new account number!</span>
          <h1 class="mt-1">3333 8107 9773 1616</h1>
        </div>
        <p class="mt-1 text-gray-500">Write down your account number. It’s all you need to access the Edge Network. No email, no username.</p>
        <div class="flex justify-center mt-2 space-x-4">
          <button class="button button--outline-success text-green hover:text-white">
            <ShieldCheckIcon class="w-5 h-5 mr-2"/>
            <span>Enable 2FA</span>
          </button>
          <button class="button button--success">
            <ServerIcon class="w-5 h-5 mr-2"/>
            <span>Deploy your first server</span>
          </button>
        </div>
      </div>

      <!-- if servers exist -->
      <div class="mainContent__inner">
        <h1>Edge Servers</h1>

        <ul role="list" class="serverList">
          <li
            v-for="server in servers" :key="server.name"
            class="serverList__item"
            :class="[server.status]"
          >
            <span class="serverList__status" :class="[server.status]" />
            <div class="serverList__main">
              <router-link class="serverList__name" :to="'/server/'+ server.name">
                {{ server.name }}
              </router-link>
              <div class="serverList__stats">
                <span>{{ server.cpu }}</span>
                <span class="text-gray-400">/</span>
                <span>{{ server.storage }} disk</span>
                <span class="text-gray-400">/</span>
                <span>{{ server.memory }} RAM</span>
              </div>
            </div>
            <div class="flex items-center justify-center space-x-1 serverList__cell">
              <UbuntuIcon @click="increment" v-if="server.os === 'ubuntu'" className="w-5 h-5 text-gray-400" />
              <CentOsIcon v-if="server.os === 'centos'" className="w-5 h-5 text-gray-400" />
              <span @click="() => selectOsVersion(server.osVersion)">{{ server.os }} {{ server.osVersion }}</span>
            </div>
            <span class="text-center serverList__cell">{{ server.ip }}</span>
            <div class="flex items-center justify-end serverList__cell">
              {{ server.region }}
              <img :src=server.flag width="25" class="ml-2 rounded-sm" />
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script>
import CentOsIcon from '@/components/icons/Centos'
import SideNavigation from "@/components/SideNavigation"
import TopNavigation from "@/components/TopNavigation"
import UbuntuIcon from '@/components/icons/Ubuntu'
import { CloudUploadIcon, ServerIcon, ShieldCheckIcon } from '@heroicons/vue/outline'

import useSWRV from 'swrv'
import { fetcher } from '../utils/api'

import { mapState } from 'vuex'

//     {
//     name: 'forest_tamarite',
//     ip: '185.167.216.33',
//     os: 'ubuntu',
//     location: 'London #1',
//     cpu: '2 vCPU',
//     storage: '20GB',
//     memory: '1GB',
//     status: 'active',
//     flag: '/assets/images/flag_uk.png'
//   }

export default {
  name: 'Index',
  title() {
    return 'Edge Account Portal » Index'
  },
  // data: function () {
  //   return {
  //     // blockMetadata: null,
  //     // blocks: [],
  //     // transactionMetadata: null,
  //     // transactions: [],
  //     loading: false
  //     // pollInterval: 10000,
  //     // polling: null
  //   }
  // },
  components: {
    CentOsIcon,
    CloudUploadIcon,
    ServerIcon,
    ShieldCheckIcon,
    SideNavigation,
    TopNavigation,
    UbuntuIcon
  },
  computed: {
    ...mapState(['count', 'osVersion', 'serverRegion'])
  },
  methods: {
    increment() {
      this.$store.commit('increment', { amount: 11 })
    },
    selectOsVersion(value) {
      this.$store.commit('selectServerProperty', { property: 'osVersion', value })
    }
  },
  setup() {
    const { data: servers, error } = useSWRV('/servers', fetcher)

    return {
      servers
    }
  },
  watch: {
    $route(to, from) {
      // clearInterval(this.polling)
      // this.polling = null
    }
  }
}
</script>
<style scoped>
  .mainContent {
    @apply relative flex-1;
  }
  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-8;
  }

  /* the list */
  .serverList {
    @apply mt-5 lg:mt-5 space-y-2;
  }

  /* the list item */
  .serverList__item {
    @apply relative flex items-center justify-between bg-white rounded-md w-full p-5 pr-12;
  }
  .serverList__item.active {
    @apply border-green;
  }
  .serverList__item.inactive {
    @apply border-red;
  }

  /* status dot */
  .serverList__status {
    @apply w-2.5 h-2.5 rounded-full block absolute right-5;
  }
  .serverList__status.active {
    @apply bg-green;
  }
  .serverList__status.inactive {
    @apply bg-red;
  }

  /* first col (multi line) */
  .serverList__main {
    @apply w-1/4 text-gray-500 flex flex-col space-y-0.5;
  }
  .serverList__name {
    @apply text-green text-base font-medium truncate w-full hover:underline;
  }
  .serverList__stats {
    @apply flex space-x-1.5 text-xs;
  }

  /* standard cell */
  .serverList__cell {
    @apply text-gray-500 text-sm w-1/4 truncate;
  }
</style>
