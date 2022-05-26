<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Disable 2FA</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: your account won't be secure.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>Your account can be accessed with just the account number</li>
        <li>You can re-enable 2FA at any point</li>
      </div>
    </template>
    <template v-slot:confirmButtonText>Yes, Disable 2FA</template>
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
