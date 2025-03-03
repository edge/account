<script setup>
/* global process */

import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import superagent from 'superagent'
import { useStore } from 'vuex'
import { effect, ref } from 'vue'

const store = useStore()

const busy = ref(false)
const error = ref()
const generatedKey = ref()
const loading = ref(true)
const keys = ref([])

async function generate() {
  try {
    busy.value = true

    const res = await superagent.post(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/admin/api-keys`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    generatedKey.value = res.body
  }
  catch (err) {
    error.value = err
  }
  finally {
    busy.value = false
  }
}

async function reload() {
  if (!store.state.session || !store.state.session._key) return

  try {
    loading.value = true

    const res = await superagent.get(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/admin/api-keys`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    keys.value = res.body
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
  <div v-if="loading" class="pb-20">
    <div class="box">
      <h4>API Keys</h4>

      <div class="flex">
        <span class="mr-2">Loading</span>
        <LoadingSpinner />
      </div>
    </div>
  </div>

  <div v-else class="pb-20">
    <div class="box">
      <h4>API Keys</h4>

      <div v-if="generatedKey">
        <span>Your new API key:</span>
        <span>{{ generatedKey.secret }}</span>
      </div>

      <ul>
        <li v-for="key in keys" v-bind:key="key._key">
          {{ key.id }}
        </li>
      </ul>
    </div>

    <div class="flex flex-col w-full mt-4 space-y-2">
      <button
        :disabled="busy"
        class="button button--success self-end w-full md:max-w-xs"
        @click="generate"
      >
        Generate API Key
      </button>
    </div>
  </div>
</template>
