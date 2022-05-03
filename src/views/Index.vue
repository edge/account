<template>
  <!-- if no servers yet created -->
  <div v-if="servers && servers.length === 0" class="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto my-auto text-center">
    <div class="pt-0 border-opacity-50 rounded-md border-green">
      <span class="inline-block px-5 uppercase bg-gray-200 text-green loose">Your new account number!</span>
      <h1 class="mt-1">{{user && user.accountNumber}}</h1>
    </div>
    <p class="mt-1 text-gray-500">Write down your account number. It’s all you need to access the Edge Network. No email, no username.</p>
    <div class="flex justify-center mt-2 space-x-4">
      <router-link
        v-if="user && !user.totp"
        to="/account"
        class="button button--outline-success text-green hover:text-white"
      >
        <ShieldCheckIcon class="w-5 h-5 mr-2"/>
        <span>Setup 2FA</span>
      </router-link>
      <button class="button button--success" @click="$router.push('/servers/deploy')">
        <ServerIcon class="w-5 h-5 mr-2"/>
        <span>Deploy your first server</span>
      </button>
    </div>
  </div>

  <!-- if servers exist -->
  <div v-if="servers && servers.length > 0" class="mainContent__inner">
    <h1>Edge Servers</h1>

    <ul v-if="servers" role="list" class="serverList">
      <li
        v-for="server in servers" :key="server.name"
        class="serverList__item"
        :class="[server.status]"
      >
        <span class="serverList__status" :class="[server.status]" />
        
        <div class="serverList__main">
          <router-link class="serverList__name" :to="'/server/'+ server.id">
            {{ server.hostname }}
          </router-link>
          <div class="serverList__stats">
            <span>{{ server.cpu }}</span>
            <span class="text-gray-400">/</span>
            <span>{{ server.storage }} disk</span>
            <span class="text-gray-400">/</span>
            <span>{{ server.memory }} RAM</span>
          </div>
        </div>
        <div class="flex items-center flex-shrink-0 mt-3 space-x-5 lg:space-x-0 lg:flex-1 lg:mt-0 lg:justify-between">
          <div class="flex items-center space-x-1 lg:justify-center serverList__cell">
            <UbuntuIcon v-if="server.os === 'ubuntu'" className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <CentOsIcon v-if="server.os === 'centos'" className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>{{`${server.os.charAt(0).toUpperCase()}${server.os.substring(1)}`}} {{ server.osVersion }}</span>
          </div>
          <span class="lg:text-center serverList__cell">{{ server.ip }}</span>
          <div class="flex items-center lg:justify-end serverList__cell">
            {{ server.region.name }}
            <img :src=server.region.flagIcon[0].url width="25" class="ml-2 rounded-sm" />
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="flex items-center">
      <span>Loading servers</span>
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
import CentOsIcon from '@/components/icons/Centos'
import UbuntuIcon from '@/components/icons/Ubuntu'
import { CloudUploadIcon, ServerIcon, ShieldCheckIcon } from '@heroicons/vue/outline'

import { fetcher } from '../utils/api'
import { mapGetters } from 'vuex'
import useSWRV from 'swrv'

export default {
  name: 'Index',
  title() {
    return 'Edge Account Portal » Index'
  },
  components: {
    CentOsIcon,
    CloudUploadIcon,
    ServerIcon,
    ShieldCheckIcon,
    UbuntuIcon
  },
  computed: {
    ...mapGetters({
      user: 'auth/StateUser'
    })
  },
  data() {
    return {
      servers: []
    }
  },
  methods: {
  },
  mounted() {
    const { data, error } = useSWRV(() => `/servers?userId=${this.user ? this.user._id : "XX"}`, fetcher)

    this.servers = data
  }
}
</script>
<style scoped>
  /* the list */
  .serverList {
    @apply mt-5 lg:mt-5 space-y-2;
  }

  /* the list item */
  .serverList__item {
    @apply relative flex flex-wrap flex-col lg:flex-row  lg:items-center justify-between bg-white rounded-md w-full p-5 lg:pr-12;
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
    @apply lg:w-1/4 text-gray-500 flex flex-col space-y-0.5 flex-shrink-0;
  }
  .serverList__name {
    @apply text-green text-base font-medium truncate w-full hover:underline;
  }
  .serverList__stats {
    @apply flex space-x-1.5 text-xs flex-shrink-0;
  }
  .serverList__stats span {
    @apply flex-shrink-0;
  }

  /* standard cell */
  .serverList__cell {
    @apply text-gray-500 text-sm lg:w-1/3 truncate;
  }
</style>
