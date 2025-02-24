<script setup>
/* global process */

import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import superagent from 'superagent'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { effect, ref } from 'vue'

const route = useRoute()
const store = useStore()

const error = ref()
const gpu = ref()
const loading = ref(true)

async function reload() {
  if (!route.params.id || !store.state.session || !store.state.session._key) return

  try {
    loading.value = true
    error.value = undefined

    const res = await superagent.get(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/vms/${route.params.id}`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    console.log(res)
  }
  catch (err) {
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
      <h1>Edge GPU</h1>
    </div>

    <div v-if="loading" class="flex items-center">
      <span>Loading GPU</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <div v-else-if="gpu" class="box">
      {{ gpu.name }}
    </div>

    <div v-else class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <p>Not found</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .gpuList {
    @apply space-y-2;
  }
</style>
