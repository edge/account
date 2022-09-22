<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Destroy {{ integrationName }}</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Warning: this cannot be undone.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>PLACEHOLDER</li>
        <li>PLACEHOLDER</li>
        <li>PLACEHOLDER</li>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full button button--small button--error"
        @click="confirm"
      >
        Yes, Destroy Server
      </button>
      <button
        class="w-full mt-3 button button--small button--outline sm:mt-0"
        @click="close"
      >
        Cancel
      </button>
    </template>
  </Modal>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'

export default {
  name: 'IntegrationDestroyConfirmation',
  props: ['integrationName'],
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
