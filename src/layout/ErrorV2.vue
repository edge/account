<script setup>
import { ExclamationIcon } from '@heroicons/vue/outline'
import { computed, defineProps } from 'vue'

const props = defineProps({
  error: Object
})

const message = computed(() => {
  if (!props.error) return ''

  if (props.error && props.error.response && props.error.response.body) {
    const body = props.error.response.body
    if (body.hint) return body.hint
    if (body.reason) return body.reason
    if (body.error) return body.error
    if (body.message) return body.message
  }

  if (props.error.value && props.error.message) {
    return props.error.message
  }

  return 'Unknown error'
})
</script>

<template>
  <div v-if="error" class="error_wrapper block errorMessage">
    <div class="float-left">
      <ExclamationIcon class="w-3.5 text-red" />
    </div>
    <span class="errorMessage__text text-red">{{ message }}</span>
  </div>
</template>
