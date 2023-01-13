<template>
  <Modal>
    <template v-slot:header>
      <span class="text-green">Confirm subscription</span>
    </template>
    <template v-slot:body>
      <div v-if="balanceWarning">
        <!-- eslint-disable-next-line max-len -->
        <span>You need at least ${{ balance.threshold.warning.usd }} to upgrade to Priority Support. Please add funds to your account and try again.</span>
      </div>
      <div v-else class="flex flex-col space-y-2">
        <span>You will be billed daily for this support plan.</span>
        <span v-if="product.minDuration">
          There is a minimum term of {{ product.minDuration / 24 }} days before you can cancel this plan.
        </span>
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
        class="w-full button button--small button--success"
        @click="confirm"
        :disabled="balanceWarning"
      >
        Confirm
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'SubscriptionConfirmation',
  props: ['product'],
  components: {
    Modal
  },
  computed: {
    ...mapGetters(['balanceWarning']),
    ...mapState(['balance'])
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
