<script setup>
/* global process */

import * as utils from '@edge/account-utils'
import * as validation from '@/utils/validation'
import { CheckIcon } from '@heroicons/vue/outline'
import DeploymentWarning from '../../../components/DeploymentWarning.vue'
import HttpError from '../../../components/HttpError.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import NetworkRegion from '../../../components/server/deploy/NetworkRegion.vue'
import Slider from '../../../layout/Slider.vue'
import ValidationError from '../../../components/ValidationError.vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { computed, reactive, ref } from 'vue'

const router = useRouter()
const store = useStore()

const disabled = computed(() => store.state.balanceWarning || store.state.balanceSuspend || store.state.isRegionDisabled)
const error = ref()
const loading = ref(false)

const formState = reactive({
  multiuser: false,
  name: '',
  region: '',
  speed: 'fast'
})

const httpError = computed(() => {
  if (error && typeof error.status === 'number') {
    return error
  }
  return null
})

const internalServerError = computed(() => {
  if (error && error.status === 500) {
    return error
  }
  return null
})

const overCapacityError = computed(() => {
  if (error && error.status === 500 && error.response.body.detail === 'there is no suitable node in cluster') {
    return error
  }
  return null
})

const v$ = useVuelidate({
  multiuser: [],
  name: [validation.required],
  region: [validation.required],
  speed: [validation.oneOf(['fast', 'faster', 'fastest'])]
}, formState)

const canDeploy = computed(() => v$.value.$anyDirty && !v$.value.$invalid)

const speedMarks = { 0: 'Fast', 1: 'Faster', 2: 'Fastest' }

async function deploy() {
  await v$.value.$validate()
  if (v$.$invalid) return

  try {
    error.value = null
    loading.value = true

    const res = await utils.createVpn(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, {
      vpn: {
        ...formState,
        account: store.state.session.account
      }
    })

    for (const i in res.tasks) {
      store.commit('addTask', res.tasks[i])
    }

    router.push({ name: 'VPN', params: { id: res.vpn._key }})
  }
  catch (err) {
    error.value = err
    return
  }
  finally {
    loading.value = false
  }

  console.log({ ...formState })
}

function formatSpeedMark(value) {
  if (value === 2) return 'Fastest'
  if (value === 1) return 'Faster'
  return 'Fast'
}

function setRegion(region) {
  formState.region = region._key
}

function setSpeed(value) {
  formState.speed = formatSpeedMark(value).toLowerCase()
}
</script>

<template>
  <div class="mainContent__inner">
    <h1>Deploy a new VPN</h1>
    <form class="flex flex-col col-span-12 pb-20 space-y-4">
      <!-- balance warning -->
      <DeploymentWarning v-if="store.state.balanceSuspend || store.state.balanceWarning" />

      <!-- network region -->
      <div class="box">
        <h4>Network region</h4>
        <NetworkRegion
          :disableControls=disabled
          @region-changed="setRegion"
          ref="networkRegion"
        />
      </div>

      <!-- server specs - cpu / ram / storage -->
      <div class="box">
        <h4>VPN specs</h4>

        <!-- Single/multi-user -->
        <RadioGroup v-model="formState.multiuser">
          <div class="box__grid mb-8">
            <RadioGroupOption as="template" :value="false" :disabled="disabled" v-slot="{ active, checked, disabled }">
              <div :class="{ radioOption: true, active, checked, disabled }">
                <div :class="{ checkmark: true, active, checked }">
                  <CheckIcon class="checkmark__icon" />
                </div>
                <div class="optionDetails">
                  <RadioGroupLabel as="h4" class="optionDetails__name">
                    Single-user VPN
                  </RadioGroupLabel>
                  <RadioGroupDescription as="span" class="optionDetails__description">
                    <span>Ideal for individual use.</span>
                  </RadioGroupDescription>
                </div>
              </div>
            </RadioGroupOption>

            <RadioGroupOption as="template" :value="true" :disabled="disabled" v-slot="{ active, checked, disabled }">
              <div :class="{ radioOption: true, active, checked, disabled }">
                <div :class="{ checkmark: true, active, checked }">
                  <CheckIcon class="checkmark__icon" />
                </div>
                <div class="optionDetails">
                  <RadioGroupLabel as="h4" class="optionDetails__name">
                    Multi-user VPN
                  </RadioGroupLabel>
                  <RadioGroupDescription as="span" class="optionDetails__description">
                    <span>Multi-user VPN includes up to five users. You can pay for additional users.</span>
                  </RadioGroupDescription>
                </div>
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>

        <!-- VPN speed -->
        <Slider
          :disabled="disabled"
          :formatter="formatSpeedMark"
          :marks="speedMarks"
          :max="2"
          :min="0"
          title="Speed"
          tooltip="always"
          @change="setSpeed"
        />
        <ValidationError :errors="v$.speed.$errors" />
      </div>

      <!-- server name -->
      <div class="box">
        <div class="flex flex-col pb-2 space-y-6">
          <div class="input-group">
            <label class="label">Name</label>
            <input
              class="input input--floating"
              placeholder="My VPN"
              required
              type="text"
              :class="{ disabled }"
              :disabled="disabled"
              v-model="v$.name.$model"
            />
          </div>
        </div>
        <ValidationError :errors="v$.name.$errors" />
      </div>

      <!-- deploy button & error message -->
      <div class="flex flex-col w-full space-y-2">
        <button
          @click.prevent="deploy"
          :disabled="!canDeploy"
          class="button button--success self-end w-full md:max-w-xs"
        >
          <div v-if="loading" class="flex">
            <span>Deploying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Deploy</span>
        </button>

        <div v-if="overCapacityError" class="server__error over-capacity">
          <span class="font-bold">We're over capacity</span>
          <span>It appears that we are at capacity in this region. We're working hard to increase this. Please check back soon.</span>
        </div>
        <div v-else-if="internalServerError" class="server__error">
          <span class="font-bold">Something went wrong</span>
          <span>There was an issue while deploying this VPN. Please try again, or contact support@edge.network if the issue persists.</span>
        </div>
        <div v-else-if="httpError" class="flex md:justify-end mt-2">
          <HttpError :error="httpError" />
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.box__grid {
  @apply mt-6 w-full grid grid-cols-1 gap-4;
  @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4;
}

/* radio option */
.radioOption {
  @apply relative flex space-x-3 items-start p-5 border border-gray-300 rounded-md cursor-pointer;
  @apply hover:bg-gray-100 hover:bg-opacity-50;
  @apply focus:outline-none;
}
.radioOption.active {
  @apply border-green border-opacity-40;
}
.radioOption.checked {
  @apply bg-gray-100 border-green bg-opacity-75;
  @apply ring-4 ring-green ring-opacity-10;
}
.radioOption.disabled {
  @apply cursor-not-allowed opacity-50;
}

/* radio option details */
.optionDetails {
  @apply flex flex-col flex-1 text-sm;
}
.optionDetails__city {
  @apply text-sm text-gray-500;
}

/* checkmark */
.checkmark {
  @apply flex items-center justify-center text-white flex-shrink-0 rounded-full w-5 h-5 bg-gray-100 border border-gray-300;
}
.checkmark.active {
  @apply border-green border-opacity-40 bg-opacity-20;
}
.checkmark.checked {
  @apply border-green bg-green;
}
.checkmark .checkmark__icon {
  @apply opacity-0 w-3 h-3;
}
.checkmark.active .checkmark__icon {
  @apply opacity-40;
}
.checkmark.checked .checkmark__icon {
  @apply opacity-100;
}
</style>
