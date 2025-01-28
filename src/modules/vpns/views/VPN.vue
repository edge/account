<script setup>
/* global process */

import * as utils from '@edge/account-utils'
import { ArrowLeftIcon } from '@heroicons/vue/outline'
import EditableTitle from '../../../layout/EditableTitle.vue'
import { useStore } from 'vuex'
import { RouterLink, useRoute } from 'vue-router'
import { computed, effect, ref } from 'vue'
import { minLength, required } from '@vuelidate/validators'

const route = useRoute()
const store = useStore()

const busy = ref(false)
const data = ref()
const error = ref()
const loading = ref(false)
const vpn = computed(() => data.value && data.value.vpn)

async function reload() {
  try {
    error.value = undefined
    loading.value = true

    data.value = await utils.getVpn(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, route.params.id)
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

async function updateName(name) {
  try {
    error.value = undefined
    busy.value = true

    data.value = await utils.updateVpn(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, route.params.id, {
      vpn: {
        name
      }
    })
  }
  catch (err) {
    error.value = err
  }
  finally {
    busy.value = false
  }
}

effect(() => {
  reload()
})
</script>

<template>
  <div class="mainContent__inner vpn" v-if="vpn">
    <div class="w-max">
      <RouterLink :to="{ name: 'VPNs' }" class="flex items-center space-x-1 hover:text-green mb-4">
        <ArrowLeftIcon class="w-4" /><span>VPNs</span>
      </RouterLink>
    </div>

    <EditableTitle
      :busy="busy"
      placeholder="VPN name"
      :validation="[required, minLength(3)]"
      :value="vpn.name"
      @change="updateName"
    />
  </div>
</template>
