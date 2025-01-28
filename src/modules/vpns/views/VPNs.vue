<script setup>
/* global process */

import * as utils from '@edge/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import StatusDot from '@/components/StatusDot'
import moment from 'moment'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { effect, ref } from 'vue'

const router = useRouter()
const store = useStore()

const data = ref()
const error = ref()
const loading = ref(true)

function getCreated(time) {
  const created = moment(time).fromNow()
  return created === 'a few seconds ago' ? 'Just now' : created
}

async function reload() {
  try {
    error.value = undefined
    loading.value = true

    data.value = await utils.getVpns(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, {
      limit: 100,
      page: 1
    })
  }
  catch (err) {
    console.error(err)
    error.value = err
  }
  finally {
    loading.value = false
  }
}

effect(() => {
  reload()
})
</script>

<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Edge VPN</h1>
      <router-link
        v-if="data && data.results.length > 0"
        :to="{ name: 'Deploy VPN' }"
        class="button button--success button--small h-full mb-5 sm:mb-0"
      >
        Deploy VPN
      </router-link>
    </div>
    <div v-if="error" class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        There was a problem loading your VPNs. Please try again or contact support for assistance.
      </div>
    </div>
    <div v-else-if="loading" class="flex items-center">
      <span>Loading VPNs</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else-if="data">
      <ul v-if="data.results.length > 0" class="space-y-2">
        <li
          v-for="{ vpn, server } in data.results"
          :key="vpn._key"
          @click="router.push({ name: 'VPN', params: { id: vpn._key }})"
          class="vpns__item"
          :class="vpn.active ? 'active' : 'inactive'"
        >
          <div class="vpns__field details overflow-hidden">
            <!-- name -->
            <div class="vpns__name">
              <span
                class="text-md truncate"
                :class="vpn.active ? 'text-green' : 'text-red'"
                :title="vpn.name"
              >
                {{ vpn.name }}
              </span>
            </div>
            <div class="ip__and__domain text-m">
              <span v-if="server.network">{{ server.network.ip[0] }}</span>
              <span v-if="server.network" class="divider hidden"></span>
              <div class="truncate" :data="server.settings.domain">{{ server.settings.domain }}</div>
            </div>
          </div>

          <!-- server specs -->
          <div class="vpns__field specs">
            <span class="vpns__header">Type</span>
            <!-- Multi or single user -->
            <div class="text-m">
              <span v-if="vpn.multiuser">Multiuser</span>
              <span v-else>Single User</span>
            </div>
          </div>


          <!-- Speed -->
          <div class="vpns__field speed">
            <span class="vpns__header">Speed</span>
            <div class="text-m">

              <span v-if="vpn.speed === 'fast'">Fast</span>
              <span v-else-if="vpn.speed === 'faster'">Faster</span>
              <span v-else-if="vpn.speed === 'fastest'">Fastest</span>
              <span v-else>???</span>
            </div>
          </div>

          <!-- created -->
          <div class="vpns__field created">
            <span class="vpns__header">Created</span>
            <span class="text-m">{{ getCreated(vpn.created) }}</span>
          </div>

          <!-- status dot -->
          <div class="vpns__field status">
            <span class="vpns__header">Status</span>
            <StatusDot :isActive="vpn.active" :isInactive="!vpn.active" :small="true" :statusText="vpn.active ? 'Active' : 'Inactive' " />
          </div>
        </li>
      </ul>

      <div v-else class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <p>You haven't deployed any VPNs yet. Once you deploy your first VPN it will be available here.</p>
        <router-link
          :to="{ name: 'Deploy VPN' }"
          class="button button--success button--small"
        >
          Deploy VPN
        </router-link>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.text-m {
  font-size: 0.8rem;
}

.flagIcon {
  @apply h-4 w-4 rounded-xl mr-1;
}

/* list item */
.vpns__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-t-8 border-gray-400 rounded-md w-full p-5 pr-8;
  @apply cursor-pointer transition-all duration-100;
}
.vpns__item.active {
  @apply border-green;
}
.vpns__item.inactive {
  @apply border-red;
}

/* list item content */
.vpns__field {
  @apply flex flex-col;
}
.vpns__header {
  @apply text-md mr-2;
}
.ip__and__domain {
  @apply flex flex-col overflow-hidden;
}
.zone, .created, .status {
  @apply flex flex-col;
}
.vpns__name {
  @apply text-md text-gray-500 truncate;
}
.active .vpns__name {
  @apply text-green font-medium;
}
.inactive .vpns__name {
  @apply text-red font-medium;
}
.vpns__stats {
  @apply flex space-x-1.5;
}
/* status dot */
.vpns__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.active .vpns__statusDot {
  @apply bg-green;
}
.inactive .vpns__statusDot {
  @apply bg-red;
}
.divider {
  @apply h-full bg-gray-400;
  width: 1px
}

/* tablet sized screens up to desktop */
@media (min-width: 470px) {
  .vpns__item {
    @apply grid-rows-3 gap-x-10;
    grid-template-columns: auto;
  }
  .vpns__header {
    @apply mr-0;
  }
  .details {
    @apply col-span-2;
  }
  .ip__and__domain {
    @apply flex-row space-x-1
  }
  .ip__and__domain.divider {
    @apply block;
  }
  .zone {
    @apply col-start-2 row-start-2;
  }

  .created {
    @apply col-start-1 row-start-3;
  }

  .status {
    @apply col-start-2 row-start-3;
  }

  .divider {
    @apply block;
  }
}

@screen lg {
  .vpns__item {
    @apply flex justify-between border-l-8 border-t-0 gap-x-4;
  }
  .details {
    @apply col-span-1 flex-shrink;
    flex-basis: 280px;
  }
  .zone {
    @apply col-start-3 row-start-1 flex-shrink-0;
    flex-basis: 100px;
  }
  .created {
    @apply col-start-4 row-start-1 flex-shrink-0;
    flex-basis: 120px;
  }
  .status {
    @apply col-start-5 row-start-1;
    flex-basis: 100px;
  }
  /* zone and created fields are hidden on small desktop screens */
  .zone, .created {
    @apply hidden;
  }
}

@media (min-width: 1180px) {
  .zone, .created {
    @apply flex;
  }
}

@media (max-width: 370px) {
  .vpns__stats {
    @apply flex-col space-x-0;
  }

  .vpns__stats .divider {
    @apply hidden;
  }
}
</style>
