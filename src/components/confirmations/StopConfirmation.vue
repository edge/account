<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Power Down {{ serverName }}</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: you are about to power down your server.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>You will still be charged for a powered down server</li>
        <li>To end billing, destroy the server instead</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Continue</template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'DestroyConfirmation',
  props: ['serverName'],
  components: {
    ExclamationIcon,
    Modal
  }
}
</script>
