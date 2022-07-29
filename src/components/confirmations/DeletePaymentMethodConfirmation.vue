<template>
  <Modal>
    <template v-slot:icon>
      <ExclamationIcon class="w-8 h-8" aria-hidden="true" />
    </template>
    <template v-slot:header>
      <span>Delete payment card</span>
    </template>
    <template v-slot:body>
      <div class="flex flex-col space-y-2">
        <li>This payment card will be permanently deleted.</li>
        <li v-if=isAutoTopUpCard class="font-bold">
          This card is used for auto payments. Auto payments will be disabled if you continue.
        </li>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full button button--small button--error"
        @click="confirm"
      >
        Yes, Delete
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
import { mapState } from 'vuex'

export default {
  name: 'DeletePaymentMethodConfirmation',
  props: ['paymentMethod'],
  components: {
    ExclamationIcon,
    Modal
  },
  computed: {
    ...mapState(['account']),
    isAutoTopUpCard() {
      return this.account.topup && this.paymentMethod._key === this.account.topup.paymentMethod
    }
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
