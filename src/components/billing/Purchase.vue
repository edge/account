<template>
  <div class="space-y-4">
    <div class="box">
      <h4>Purchase #{{this.purchaseId}}</h4>

      <div v-if="status !== 'succeeded'">
        <p>Enter your card payment details to purchase {{ purchasingXE }} XE for {{ purchasingUSD }} USD.</p>
        <div ref="paymentElement"/>
        <div class="flex flex-col space-y-2 lg:flex-row w-full lg:space-x-2 lg:space-y-0 mt-4">
          <button class="w-full button button--small button--success" @click="confirmPurchase">
          Complete purchase
          </button>
          <button class="w-full button button--small button--solid" @click="cancelPurchase">Cancel purchase</button>
        </div>
      </div>
      <div v-else>
        <div v-if="error" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
          <h4>Error loading purchase</h4>
          <p>{{error.message}}</p>
        </div>
        <div v-else-if="status === 'loading'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
          <h4>Loading...</h4>
        </div>
        <div v-else-if="status === 'succeeded'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
          <h4>Purchase Complete</h4>
        </div>
        <div v-else-if="status === 'processing'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
          <h4>Processing...</h4>
        </div>
        <div v-else-if="status === 'canceled'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
          <h4>Purchase Cancelled</h4>
        </div>
        <div v-else class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
          <h4>Purchase Incomplete</h4>
          <p>{{purchase.intent.status}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@/account-utils'
import { mapState } from 'vuex'

export default {
  name: 'Purchase',
  title() {
    return 'Edge Account Portal » Purchase'
  },
  data() {
    return {
      error: null,
      purchase: null
    }
  },
  components: {
  },
  computed: {
    ...mapState(['session']),
    purchaseId() {
      return this.$route.params.id
    },
    purchasingXE() {
      return this.purchase && format.xe(this.purchase.receive.amount)
    },
    purchasingUSD() {
      return this.purchase && format.usd(this.purchase.send.amount, 2)
    },
    status() {
      /** @see https://stripe.com/docs/payments/intents#intent-statuses */
      if (this.error) return 'error'
      return this.purchase && this.purchase.intent.status || 'loading'
    }
  },
  methods: {
    addPaymentForm() {
      this.stripeElements = this.stripe.elements({ clientSecret: this.purchase.intent.client_secret })
      this.paymentElement = this.stripeElements.create('payment')
      this.paymentElement.mount(this.$refs.paymentElement)
    },
    cancelPurchase () {
      this.$router.push({ name: 'Payments' })
      /** @todo cancel through API */
    },
    async confirmPurchase() {
      // eslint-disable-next-line max-len
      const return_url = `${document.location.protocol}//${document.location.host}/billing/payments/purchase/${this.purchase._key}`

      await this.stripe.confirmPayment({
        elements: this.stripeElements,
        confirmParams: { return_url }
      })
    },
    async getPurchase() {
      this.showCheckout = true

      this.purchase = await utils.purchases.getPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.purchaseId
      )
      console.log(this.purchase.intent.status)

      if (this.purchase.intent.status === 'succeeded') {
        utils.purchases.refreshPurchase(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.purchaseId
        )
          .then(purchase => {
            this.purchase = purchase
          })
          .catch(err => {
            this.error = err
          })
      }
      else {
        this.addPaymentForm()
      }
    }
  },
  mounted() {
    this.getPurchase()
    // utils.purchases.refreshPurchase(
    //   process.env.VUE_APP_ACCOUNT_API_URL,
    //   this.session._key,
    //   this.purchaseId
    // )
    //   .then(purchase => {
    //     this.purchase = purchase
    //   })
    //   .catch(err => {
    //     this.error = err
    //   })
  },
  setup() {
    const stripe = window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
    return {
      stripe
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
