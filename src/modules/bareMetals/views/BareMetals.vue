<script setup>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import DistroIcon from '@/components/icons/DistroIcon'
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

function getDistro(os) {
  if (/alma/i.test(os)) return 'almalinux'
  if (/centos/i.test(os)) return 'centos'
  if (/debian/i.test(os)) return 'debian'
  return 'ubuntu'
}

async function reload() {
  try {
    error.value = undefined
    loading.value = true

    data.value = await utils.getBareMetals(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, {
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
      <h1>Edge Bare Metal</h1>
    </div>
    <div v-if="error" class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        There was a problem loading your bare metal servers. Please try again or contact support for assistance.
      </div>
    </div>
    <div v-else-if="loading" class="flex items-center">
      <span>Loading bare metal servers</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else-if="data">
      <ul class="space-y-2">
        <li
          v-for="{ bareMetal } in data.results"
          :key="bareMetal._key"
          @click="router.push({ name: 'Bare Metal', params: { key: bareMetal._key }})"
          class="bareMetals__item"
          :class="bareMetal.active ? 'active' : 'inactive'"
        >
          <div class="bareMetals__field details overflow-hidden">
            <!-- name -->
            <div class="bareMetals__name">
              <span
                class="text-md truncate"
                :class="bareMetal.active ? 'text-green' : 'text-red'"
                :title="bareMetal.label"
              >
                {{ bareMetal.label }}
              </span>
            </div>
            <div class="ip__and__domain text-m">
              <span>{{ bareMetal.network.ip.join(', ') }}</span>
              <span class="divider hidden"></span>
              <div class="truncate" :data="bareMetal.hostname">{{ bareMetal.hostname }}</div>
            </div>
          </div>

          <!-- server specs -->
          <div class="bareMetals__field specs">
            <!-- OS -->
              <div class="bareMetals__header flex items-center">
                <div class="mr-1">
                  <DistroIcon :os="getDistro(bareMetal.os)" className="w-4 h-4" />
                </div>
                <span>{{ bareMetal.os }}</span>
              </div>
            <!-- specs -->
            <div class="bareMetals__stats text-m">
              <span>{{ bareMetal.spec.cpus }} vCPU</span>
              <span class="divider"></span>
              <span>{{ format.mib(bareMetal.spec.disk) }} Disk</span>
              <span class="divider"></span>
              <span>{{ format.mib(bareMetal.spec.ram) }} RAM</span>
              <span class="divider"></span>
              <span>{{ bareMetal.spec.bandwidth }} Mbps</span>
            </div>
          </div>

          <!-- region -->
          <div class="bareMetals__field region">
            <span class="bareMetals__header">Region</span>
            <span class="text-m">{{ bareMetal.region }}</span>
          </div>

          <!-- created -->
          <div class="bareMetals__field created">
            <span class="bareMetals__header">Created</span>
            <span class="text-m">{{ getCreated(bareMetal.created) }}</span>
          </div>

          <!-- status dot -->
          <div class="bareMetals__field status">
            <span class="bareMetals__header">Status</span>
            <StatusDot :isActive="bareMetal.active" :isInactive="!bareMetal.active" :small="true" :statusText="bareMetal.active ? 'Active' : 'Inactive' " />
          </div>
        </li>
      </ul>
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
.bareMetals__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-t-8 border-gray-400 rounded-md w-full p-5 pr-8;
  @apply cursor-pointer transition-all duration-100;
}
.bareMetals__item.active {
  @apply border-green;
}
.bareMetals__item.inactive {
  @apply border-red;
}

/* list item content */
.bareMetals__field {
  @apply flex flex-col;
}
.bareMetals__header {
  @apply text-md mr-2;
}
.ip__and__domain {
  @apply flex flex-col overflow-hidden;
}
.zone, .created, .status {
  @apply flex flex-col;
}
.bareMetals__name {
  @apply text-md text-gray-500 truncate;
}
.active .bareMetals__name {
  @apply text-green font-medium;
}
.inactive .bareMetals__name {
  @apply text-red font-medium;
}
.bareMetals__stats {
  @apply flex space-x-1.5;
}
/* status dot */
.bareMetals__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.active .bareMetals__statusDot {
  @apply bg-green;
}
.inactive .bareMetals__statusDot {
  @apply bg-red;
}
.divider {
  @apply h-full bg-gray-400;
  width: 1px
}

/* tablet sized screens up to desktop */
@media (min-width: 470px) {
  .bareMetals__item {
    @apply grid-rows-3 gap-x-10;
    grid-template-columns: auto;
  }
  .bareMetals__header {
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
  .bareMetals__item {
    @apply flex justify-between border-l-8 border-t-0 gap-x-4;
  }
  .details {
    @apply col-span-1 flex-shrink;
    flex-basis: 280px;
  }
  .specs {
    @apply flex-shrink-0;
    flex-basis: 320px;
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
  .bareMetals__stats {
    @apply flex-col space-x-0;
  }

  .bareMetals__stats .divider {
    @apply hidden;
  }
}
</style>
