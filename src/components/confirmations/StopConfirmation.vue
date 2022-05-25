<template>
  <ModalTest>
    <template v-slot:icon>
      <ExclamationIcon class="w-6 h-6" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <h4>Power Down Server</h4>
    </template>
    <template v-slot:body>
      <span>You will still be billed for a powered down server. To end billing, destroy the server instead.</span>
    </template>
    <template v-slot:confirmButtonText>Continue</template>
  </ModalTest>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import ModalTest from '@/components/ModalTest'

export default {
  name: 'DestroyConfirmation',
  components: {
    ExclamationIcon,
    ModalTest
  }
}
</script>
