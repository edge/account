<template>
  <div>
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
        <button class="w-full mt-3 button button--small button--success sm:mt-0" @click="confirmPurchase">
          Complete purchase
        </button>
        <a @click="cancelPurchase">Cancel purchase</a>
      </div>
    </div>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <h4>Add a Payment Card</h4>
      <p>Adding a card makes it simple to top-up your account in future and enables the automatic top-up feature.</p>
      <p @click="startAddPaymentMethod">Click here to add a card</p>
      <div ref="cardElement"/>
      <button v-if="showCard" class="w-full mt-3 button button--small button--success sm:mt-0" @click="addPaymentMethod">
        Add card
      </button>
    </div>
  </div>
</template>

<script>
/* global process*/

import * as format from '@/utils/format'
import * as utils from '@/account-utils'
import Calculator from '@/components/funding/Calculator'
import { mapState } from 'vuex'

export default {
  name: 'Payments',
  data() {
    return {
      copied: false,
      iBalance: null,
      rate: null,
      showCard: false,
      showCheckout: false,
      calculatedUSD: 0,
      calculatedXE: 0,
      purchasingUSD: 0,
      purchasingXE: 0,

      purchase: null,
      cardElement: null,
      paymentElement: null
    }
  },
  components: {
    Calculator
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
    async addPaymentMethod() {
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement
      })
      if (error) throw error

      await utils.billing.addPaymentMethod(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
        name: 'Test Credit Card',
        stripe: {
          id: paymentMethod.id
        }
      })
    },
    cancelPurchase () {
      this.showCheckout = false
      /** @todo cancel through API */
    },
    async confirmPurchase() {
      // eslint-disable-next-line max-len
      const return_url = `${document.location.protocol}//${document.location.host}/funding/purchase/${this.purchase._key}`

      await this.stripe.confirmPayment({
        elements: this.stripeElements,
        confirmParams: { return_url }
      })
    },
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account.wallet.address)
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    onCalculatorUpdate({ usd, xe }) {
      this.calculatedUSD = usd
      this.calculatedXE = xe
    },
    startAddPaymentMethod() {
      this.stripeElements = this.stripe.elements()
      this.cardElement = this.stripeElements.create('card')
      this.cardElement.mount(this.$refs.cardElement)
      this.showCard = true
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

      this.purchase = await utils.purchases.createPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        data
      )

      this.stripeElements = this.stripe.elements({ clientSecret: this.purchase.intent.client_secret })
      this.paymentElement = this.stripeElements.create('payment')
      this.paymentElement.mount(this.$refs.paymentElement)
    }
  },
  setup() {
    const stripe = window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
    return {
      stripe
    }
  }
}
</script>

<style>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full pb-2 mb-4 font-medium;
}
</style>
