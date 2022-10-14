<template>
  <div class="box flex flex-col justify-start">
    <h4>Transfer XE</h4>
    <div class="flex flex-col">
      <!-- eslint-disable-next-line max-len -->
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
      <!-- eslint-disable-next-line max-len -->
      <span>The minimum required balance is ${{ balance.threshold.warning.usd.toFixed(2)}}. Please ensure your account remains above this level to avoid restrictions.</span>
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
</style>
