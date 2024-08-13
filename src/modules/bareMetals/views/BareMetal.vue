<script setup>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import { ArrowLeftIcon } from '@heroicons/vue/outline'
import DistroIcon from '@/components/icons/DistroIcon'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import StatusDot from '@/components/StatusDot'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { computed, effect, ref } from 'vue'

const route = useRoute()
const store = useStore()

const data = ref()
const error = ref()
const loading = ref(true)

const distro = computed(() => {
  if (data.value && data.value.bareMetal && data.value.bareMetal.os) {
    if (/alma/i.test(data.value.bareMetal.os)) return 'almalinux'
    if (/centos/i.test(data.value.bareMetal.os)) return 'centos'
    if (/debian/i.test(data.value.bareMetal.os)) return 'debian'
  }
  return 'ubuntu'
})

const price = computed(() => {
  if (data.value && data.value.product) {
    console.log('Calculate price', { ...data.value.product.price })
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    const days = d.getDate()

    const price = data.value.product.price
    if (price.type === 'fixed') {
      // work backwards from monthly cost
      const monthlyCost = price.cost
      const dailyCost = monthlyCost / days
      const hourlyCost = dailyCost / 24
      return { type: 'fixed', dailyCost, hourlyCost, monthlyCost }
    }
    if (price.type === 'flatRate') {
      // calculate from cost basis
      const hourlyCost = price.cost / price.costBasis
      const dailyCost = hourlyCost * 24
      const monthlyCost = dailyCost * days
      return { type: 'flatRate', dailyCost, hourlyCost, monthlyCost }
    }
  }
  return { type: 'flatRate', dailyCost: 0, hourlyCost: 0, monthlyCost: 0 }
})

console.log({ ...price.value })

async function reload() {
  try {
    error.value = undefined
    loading.value = true

    data.value = await utils.getBareMetal(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, route.params.key)
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
  <div class="mainContent__inner bare-metal">
    <div v-if="error" class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        There was a problem loading your bare metal server. Please try again or contact support for assistance.
      </div>
    </div>
    <div v-else-if="loading" class="flex items-center">
      <span>Loading bare metal server</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else-if="data">
      <div class="w-max">
        <router-link :to="{ name: 'Bare Metals' }" class="flex items-center space-x-1 hover:text-green mb-4">
          <ArrowLeftIcon class="w-4" /><span>Bare Metal</span>
        </router-link>
      </div>

      <!-- title -->
      <h1 class="w-max mb-0">{{ data.bareMetal.label }}</h1>

      <!-- ip and domain -->
      <div class="flex items-center mt-1 text-gray-500 truncate collapse sub-header space-x-2">
        <span>{{ data.bareMetal.network.ip.join(', ') }}</span>
        <span class="divider"/>
        <span class="truncate">{{ data.bareMetal.hostname }}</span>
      </div>

      <!-- overview -->
      <div class="flex items-center mt-3 mb-5 space-x-3 text-gray-500 md:justify-between sm:mt-4 collapse status-row">
        <div class="relative flex-1">
          <div class="flex items-center justify-start space-x-2 collapse bare-metal-info">
            <div class="flex items-center flex-shrink-0 space-x-1 text-gray-900">
              <DistroIcon :os="distro" className="bare-metal-icon" />
              <span class="bare-metal-detail">{{ data.bareMetal.os }}</span>
            </div>
            <span class="divider"/>
            <div class="flex items-center space-x-2 flex-shrink-0 specs">
              <span class="bare-metal-detail">{{ data.bareMetal.spec.cpus }} vCPU</span>
              <span class="divider"/>
              <span class="bare-metal-detail">{{ format.mib(data.bareMetal.spec.ram) }} Disk</span>
              <span class="divider"/>
              <span class="bare-metal-detail">{{ format.mib(data.bareMetal.spec.ram) }} RAM</span>
              <span class="divider"/>
              <span class="bare-metal-detail">{{ data.bareMetal.spec.bandwidth }} Mbps</span>
            </div>
            <span class="divider"/>
            <div class="flex items-center space-x-1">
              <StatusDot :isActive="data.bareMetal.active" :isInactive="!data.bareMetal.active" :statusText="data.bareMetal.active ? 'Active' : 'Inactive'" />
            </div>
          </div>
        </div>
      </div>

      <!-- overview -->
      <div class="grid gap-4 xl:grid-cols-2">
        <div class="box overflow_hidden bare-metal__details xl:col-span-2">
          <h4 class="section__title">Server details</h4>
          <div class="overview__grid">
            <!-- name, hostname, ip, region -->
            <div class="grid__col col__1">
              <div class="info__section">
                <span class="label">Label</span>
                <span class="info">{{ data.bareMetal.label }}</span>
              </div>
              <div class="info__section">
                <span class="label">Hostname</span>
                <span class="info">{{ data.bareMetal.hostname }}</span>
              </div>
              <div class="info__section">
                <span class="label">IP Address</span>
                <div class="relative flex w-max">
                  <span class="">{{ data.bareMetal.network.ip.join(', ') }}</span>
                </div>
              </div>
              <div class="info__section">
                <span class="label">Region</span>
                <span class="info">{{ data.bareMetal.region || 'Unknown' }}</span>
              </div>
            </div>
            <!-- status, os, created, updated -->
            <div class="grid__col col__2">
              <div class="info__section">
                <span class="label">Status</span>
                <span class="info">
                  <StatusDot :isActive="data.bareMetal.active" :isInactive="!data.bareMetal.active" :statusText="data.bareMetal.active ? 'Active' : 'Inactive'" />
                </span>
              </div>
              <div class="info__section">
                <span class="label">OS</span>
                <span class="info">{{ data.bareMetal.os }}</span>
              </div>
              <div class="info__section">
                <span class="label">Created</span>
                <span class="info">{{ format.date(data.bareMetal.created) }} {{ format.time(data.bareMetal.created) }}</span>
              </div>
              <div class="info__section">
                <span class="label">Last Updated</span>
                <span class="info">{{ format.date(data.bareMetal.updated) }} {{ format.time(data.bareMetal.updated) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="box overflow_hidden bare-metal__specs">
          <h4 class="section__title">Server specs</h4>
          <!-- vcpus, ram, disk, bandwidth -->
          <div class="overview__grid">
            <div class="info__section">
              <span class="label">vCPUs</span>
              <span class="info">{{ data.bareMetal.spec.cpus }}</span>
            </div>
            <div class="info__section">
              <span class="label">RAM</span>
              <span class="info">{{ format.mib(data.bareMetal.spec.ram) }}</span>
            </div>
            <div class="info__section">
              <span class="label">Disk</span>
              <span class="info">{{ format.mib(data.bareMetal.spec.disk) }}</span>
            </div>
            <div class="info__section">
              <span class="label">Bandwidth</span>
              <span class="info">{{ data.bareMetal.spec.bandwidth }} Mbps</span>
            </div>
          </div>
        </div>
        <!-- fixed monthly pricing -->
        <div v-if="price.type === 'fixed'" class="box overflow_hidden bare-metal__costs">
          <h4 class="section__title">Costs</h4>
          <div class="overview__grid">
            <div class="info__section">
              <span class="label">Monthly</span>
              <span class="info">${{ format.usd(price.monthlyCost, 2) }}</span>
            </div>
          </div>
        </div>
        <!-- flat rate costs -->
        <div v-else-if="price.type === 'flatRate'" class="box overflow_hidden bare-metal__costs">
          <div class="overview__grid">
            <div class="info__section">
              <span class="label">Hourly</span>
              <span class="info">${{ format.usd(price.hourlyCost, 4) }}</span>
            </div>
            <div class="info__section">
              <span class="label">Daily</span>
              <span class="info">${{ format.usd(price.dailyCost, 2) }}</span>
            </div>
            <div class="info__section">
              <span class="label">This month</span>
              <span class="info">${{ format.usd(price.monthlyCost, 2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mainContent__inner.bare-metal {
  @apply pt-0 mt-6;
}

.bare-metal-detail {
  @apply flex-shrink-0;
}
.bare-metal-icon {
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
  .collapse.bare-metal-info {
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
  .collapse.bare-metal-info {
    @apply flex-col items-start space-x-0 space-y-1;
  }
  .collapse.bare-metal-info .divider {
    @apply hidden;
  }
  .collapse .specs .divider {
    @apply block
  }
}

@screen lg {
  .collapse.bare-metal-info {
    @apply flex-row items-center space-x-2 space-y-0;
  }
  .collapse.bare-metal-info .divider {
    @apply block;
  }
}

.section__title {
  @apply mb-4;
}
.overview__grid {
  @apply grid grid-cols-1 gap-y-4;
}
.grid__col {
  @apply flex flex-col space-y-4
}
.info__section {
  @apply flex overflow-hidden w-full;
}
.label {
  @apply font-bold block mr-2 flex-shrink-0 w-24;
}
.bare-metal__details .info__section {
  @apply flex-col;
}

.info {
  @apply flex-shrink-0 truncate w-full;
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}

@media (max-width: 450px) {
  .bare-metal__details .info__section {
    @apply flex-col;
  }
}

@media (min-width: 450px) {
  .bare-metal__details .info__section {
    @apply flex-row;
  }

  .bare-metal__specs .overview__grid, .bare-metal__costs .overview__grid {
    @apply grid-cols-2;
  }
  .bare-metal__specs .label, .bare-metal__costs .label {
    @apply w-20;
  }

  /* .overview__grid {
    @apply grid-cols-2
  } */
}
@screen lg {
  .bare-metal__specs .overview__grid {
    @apply grid-cols-4;
  }
  .bare-metal__specs .label {
    @apply w-max;
  }
  .bare-metal__costs .label {
    @apply w-max;
  }
}
@screen xl {
  .bare-metal__details .overview__grid {
    @apply grid-cols-2
  }
  .bare-metal__specs .overview__grid {
    @apply grid-cols-2
  }
}
@screen 2xl {
  .bare-metal__specs .overview__grid {
    grid-template-columns: repeat(3, 1fr) auto;
  }
}
</style>
