<template>
  <div class="box flex flex-col justify-start">
    <h4>Transfer XE</h4>
    <div class="flex flex-col">
      <p>Transfer XE to the following wallet address to add funds to your account. Transactions may take up to 10 minutes to process.</p>
      <div class="relative mb-4">
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
      <span v-if="!account.topup">The minimum required balance is ${{ balance.threshold.warning.usd.toFixed(2)}}. Please ensure your account remains above this level to avoid restrictions. Alternatively, you can set up Pay by Credit Card.</span>
      <span v-else>Pay by Credit Card is enabled for your account. You may still add funds at any time.</span>
    </div>
  </div>
</template>

<script>
import { DuplicateIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

export default {
  name: 'TransferXE',
  data() {
    return {
      copied: false,
      inputAmount: 5.00,
      usdToXe: true
    }
  },
  components: {
    DuplicateIcon
  },
  computed: {
    ...mapState(['account', 'balance'])
  },
  methods: {
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account.wallet.address)
      setTimeout(() => {
        this.copied = false
      }, 2000)
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
