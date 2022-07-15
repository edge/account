<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <Calculator @update="onCalculatorUpdate">
        <template v-slot:buttons>
          <button class="w-full mt-3 button button--small button--success sm:mt-0" @click="startPurchase">
            Purchase XE
          </button>
        </template>
      </Calculator>
    </div>
    <div class="box flex flex-col space-y-4">
      <h4>Add a Payment Card</h4>
      <p>Adding a card makes it simple to top-up your account in future and enables the automatic top-up feature.</p>
      <button v-if="!showCard" @click="startAddPaymentMethod" class="button button--small button--success">
        Click here to add a card
      </button>
      <div ref="cardElement"/>
      <button
        v-if="showCard"
        @click="addPaymentMethod"
        class="w-full mt-3 button button--small button--success sm:mt-0"
      >
        Add card
      </button>
    </div>
  </div>
</template>

<script>
/* global process*/

import * as format from '@/utils/format'
import * as utils from '@/account-utils'
import Calculator from '@/components/billing/Calculator'
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

      const purchase = await utils.purchases.createPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        data
      )

      this.$router.push({ name: 'Purchase', params: { id: purchase._key } })
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
