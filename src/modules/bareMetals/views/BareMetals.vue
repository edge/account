<script setup>
/* global process */

import * as utils from '@edge/account-utils'
import StatusDot from '@/components/StatusDot'
import { useStore } from 'vuex'
import { effect, ref } from 'vue'

const store = useStore()

const data = ref()
const error = ref()
const loading = ref(true)

function gotoServer(e) {
  console.log(e)
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
      <h1>Edge Bare Metal Servers</h1>
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
          @click="gotoServer(bareMetal._key)"
          class="bareMetals__item"
          :class="bareMetal ? 'active' : 'inactive'"
        >
          <!-- name -->
          <div class="bareMetals__field name overflow-hidden">
            <span
              class="text-md truncate"
              :class="isActive ? 'text-green' : 'text-red'"
              :title="bareMetal.label"
            >
              {{ bareMetal.label }}
            </span>
          </div>
          <!-- domain -->
          <div class="bareMetals__field hostname overflow-hidden">
            <span class="bareMetals_header">Hostname</span>
            <span class="text-m" :title="bareMetal.hostname">{{ bareMetal.hostname }}</span>
          </div>
          <!-- region -->
          <div class="bareMetals__field region">
            <span class="bareMetals_header">Region</span>
            <span class="text-m">{{ bareMetal.region }}</span>
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
/* list item */
.bareMetals__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-t-8 border-gray-400 rounded-md w-full p-5;
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
.hostname, .status {
  @apply flex flex-col;
}
.bareMetals__name {
  @apply text-md text-green truncate;
}

@media (min-width: 350px) {
  .bareMetals__item {
    grid-template-columns: repeat(2, 1fr);
  }
  .status {
    @apply row-start-2 col-start-2;
  }
  .hostname {
    @apply row-start-2;
  }
}

@screen sm {
  .bareMetals__item {
    @apply border-l-8 border-t-0;
    grid-template-columns: repeat(3, 1fr) 80px;
  }
  .name {
    @apply row-start-1 col-span-4;
  }
  .hostname {
    @apply row-start-2 col-start-1;
  }
  .status {
    @apply col-start-4 row-start-2;
  }
}

@screen lg {
  .bareMetals__item {
    @apply flex justify-between gap-x-2;
  }
  .name {
    @apply flex-1 flex-shrink-0 col-span-1 row-span-2 justify-center;
    flex-basis: 150px;
  }
  .hostname {
    @apply flex-1;
    flex-basis: 200px;
  }
  .status {
    @apply flex-1 row-start-1 flex-shrink-0;
    flex-basis: 70px;
  }
}
</style>
