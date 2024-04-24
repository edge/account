<script setup>
/* global process */

import * as api from '@/account-utils'
import { useStore } from 'vuex'
import { computed, effect, ref } from 'vue'

const loading = ref(false)
const error = ref()
const subscriber = ref()

const store = useStore()

const checked = computed(() => Boolean(subscriber.value && subscriber.value.isSubscribed))

async function reload() {
  if (!store.state.session) return

  loading.value = true
  error.value = undefined
  try {
    const res = await api.newsletter.getSubscription(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key)
    subscriber.value = res.subscriber
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

async function toggle() {
  if (!store.state.session) return

  loading.value = true
  error.value = undefined
  try {
    let res
    if (subscriber && subscriber.value.isSubscribed) {
      res = await api.newsletter.unsubscribe(
        process.env.VUE_APP_ACCOUNT_API_URL,
        store.state.session._key,
        store.state.session.account
      )
    }
    else {
      res = await api.newsletter.subscribe(
        process.env.VUE_APP_ACCOUNT_API_URL,
        store.state.session._key,
        store.state.session.account
      )
    }
    subscriber.value = res.subscriber
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
  <div class="subscribe-checkbox">
    <input type="checkbox" id="subscribe" name="subscribe" :checked="checked" :disabled="loading" @click="toggle" />
    <label v-if="checked" for="subscribe">Subscribed to the Edge Newsletter</label>
    <label v-else for="subscribe">Subscribe to the Edge Newsletter</label>
  </div>
</template>

<style>
.subscribe-checkbox {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>
