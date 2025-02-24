<script setup>
/* global process */

import EditableTitle from '../../../layout/EditableTitle.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import PowerToggle from '../../../layout/PowerToggle.vue'
import StatusDot from '../../../components/StatusDot.vue'
import ValidationError from '../../../components/ValidationError.vue'
import superagent from 'superagent'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { ArrowLeftIcon, DuplicateIcon } from '@heroicons/vue/outline'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { effect, reactive, ref } from 'vue'
import { helpers, minLength, required } from '@vuelidate/validators'

const route = useRoute()
const store = useStore()

const busy = ref(false)
const copied = ref(false)
const disabled = ref(false)
const error = ref()
const gpu = ref()
const loading = ref(true)
const poll = ref()

const formState = reactive({
  name: '',
  active: true
})

const v$ = useVuelidate({
  name: [required, minLength(3), helpers.withMessage('Currently unable to change GPU name. This feature is coming soon', () => false)],
  active: []
}, formState)

async function copyToClipboard(str) {
  await navigator.clipboard.writeText(str)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 1000)
}

async function reload() {
  if (!route.params.id || !store.state.session || !store.state.session._key) return

  try {
    loading.value = true
    error.value = undefined

    const res = await superagent.get(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/vms/${route.params.id}`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    gpu.value = res.body
    reset()
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

function reset() {
  v$.value.name.$model = gpu.value.name
  v$.value.active.$model = gpu.value.status === 'active'

  v$.value.$reset()
}

function stopPoll() {
  if (poll.value) {
    clearInterval(poll.value)
    poll.value = undefined
    busy.value = false
  }
}

function startPoll() {
  if (poll.value) return
  busy.value = true

  poll.value = setInterval(() => {
    reload().then(() => {
      if (gpu.value.status === 'active' || gpu.value.status === 'stopped') {
        stopPoll()
        busy.value = false
      }
    })
  }, 5000)
}

async function togglePower(toActive) {
  if (!gpu.value) return
  if (!store.state.session || !store.state.session._key) return

  try {
    if (toActive) {
      await superagent.post(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/vms/start/${gpu.value.id}`)
        .set('Authorization', `Bearer ${store.state.session._key}`)
    }
    else {
      await superagent.post(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/vms/stop/${gpu.value.id}`)
        .set('Authorization', `Bearer ${store.state.session._key}`)
    }

    startPoll()
  }
  catch (err) {
    error.value = err
  }
}

/** @todo */
async function updateName() {
  console.log(v$.value.name.$model)
}

effect(() => {
  reload().then(() => {
    if (gpu.value.status !== 'active' && gpu.value.status !== 'stopped') {
      startPoll()
    }
  })

  return () => {
    stopPoll()
  }
})
</script>

<template>
  <div v-if="!gpu && loading" class="mainContent__inner pt-0 mt-6">
    <div class="flex items-center">
      <span>Loading GPU</span>
      <LoadingSpinner />
    </div>
  </div>

  <div v-else-if="error">
    <div class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>Error</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">{{ error.message }}</p>
        <router-link :to="{ name: 'GPUs' }" class="mt-4 button button--success button--small">
          <span>Return to Edge GPUs</span>
        </router-link>
      </div>
    </div>
  </div>

  <div v-else-if="gpu" class="mainContent__inner pt-0 mt-6">
    <!-- Backlink -->
    <div class="w-max">
      <router-link :to="{ name: 'GPUs' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>GPUs</span>
      </router-link>
    </div>

    <!-- Name -->
    <EditableTitle
      v-model="v$.name.$model"
      :busy="busy || loading"
      :disabled="busy || disabled"
      :invalid="v$.name.$invalid"
      @save="updateName"
    />
    <ValidationError :errors="v$.name.$errors" />

    <!-- IP address and hostname -->
    <div
      class="flex items-center mt-1 text-gray-500 truncate collapse sub-header"
      :class="gpu.ipAddress ? 'space-x-2' : ''"
    >
      <span v-if="gpu.ipAddress">{{ gpu.ipAddress }}</span>
      <span v-if="gpu.ipAddress" class="divider"/>
      <span class="truncate">{{ gpu.hostname }}</span>
    </div>

    <!-- Overview and power toggle -->
    <div class="flex items-center mt-3 space-x-3 text-gray-500 md:justify-between sm:mt-4 collapse status-row">
      <div class="relative flex-1">
        <div class="flex items-center justify-start space-x-2 collapse gpu-info">
          <div class="flex items-center flex-shrink-0 space-x-1 text-gray-900">
            <span class="gpu-detail">{{ gpu.gpuModel }}</span>
          </div>
          <span class="divider"/>
          <div class="flex items-center space-x-2 flex-shrink-0 specs">
            <span class="gpu-detail">{{ gpu.gpuCount }} GPU</span>
            <span class="divider"/>
            <span class="gpu-detail">{{ gpu.cpuCount }} vCPU</span>
            <span class="divider"/>
            <span class="gpu-detail">{{ gpu.diskGiB }} Disk</span>
            <span class="divider"/>
            <span class="gpu-detail">{{ gpu.memoryGiB }} RAM</span>
          </div>
          <span class="divider"/>
          <div class="flex items-center space-x-1">
            <StatusDot
              :isActive="gpu.status === 'active'"
              :isInactive="gpu.status !== 'active'"
              :statusText="gpu.status === 'active' ? 'Active' : 'Inactive'"
            />
          </div>
        </div>
      </div>

      <div class="flex-shrink-0">
        <PowerToggle v-model="v$.active.$model" :busy="busy" @click="togglePower" />
      </div>
    </div>

    <div class="mt-4 space-x-10">
      <!-- Tabs -->
      <TabGroup as="div" class="tabGroup">
        <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />
        <TabList class="tabs pr-6">
          <Tab v-slot="{selected}">
            <button :class="{ tab: true, 'tab--selected': selected }">Overview</button>
          </Tab>
        </TabList>

        <TabPanels class="mt-4">
          <!-- Overview -->
          <TabPanel>
            <div class="grid gap-4 xl:grid-cols-2">
              <div class="box overflow_hidden server__details xl:col-span-2">
                <h4 class="section__title">Details</h4>
                <div class="overview__grid">
                  <!-- Name, hostname, IP address -->
                  <div class="grid__col col__1">
                    <div class="info__section">
                      <span class="label">Name</span><span class="info">{{ gpu.name }}</span>
                    </div>
                    <div class="info__section">
                      <span class="label">Hostname</span><span class="info">{{ gpu.hostname }}</span>
                    </div>
                    <div class="info__section">
                      <span class="label">IP Address</span>
                      <div class="relative flex w-max">
                        <span>{{ gpu.ipAddress }}</span>
                        <button
                          @click.prevent="copyToClipboard(gpu.ipAddress)"
                          class="text-gray-400 hover:text-green"
                        >
                          <DuplicateIcon class="ml-2 w-5 h-5" />
                        </button>
                        <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
                      </div>
                    </div>
                  </div>
                  <div class="grid__col col__2">
                    <div class="info__section">
                      <span class="label">Status</span>
                      <span class="info">
                        <StatusDot
                          :isActive="gpu.status === 'active'"
                          :isInactive="gpu.status !== 'active'"
                          :statusText="gpu.status === 'active' ? 'Active' : 'Inactive'"
                        />
                      </span>
                    </div>
                    <div class="info__section">
                      <span class="label">Created</span>
                      <span class="info">{{ gpu.created }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="box overflow_hidden server__specs">
                <h4 class="section__title">GPU specs</h4>
                <!-- vcpus, ram, disk, bandwidth -->
                <div class="overview__grid">
                  <div class="info__section col-span-2 lg:col-span-4">
                    <span class="label">GPU Model</span>
                    <span class="info">{{ gpu.gpuModel }}</span>
                  </div>
                  <div class="info__section">
                    <span class="label">GPU</span>
                    <span class="info">{{ gpu.gpuCount }}</span>
                  </div>
                  <div class="info__section">
                    <span class="label">vCPUs</span>
                    <span class="info">{{ gpu.cpuCount }}</span>
                  </div>
                  <div class="info__section">
                    <span class="label">RAM</span>
                    <span class="info">{{ gpu.memoryGiB }}</span>
                  </div>
                  <div class="info__section">
                    <span class="label">Disk</span>
                    <span class="info">{{ gpu.diskGiB }}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>

  <div v-else class="mainContent__inner pt-0 mt-6">
    <div class="box">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center mt-4">
          <h4>GPU not found</h4>
        </div>
        <p class="mt-3 mb-1 text-gray-500">This GPU does not exist or has been destroyed.</p>
        <router-link :to="{ name: 'GPUs' }" class="mt-4 button button--success button--small">
          <span>Return to Edge GPUs</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  .collapse.gpu-info {
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
  .collapse.gpu-info {
    @apply flex-col items-start space-x-0 space-y-1;
  }
  .collapse.gpu-info .divider {
    @apply hidden;
  }
  .collapse .specs .divider {
    @apply block
  }
}

@screen lg {
  .collapse.gpu-info {
    @apply flex-row items-center space-x-2 space-y-0;
  }
  .collapse.gpu-info .divider {
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
.server__details .info__section {
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
  .server__details .info__section {
    @apply flex-col;
  }
}

@media (min-width: 450px) {
  .server__details .info__section {
    @apply flex-row;
  }

  .server__specs .overview__grid, .server__costs .overview__grid {
    @apply grid-cols-2;
  }
  .server__specs .label, .server__costs .label {
    @apply w-20;
  }

  /* .overview__grid {
    @apply grid-cols-2
  } */
}
@screen lg {
  .server__specs .overview__grid {
    @apply grid-cols-4;
  }
  .server__specs .label {
    @apply w-max;
  }
  .server__costs .label {
    @apply w-max;
  }
}
@screen xl {
  .server__details .overview__grid {
    @apply grid-cols-2
  }
  .server__specs .overview__grid {
    @apply grid-cols-2
  }
}
@screen 2xl {
  .server__specs .overview__grid {
    grid-template-columns: repeat(3, 1fr) auto;
  }
}
</style>
