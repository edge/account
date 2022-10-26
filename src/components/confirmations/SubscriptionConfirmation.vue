<template>
  <Modal>
    <template v-slot:header>
      <span class="text-green">Confirm subscription</span>
    </template>
    <template v-slot:body>
      <div class="flex flex-col space-y-2 pt-4">
        You will be billed daily for this support plan.
        <span v-if="product.minDuration">
          There is a minimum term of {{ product.minDuration / 24 }} days before you can cancel this plan.
        </span>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full button button--small button--success"
        @click="confirm"
      >
        Confirm
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
import Modal from '@/components/Modal'

export default {
  name: 'SubscriptionConfirmation',
  props: ['product'],
  components: {
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
