<script setup>
/* global process */

import { ArrowLeftIcon } from '@heroicons/vue/solid'
import EditableTitle from '../../../layout/EditableTitle.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import ValidationError from '../../../components/ValidationError.vue'
import superagent from 'superagent'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { effect, reactive, ref } from 'vue'
import { minLength, required } from '@vuelidate/validators'
import StatusDot from '../../../components/StatusDot.vue'

const route = useRoute()
const store = useStore()

const busy = ref(false)
const disabled = ref(false)
const error = ref()
const gpu = ref()
const loading = ref(true)

const formState = reactive({
  name: ''
})

const v$ = useVuelidate({
  name: [required, minLength(3)]
}, formState)

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
}

/** @todo */
async function updateName() {
  console.log(v$.value.name.$model)
}

effect(() => {
  reload()
})
</script>

<template>
  <div v-if="loading" class="mainContent__inner pt-0 mt-6">
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
      <div class="flex-shrink-0" v-if="!isDestroyed && !isCrashed">
        <ServerPowerToggle
          :activeTasks=activeTasks
          :disableActions=disableActions
          :server=server
        />
      </div>
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
</style>
