<template>
  <Modal>
    <template v-slot:header>
      <span class="text-green">Add Funds</span>
    </template>
    <template v-slot:body>
      <div class="flex flex-col space-y-6">
        <!-- eslint-disable-next-line max-len -->
        <span>To add funds to your account, please transfer XE to the following wallet address. It may take up to 10 minutes for the balance to update.</span>
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
          <!-- eslint-disable-next-line max-len -->
          <span>We recommend always keeping your balance above ${{ balance.threshold.warning.usd.toFixed(2)}}. Use this converter to calculate how much XE to transfer.</span>

          <div class="converter flex items-center space-x-2">
            <div class="currency symbol flex justify-between">
              <input type="number" class="w-36" v-model="inputAmount" @focusout="formatInput" />
              {{ usdToXe ? 'USD' : 'XE' }}
            </div>
            <button @click="flipConversion" class="converter__toggle hover:text-green">
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
        class="w-full mt-3 button button--small button--success sm:mt-0"
        @click="close"
      >
        Close
      </button>
    </template>
  </Modal>
</template>

<script>
import * as format from '../../utils/format'
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
      return this.usdToXe ?
        format.usd(this.inputAmount, 2) :
        format.usd(this.inputAmount * this.balance.token.usdPerXe, 2)
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
      if (!this.inputAmount) this.inputAmount = 0
      if (this.usdToXe) this.inputAmount = this.formattedUSD
      else this.inputAmount = this.formattedXE
    }
  },
  mounted() {
    this.inputAmount = (this.balance.threshold.warning.usd).toFixed(2)
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

/* remove input defualy focus and arrows */
input:focus {
  outline: none;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

@media (max-width: 500px) {
  .converter {
    @apply grid space-x-0 gap-y-2 gap-x-4;
    grid-template-columns: auto 20px;

  }
  .converter .currency {
    @apply w-full
  }
  .converter .converter__toggle {
    @apply row-span-2;
  }
}
</style>
