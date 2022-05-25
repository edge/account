<template>
  <ModalTest>
    <template v-slot:icon>
      <ExclamationIcon class="w-6 h-6" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <h4>Resize Server</h4>
    </template>
    <template v-slot:body>
      <span>Are you sure you wish to resize your server? This will cause a change in cost.</span>
    </template>
    <template v-slot:confirmButtonText>Resize</template>
  </ModalTest>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import ModalTest from '@/components/ModalTest'

export default {
  name: 'ResizeConfirmation',
  components: {
    ExclamationIcon,
    ModalTest
  }
}
</script>

<style scoped>
.specs {
  @apply text-red;
}

.current {
  @apply text-red;
}

.new {
  @apply text-black;
}
</style>
