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
        <div class="flex flex-col space-y-2">
          <span>Use this converter to calculate how much XE to transfer.</span>

          <div class="flex items-center space-x-2">
            <div class="currency symbol flex justify-between">
              <input type="number" class="w-36" v-model="inputAmount" placeholder="5.00" @focusout="formatInput" />
              {{ usdToXe ? 'USD' : 'XE' }}
            </div>
            <button @click="flipConversion" class="hover:text-green">
              <SwitchHorizontalIcon class="w-5"/>
            </button>
            <div class="currency flex justify-between">
              {{ usdToXe ? formattedXE : formattedUSD }} <span>{{ usdToXe ? 'XE' : 'USD' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full mt-3 button button--small button--outline sm:mt-0"
        @click="close"
      >
        Close
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import { mapState } from 'vuex'
import { DuplicateIcon, SwitchHorizontalIcon } from '@heroicons/vue/outline'

export default {
  name: 'TopUpModal',
  data() {
    return {
      copied: false,
      inputAmount: 5.00,
      usdToXe: true
    }
  },
  components: {
    DuplicateIcon,
    Modal,
    SwitchHorizontalIcon
  },
  computed: {
    ...mapState(['account', 'balance']),
    formattedUSD() {
      return this.usdToXe ? this.inputAmount.toFixed(2) : (this.inputAmount * this.balance.token.usdPerXe).toFixed(2)
    },
    formattedXE() {
      return this.usdToXe ? (this.inputAmount / this.balance.token.usdPerXe).toFixed(6) : this.inputAmount.toFixed(6)
    }
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
    },
    flipConversion() {
      if (this.usdToXe) this.inputAmount = this.formattedXE
      else this.inputAmount = this.formattedUSD
      this.usdToXe = !this.usdToXe
    },
    formatInput() {
      if (this.usdToXe) this.inputAmount = this.formattedUSD
      else this.inputAmount = this.formattedXE
    }
  },
  mounted() {
    this.inputAmount = (5).toFixed(2)
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

.currency {
  @apply border border-gray-500 rounded w-1/2 py-2 px-4;
}

input:focus {
  outline: none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>
