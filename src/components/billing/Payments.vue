<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <AddFundsCalculator @update="onCalculatorUpdate">
        <template v-slot:buttons>
          <button
            class="w-full md:max-w-xs mt-3 button button--small button--success sm:mt-0"
            @click="startPurchase"
          >
            Purchase XE
          </button>
        </template>
      </AddFundsCalculator>
    </div>
    <div class="box flex flex-col">
      <h4>Add a Payment Card</h4>
      <p>Adding a card makes it simple to top-up your account in future and enables the automatic top-up feature.</p>
      <PaymentMethodTable />
      <button
        v-if="!showCard"
        @click="startAddPaymentMethod"
        class="w-full md:max-w-xs button button--small button--success"
      >
        Click here to add a card
      </button>
      <div class="mb-4" ref="paymentElement"/>
      <button
        v-if="showCard"
        @click="addPaymentMethod"
        class="w-full md:max-w-xs mt-3 button button--small button--success sm:mt-0"
      >
        Add card
      </button>
    </div>
    <div class="box">
      <h4>Purchase History</h4>
      <PurchaseTable />
    </div>
  </div>
</template>

<script>
/* global process*/

import * as format from '@/utils/format'
import * as utils from '@/account-utils'
import AddFundsCalculator from '@/components/billing/AddFundsCalculator'
import PaymentMethodTable from '@/components/billing/PaymentMethodTable'
import PurchaseTable from '@/components/billing/PurchaseTable'
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
      paymentElement: null,

      paymentMethods: null
    }
  },
  components: {
    AddFundsCalculator,
    PaymentMethodTable,
    PurchaseTable
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
      // eslint-disable-next-line max-len
      const return_url = `${document.location.protocol}//${document.location.host}/billing/payments`

      const { error } = await this.stripe.confirmSetup({
        elements: this.stripeElements,
        confirmParams: { return_url }
      })
      if (error) throw error
    },
    async handleSetupIntentRedirect() {
      console.log(this.$route.query.setup_intent, this.$route.query.redirect_status)
      if (this.$route.query.redirect_status === 'succeeded') {
        await utils.billing.addPaymentMethod(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          name: 'Credit Card',
          stripe: this.$route.query.setup_intent
        })
      }
    },
    onCalculatorUpdate({ usd, xe }) {
      this.calculatedUSD = usd
      this.calculatedXE = xe
    },
    async startAddPaymentMethod() {
      const intent = await utils.billing.createStripeSetupIntent(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key)

      this.stripeElements = this.stripe.elements({ clientSecret: intent.client_secret })
      this.paymentElement = this.stripeElements.create('payment')
      this.paymentElement.mount(this.$refs.paymentElement)
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
  mounted() {
    this.handleSetupIntentRedirect()
  },
  unmounted() {
    clearInterval(this.iPaymentMethods)
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
