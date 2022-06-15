<template>
  <Modal>
    <template v-slot:header>
      <span>Top-up account</span>
    </template>
    <template v-slot:body>
      <span class="font-semibold">Top-Up Instructions TBD.</span>
      <div class="flex flex-col space-y-2 pt-4">
        <li>Transfer funds to {{ account.wallet.address }}</li>
      </div>
    </template>
    <template v-slot:buttons>
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
import { mapState } from 'vuex'

export default {
  name: 'TopUpModal',
  components: {
    Modal
  },
  computed: {
    ...mapState(['account'])
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
