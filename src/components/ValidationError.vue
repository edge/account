<template>
  <div v-if="errors.length">
    <div class="errorMessage mt-1 validationError"
      v-for="error of errors"
      :key="error.$uid"
    >
      <div class="float-left"><ExclamationIcon class="w-3.5" /></div>
      <span class="errorMessage__text">{{ error.$message }}</span>
    </div>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'ValidationError',
  props: ['errors'],
  components: {
    ExclamationIcon
  }
}
</script>

<style scoped>
.validationError.errorMessage {
  @apply block;
}
</style>
