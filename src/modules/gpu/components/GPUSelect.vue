<script setup>
/* global process */

import superagent from 'superagent'
import { useStore } from 'vuex'
import { RadioGroup, RadioGroupLabel, RadioGroupOption, RadioGroupDescription } from '@headlessui/vue'
import { defineModel, defineProps, effect, ref } from 'vue'
import NvidiaIcon from '../../../components/icons/NvidiaIcon.vue'
import { CheckIcon } from '@heroicons/vue/outline'

const model = defineModel()
const store = useStore()

defineProps({
  disabled: Boolean
})

const error = ref()
const gpus = ref([])
const loading = ref(true)

async function reload() {
  if (!store.state.session || !store.state.session._key) return

  try {
    loading.value = true
    error.value = undefined

    const res = await superagent.get(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/vms/gpu-models`)
      .set('Authorization', `Bearer ${store.state.session._key}`)

    gpus.value = res.body
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

// const gpus = [
//   {
//     _key: 'a100',
//     cudoId: 'nvidia-a100-pcie',
//     vendorName: 'nvidia',
//     modelName: 'A100 PCI-E',
//     memoryGib: 80
//   },
//   {
//     _key: 'h100',
//     cudoId: 'nvidia-h100-nvl-pcie',
//     vendorName: 'nvidia',
//     modelName: 'H100 NVL PCI-E',
//     memoryGib: 96
//   }
// ]
</script>

<template>
  <RadioGroup v-model="model">
    <RadioGroupLabel class="sr-only">GPU Model</RadioGroupLabel>

    <div class="box__grid">
      <div
        v-for="gpu in gpus"
        :key="gpu.id"
        class="flex flex-col"
      >
        <RadioGroupOption
          as="template"
          :value="gpu.id"
          v-slot="{ active, checked, disabled }"
          :disabled="disabled"
        >
          <div
            :class="[
              active ? 'active' : '',
              checked ? 'checked' : '',
              disabled ? 'disabled' : ''
            ]"
            class="radioOption"
          >
            <div
              class="checkmark"
              :class="[
                active ? 'active' : '',
                checked ? 'checked' : ''
              ]"
            >
              <CheckIcon class="checkmark__icon" />
            </div>
            <div class="optionDetails">
              <RadioGroupLabel as="h4" class="optionDetails__model">
                {{ gpu.modelName }}
              </RadioGroupLabel>
              <RadioGroupDescription as="span" class="optionDetails__memory">
                <span class="flex items-center space-x-2">
                  <span>NVIDIA</span>
                  <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{{ gpu.memoryGib }} GB</span>
                </span>
              </RadioGroupDescription>
            </div>
            <NvidiaIcon className="w-10" />
          </div>
        </RadioGroupOption>
      </div>
    </div>
  </RadioGroup>
</template>

<style scoped>
.box__grid {
  @apply mt-6 w-full grid grid-cols-1 gap-4;
  @apply sm:grid-cols-1 lg:grid-cols-2;
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
.optionDetails__memory {
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
