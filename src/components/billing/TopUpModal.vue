<template>
  <Modal>
    <template v-slot:header>
      <span class="text-green">Top Up Account</span>
    </template>
    <template v-slot:body>
      <div class="flex flex-col space-y-6">
        <!-- eslint-disable-next-line max-len -->
        <span>To top up your account, please transfer XE to the following wallet address. It may take up to 10 minutes for the balance to update.</span>
        <div class="relative">
          <div class="flex items-center w-full">
            <span class="address">{{ account.wallet.address }}</span>
            <button
              @click.prevent="copyToClipboard"
              class="text-gray-400 hover:text-green"
            >
              <DuplicateIcon class="ml-2 w-6 h-6" />
            </button>
          </div>
          <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
        </div>
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
import { DuplicateIcon } from '@heroicons/vue/outline'
import Modal from '@/components/Modal'
import { mapState } from 'vuex'

export default {
  name: 'TopUpModal',
  data() {
    return {
      copied: false
    }
  },
  components: {
    DuplicateIcon,
    Modal
  },
  computed: {
    ...mapState(['account'])
  },
  methods: {
    close() {
      this.$emit('modal-close')
    },
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account.wallet.address)
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    confirm() {
      this.$emit('modal-confirm')
    }
  }
}
</script>

<style scoped>
.address {
  @apply break-words text-md;
  width: calc(100% - 30px)
}
.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}
</style>
