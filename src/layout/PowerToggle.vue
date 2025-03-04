<script setup>
import LoadingSpinner from '../components/icons/LoadingSpinner.vue'
import { Switch } from '@headlessui/vue'
import { defineEmits, defineModel, defineProps } from 'vue'

const emit = defineEmits(['click'])

/** v-model must be a Boolean ref! */
const model = defineModel()

defineProps({
  busy: Boolean,
  disabled: Boolean,
  offText: String,
  on: Boolean,
  onText: String
})
</script>

<template>
  <Switch
    v-model="model"
    class="relative inline-flex flex-shrink-0 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-16 md:w-20 h-7 md:h-8 focus:outline-none"
    :class="model ? 'bg-green' : 'bg-gray-300'"
    :disabled="busy || disabled"
    @click="emit('click', !model)"
  >
    <span class="sr-only">Status</span>

    <span v-if="model" class="absolute w-full h-full flex items-center text-xs leading-none justify-start text-white pl-3 md:pl-4">
      <span v-if="busy">
        <LoadingSpinner />
      </span>
      <span v-else>{{ onText || 'ON' }}</span>
    </span>
    <span v-else class="absolute w-full h-full flex items-center text-xs leading-none justify-end text-gray-500 pr-2.5 md:pr-3.5">
      <span v-if="busy">
        <LoadingSpinner />
      </span>
      <span v-else>{{ offText || 'OFF' }}</span>
    </span>

    <span v-if="model" aria-hidden class="translate-x-9 md:translate-x-12 transform inline-block w-6 h-6 md:w-7 md:h-7 transition duration-200 ease-in-out bg-white rounded-full shadow-lg pointer-events-none ring-0"/>
    <span v-else aria-hidden class="translate-x-0 transform inline-block w-6 h-6 md:w-7 md:h-7 transition duration-200 ease-in-out bg-white rounded-full shadow-lg pointer-events-none ring-0"/>
  </Switch>
</template>
