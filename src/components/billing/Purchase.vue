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
        <div v-else-if="status === 'succeeded'" class="grid lg:grid-cols-2">
          <div class="col-span-2"><span class="label">Status</span>{{ status }}</div>
          <div><span class="label">Sent</span>{{ formattedSentAmount }}</div>
          <div><span class="label">Received</span>{{ formattedReceivedAmount }}</div>
          <div><span class="label">Date</span>{{ formattedDate }}</div>
          <div><span class="label">Time</span>{{ formattedTime }}</div>
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
      iRefresh: null,
      purchase: null
    }
  },
  components: {
  },
  computed: {
    ...mapState(['session']),
    formattedDate() {
      return format.date(this.purchase.created)
    },
    formattedTime() {
      return format.time(this.purchase.created)
    },
    formattedSentAmount() {
      return `${format.usd(this.purchase.send.amount, 2)} USD`
    },
    formattedReceivedAmount() {
      return `${format.xe(this.purchase.receive.amount)} XE`
    },
    purchaseId() {
      return this.$route.params.id
    },
    purchasingXE() {
      return this.purchase && format.xe(this.purchase.receive.amount)
    },
    purchasingUSD() {
      return this.purchase && format.usd(this.purchase.send.amount, 2)
    },
    redirectStatus() {
      return this.$route.query.redirect_status
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
    async cancelPurchase() {
      this.purchase = await utils.purchases.cancelPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.purchaseId
      )
      this.$router.push({ name: 'Payments' })
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
      this.purchase = await utils.purchases.getPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.purchaseId
      )
      if (this.purchase.status !== 'succeeded') this.addPaymentForm()
    },
    async refreshPurchase() {
      try {
        this.purchase = await utils.purchases.refreshPurchase(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.purchaseId
        )
      }
      catch (error) {
        this.error = error
      }
    }
  },
  mounted() {
    if (this.redirectStatus === 'succeeded') {
      this.refreshPurchase()
      this.iRefresh = setInterval(() => {
        this.refreshPurchase()
      }, 15 * 1000)
    }
    else {
      this.getPurchase()
    }
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
  unmounted() {
    clearInterval(this.iRefresh)
  },
  setup() {
    const stripe = window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
    return {
      stripe
    }
  },
  watch: {
    purchase(newPurchase) {
      if (newPurchase.intent.status === 'succeeded') clearInterval(this.iRefresh)
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

.label {
  @apply font-bold;
}
</style>
