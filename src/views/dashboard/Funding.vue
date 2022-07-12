<template>
  <div class="mainContent__inner space-y-4">
    <h1>Funding</h1>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <DetailsBox />
      <div class="box">
        <ReferralCode />
      </div>
    </div>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <Calculator @update="onCalculatorUpdate">
        <template v-slot:buttons>
          <button class="w-full mt-3 button button--small button--success sm:mt-0" @click="startPurchase">
            Purchase XE
          </button>
        </template>
      </Calculator>
    </div>
    <div v-if="showCheckout" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Purchase XE</h4>
        <p>Enter your card payment details to purchase {{purchasingXE}} XE for {{purchasingUSD}} USD.</p>
        <div ref="paymentElement"/>
        <button class="w-full mt-3 button button--small button--success sm:mt-0" @click="purchase">
          Complete purchase
        </button>
        <a @click="cancelPurchase">Cancel purchase</a>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@/account-utils'
import Calculator from '@/components/funding/Calculator'
import DetailsBox from '@/components/account/DetailsBox'
import PaymentInfo from '@/components/funding/PaymentInfo'
import ReferralCode from '@/components/ReferralCode'
import { mapState } from 'vuex'

export default {
  name: 'Billing',
  title() {
    return 'Edge Account Portal » Funding'
  },
  components: {
    Calculator,
    DetailsBox,
    PaymentInfo,
    ReferralCode
  },
  data() {
    return {
      copied: false,
      iBalance: null,
      rate: null,
      showCheckout: false,
      calculatedUSD: 0,
      calculatedXE: 0,
      purchasingUSD: 0,
      purchasingXE: 0,

      stripeElements: null,
      paymentElement: null
    }
  },
  computed: {
    ...mapState(['account', 'balance', 'session']),
    explorerUrlWallet() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.account.wallet.address}`
    },
    formattedBalance() {
      return format.xe(this.balance.total.xe)
    },
    formattedUSDBalance() {
      return format.usd(this.usdBalance, 2)
    },
    usdBalance() {
      return this.balance.total.usd
    }
  },
  methods: {
    cancelPurchase () {
      this.showCheckout = false
      /** @todo cancel through API */
    },
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account.wallet.address)
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    async purchase() {
      const return_url = [
        document.location.protocol,
        '://',
        document.location.host,
        '/funding'
      ].join('')
      console.log(return_url)

      await this.stripe.confirmPayment({
        elements: this.stripeElements,
        confirmParams: { return_url }
      })
    },
    onCalculatorUpdate({ usd, xe }) {
      this.calculatedUSD = usd
      this.calculatedXE = xe
    },
    async startPurchase() {
      this.purchasingUSD = this.calculatedUSD
      this.purchasingXE = this.calculatedXE
      this.showCheckout = true

      const data = {
        send: {
          amount: this.calculatedUSD,
          currency: 'USD'
        },
        receive: {
          currency: 'XE'
        }
      }

      const result = await utils.fiat.createPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        data
      )

      this.stripeElements = this.stripe.elements({ clientSecret: result.intent.client_secret })
      this.paymentElement = this.stripeElements.create('payment')
      this.paymentElement.mount(this.$refs.paymentElement)
    }
  },
  setup() {
    return {
      stripe: window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full pb-2 mb-4 font-medium;
}
</style>
