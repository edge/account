<script setup>
/* global process */

import * as utils from '@edge/account-utils'
import * as validation from '@/utils/validation'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '../../../components/HttpError.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import Modal from '../../../components/Modal.vue'
import MultiuserToggle from './MultiuserToggle.vue'
import SpeedSlider from './SpeedSlider.vue'
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { computed, defineProps, effect, reactive, ref } from 'vue'

const store = useStore()

const props = defineProps(['vpn'])

const formState = reactive({
  multiuser: false,
  speed: 'fast'
})

const v$ = useVuelidate({
  multiuser: [],
  speed: [validation.oneOf(['fast', 'faster', 'fastest'])]
}, formState)

const canSubmit = computed(() => v$.value.$anyDirty && !v$.value.$invalid)
const error = ref(null)
const isLoading = ref(false)
const ready = ref(false)
const showConfirmationModal = ref(false)

const internalServerError = computed(() => {
  if (error.value && error.value.status === 500) return error.value
  return null
})

const overCapacityError = computed(() => {
  if (error.value && error.value.status === 500) {
    if (error.value.response && error.value.response.body && error.value.response.body.detail === 'there is no suitable node in cluster') {
      return new Error(error.value.response.body.detail)
    }
  }
  return null
})

function calculateHourlyCost(speed, multiuser, users) {
  const vpnConfig = store.state.config.vpn

  if (multiuser) {
    const chargeableUsers = Math.max(0, users - vpnConfig.multiuser.usersIncluded)
    const userCost = vpnConfig.multiuser.costPerUser * chargeableUsers
    const periodCost = vpnConfig.multiuser.cost + userCost
    const hourlyCost = periodCost / vpnConfig.multiuser.costBasis
    return hourlyCost
  }

  return vpnConfig.singleuser.cost / vpnConfig.singleuser.costBasis
}

const activeTasks = computed(() => store.getters.tasksByServerId(props.vpn.server))

const costs = computed(() => {
  const currentHourly = calculateHourlyCost(props.vpn.speed, props.vpn.multiuser, props.vpn.users)
  const newHourly = calculateHourlyCost(v$.value.speed.$model, v$.value.multiuser.$model, props.vpn.users)

  const current30d = currentHourly * 24 * 30
  const new30d = newHourly * 24 * 30

  const increased = newHourly > currentHourly

  return {
    currentHourly,
    current30d,
    newHourly,
    new30d,

    increased
  }
})

const resizedInLastHour = computed(() => {
  const oneHourAgo = Date.now() - 3.6e6

  const recentResizes = activeTasks.value
    .filter(t => /^resize/.test(t.action) && t.updated > oneHourAgo)
    .sort((a, b) => b.updated - a.updated)

  if (recentResizes.length > 0) return this.recentResizes[0].updated > oneHourAgo
  return false
})

function formatCost(cost) {
  return (Math.ceil(cost * 1e4) / 1e4).toFixed(4)
}

function reset() {
  if (props.vpn) {
    v$.value.multiuser.$model = props.vpn.multiuser
    v$.value.speed.$model = props.vpn.speed
  }
}

function toggleConfirmationModal() {
  showConfirmationModal.value = !showConfirmationModal.value
}

async function updateVPN() {
  toggleConfirmationModal()

  try {
    isLoading.value = true
    error.value = null

    const res = await utils.updateVpn(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, props.vpn._key, {
      vpn: {
        multiuser: v$.value.multiuser.$model,
        speed: v$.value.speed.$model
      }
    })

    for (const i in res.tasks) {
      store.commit('addTask', res.tasks[i])
    }
  }
  catch (err) {
    error.value = err
  }
  finally {
    isLoading.value = false
  }
}

effect(() => {
  if (!ready.value) {
    reset()
    ready.value = true
  }
})
</script>

<template>
  <div>
    <div class="box">
      <h4>VPN Settings</h4>

      <MultiuserToggle v-model="v$.multiuser.$model" :multiuserDisabled="vpn.users > 1" />

      <SpeedSlider v-model="v$.speed.$model" />
    </div>
    <!-- balance warning -->
    <div class="box mt-4 flex space-x-2" v-if="costs.increased && (store.getters.balanceSuspend || store.getters.balanceWarning)">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">You are unable to increase this VPN's specs while your available balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to enable this service.</span>
    </div>
    <!-- resize button and errors -->
    <div class="flex flex-col relative my-4 space-y-2">
      <button
        @click="toggleConfirmationModal"
        :disabled="!canSubmit"
        class="button button--success md:self-end w-full md:max-w-xs"
      >
        <span v-if="isLoading">Updating</span>
        <span v-else>Update</span>
        <span v-if="isLoading" class="ml-2">
          <LoadingSpinner />
        </span>
      </button>
      <div class="flex md:justify-end mt-2">
        <HttpError :error="error" />
      </div>
      <div v-if="overCapacityError" class="vpn__error over-capacity">
        <span class="font-bold">We're over capacity</span>
        <span>It appears that we are at capacity in this region. We're working hard to increase this. Please check back soon.</span>
      </div>
      <div v-else-if="internalServerError" class="vpn__error">
        <span class="font-bold">Something went wrong</span>
        <span>There was an issue while deploying this VPN. Please try again, or contact support@edge.network if the issue persists.</span>
      </div>
    </div>

    <Modal v-if="showConfirmationModal">
      <template v-slot:icon>
        <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
      </template>
      <template v-slot:header>
        <span>Update {{ vpn.name }}</span>
      </template>
      <template v-slot:body>
      <div class="flex flex-col space-y-2">
        <span class="font-semibold">Warning: VPN will be powered off while updating.</span>
      </div>
        <div class="flex flex-col space-y-2 pt-4">
          <li v-if="resizedInLastHour">Your VPN was updated less than one hour ago. If you continue to update it again, you will be charged a full hour for the previous settings.</li>
          <li>Cost will {{ costs.increased ? 'increase' : 'decrease' }} from {{ formatCost(costs.current30d) }} to {{ formatCost(costs.new30d) }} per 30 days.</li>
        </div>
      </template>
      <template v-slot:buttons>
        <button
          class="w-full mt-3 button button--small button--outline sm:mt-0"
          @click="toggleConfirmationModal"
        >
          Cancel
        </button>
        <button
          class="w-full button button--small button--error"
          @click="updateVPN"
        >
          Yes, Update VPN
        </button>
      </template>
    </Modal>
    <!-- resize confirmation modal -->
    <!--<ResizeServerConfirmation
      v-if=showConfirmationModal
      @modal-confirm=resizeServer
      @modal-close=toggleConfirmationModal
      :currentCost=currentHourlyCost
      :currentSpec=currentSpec
      :lastResizeTask="lastResizeTask"
      :newCost=newHourlyCost
      :newSpec=newSpec
      :serverName="vpn.name"
    />-->
  </div>
</template>

<style scoped>
.vpn__error {
  @apply flex flex-col bg-red text-white p-4 w-full rounded space-y-1;
}

.vpn__error.over-capacity {
  @apply bg-blue-100 text-black;
}
</style>
