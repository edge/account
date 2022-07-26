<template>
  <div class="box">
    <h4>Manually Add Funds</h4>
    <div class="flex flex-col">
      <p>Make a one off  purchase of XE to add funds to your account.</p>
      <div class="converter flex items-center space-x-2 mb-5">
        <div class="currency symbol flex justify-between">
          <input type="number" v-model="inputAmount" @focusout="formatInput" />
          {{ usdToXe ? 'USD' : 'XE' }}
        </div>
        <button @click="flipConversion" class="converter__toggle hover:text-green">
          <SwitchHorizontalIcon class="w-5"/>
        </button>
        <div class="currency flex justify-between">
          {{ usdToXe ? formattedXE : formattedUSD }} <span>{{ usdToXe ? 'XE' : 'USD' }}</span>
        </div>
      </div>
      <slot name="buttons"/>
    </div>
  </div>
</template>

<script>
import { SwitchHorizontalIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

export default {
  name: 'AddFundsCalculator',
  data() {
    return {
      copied: false,
      inputAmount: 5.00,
      usdToXe: true
    }
  },
  components: {
    SwitchHorizontalIcon
  },
  computed: {
    ...mapState(['account', 'balance']),
    formattedUSD() {
      return this.usdToXe ?
        Number(this.inputAmount).toFixed(2) :
        (this.inputAmount * this.balance.token.usdPerXe).toFixed(2)
    },
    formattedXE() {
      return this.usdToXe ? (this.inputAmount / this.balance.token.usdPerXe).toFixed(6) : Number(this.inputAmount).toFixed(6)
    }
  },
  methods: {
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account.wallet.address)
      setTimeout(() => {
        this.copied = false
      }, 2000)
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
  },
  watch: {
    inputAmount(value) {
      const numValue = parseFloat(value)
      const usd = this.usdToXe ? numValue : Math.round(100 * (numValue * this.balance.token.usdPerXe))/100
      const xe = !this.usdToXe ? numValue : Math.round((numValue / this.balance.token.usdPerXe) * 1e6) / 1e6
      this.$emit('update', { usd, xe })
    }
  }
}
</script>

<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full mb-4 font-medium;
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
  @apply w-full;
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
