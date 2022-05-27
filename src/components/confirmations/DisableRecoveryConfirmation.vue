<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Remove Recovery Email</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: you are removing your recovery email.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>If you lose your account number, you will have no way to recover your account</li>
        <li>You can re-enable a recovery email at any point</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Yes, Disable</template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'Disable2FAConfirmation',
  components: {
    ExclamationIcon,
    Modal
  }
}
</script>

<style scoped>

</style>
