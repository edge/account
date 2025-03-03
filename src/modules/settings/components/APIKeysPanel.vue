<script setup>
/* global process */

import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import superagent from 'superagent'
import { useStore } from 'vuex'
import { DuplicateIcon, TrashIcon } from '@heroicons/vue/solid'
import { effect, ref } from 'vue'

const store = useStore()

const busy = ref(false)
const copied = ref(false)
const error = ref()
const generatedKey = ref()
const loading = ref(true)
const keys = ref([])

async function copyToClipboard(str) {
  await navigator.clipboard.writeText(str)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 1000)
}

async function deleteKey(id) {
  try {
    busy.value = true

    await superagent.delete(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/admin/api-keys/${id}`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    return reload()
  }
  catch (err) {
    error.value = err
  }
  finally {
    busy.value = false
  }
}

function hideGeneratedKey() {
  generatedKey.value = undefined
}

async function generate() {
  try {
    busy.value = true

    const res = await superagent.post(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/admin/api-keys`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    generatedKey.value = res.body

    return reload()
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
  <div v-if="loading" class="box flex pb-20">
    <span class="mr-2">Loading</span>
    <LoadingSpinner />
  </div>

  <div v-else-if="keys.length" class="pb-20">
    <ul class="space-y-2">
      <li
        v-for="key in keys"
        class="grid grid-cols-2 lg:grid-cols-4 gap-y-4 bg-white text-gray-500 border-l-8 border-green rounded-md w-full p-5 pr-8 transition-all duration-100"
        :key="key.id"
      >
        <span class="text-md text-gray-500 truncate">{{ key.id }}</span>
        <div class="flex flex-col">
          <span class="text-md text-gray-500">Created</span>
          <span class="text-sm text-gray-500">{{ key.created }}</span>
        </div>
        <div class="flex flex-col items-end">
          <button class="button button--error" @click.prevent="deleteKey(key.id)">
            <TrashIcon class="w-4" />
            <span>Delete</span>
          </button>
        </div>
      </li>
    </ul>

    <div v-if="generatedKey" class="box flex flex-col mt-4">
      <h4>Your new API key</h4>
      <div class="mb-2">
        <code class="font-mono text-green text-lg">{{ generatedKey.secret }}</code>
        <button
          class="text-gray-400 hover:text-green"
          @click.prevent="copyToClipboard(generatedKey.secret)"
        >
          <DuplicateIcon class="ml-2 w-5 h-5" />
        </button>
      </div>
      <p>
        Copy this API key to a safe place.
        This key's ID is {{ generatedKey.id }}.
      </p>
      <button @click="hideGeneratedKey" class="button button--success">
        <span>I confirm have stored my API key in a safe place</span>
      </button>
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

  <div v-else class="pb-20">
    <div class="box box-flex">
      <div class="flex flex-col items-center justify-center py-4">
        <p>You haven't created any API keys yet.</p>
        <button
          :disabled="busy"
          class="button button--success w-full md:max-w-xs"
          @click="generate"
        >
          Generate API Key
        </button>
      </div>
    </div>
  </div>
</template>
