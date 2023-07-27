<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Remove Account Email</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: you are removing the email address associated with your account.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>You will only be able to access this account with your account number. Make sure you have written this down</li>
        <li>If you lose your account number, you may not be able to recover your account</li>
        <li>You will no longer receive any email notifications</li>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full mt-3 button button--small button--outline sm:mt-0"
        @click="close"
      >
        Cancel
      </button>
      <button
        class="w-full button button--small button--error"
        @click="confirm"
      >
        Yes, Remove
      </button>
    </template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'RemoveEmailConfirmation',
  components: {
    ExclamationIcon,
    Modal
  },
  methods: {
    close() {
      this.$emit('modal-close')
    },
    confirm() {
      this.$emit('modal-confirm')
    }
  }
}
</script>

<style scoped>

</style>
