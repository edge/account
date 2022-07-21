<template>
  <div class="space-y-4">
    <div class="box">
      <div class="w-max">
        <router-link :to="{ name: 'Payments' }" class="flex items-center space-x-1 hover:text-green mb-4">
          <ArrowLeftIcon class="w-4" /><span>Back</span>
        </router-link>
      </div>
      <h4>Purchase
        <span v-if="isConfirmed || isCancelled">#{{this.purchaseId}} - <span
          class="capitalize font-normal"
          :class="[
            isConfirmed ? 'text-green' : '',
            isCancelled ? 'text-red' : '',
          ]"
        >{{ status }}</span></span>
        <span v-else>XE</span>
      </h4>

      <div v-if="purchase">
        <div v-if="processing">
          <div class="flex items-center space-x-2">
            <div><LoadingSpinner /></div>
            <span>Processing Payment</span>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <span>This could take a few minutes. Please do not refresh or navigate away from this page until the purchase is complete.</span>
        </div>
        <div v-else-if="purchaseIsInProgress(purchase)">
          <p>Enter your card payment details to purchase {{ purchasingXE }} XE for {{ purchasingUSD }} USD.</p>
          <div ref="paymentElement"/>
          <div class="flex flex-col space-y-2 lg:flex-row w-full lg:space-x-2 lg:space-y-0 mt-4">
            <button
              class="w-full button button--small button--success"
              @click="confirmPurchase"
              :disabled="completing"
            >
              <span>Complete purchase</span>
              <div v-if="completing" class="ml-1"><LoadingSpinner /></div>
            </button>
            <button
              class="w-full button button--small button--solid"
              @click="cancelPurchase"
              :disabled="completing"
            >
              Cancel purchase
            </button>
          </div>
          <div v-if="error" class="flex items-center errorMessage mt-2">
            <ExclamationIcon class="w-3.5 text-red" />
            <span class="errorMessage__text">{{
              error.message || 'Payment Declined'
            }}</span>
          </div>
        </div>
        <div v-else class="purchase__grid md:grid-cols-2 gap-y-4">
          <div><span class="label">Date</span>{{ formattedDate }}</div>
          <div><span class="label">Time</span>{{ formattedTime }}</div>
          <div><span class="label">
            {{ isConfirmed ? 'Sent' : 'Send' }}
          </span>{{ formattedSentAmount }}</div>
          <div><span class="label">
            {{ isConfirmed ? 'Received' : 'Receive' }}
          </span>{{ formattedReceivedAmount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import { ArrowLeftIcon, ExclamationIcon } from '@heroicons/vue/outline'

const statusLookup = {
  canceled: 'cancelled',
  processing: 'processing',
  requires_action: 'action required',
  requires_confirmation: 'confirmation required',
  requires_payment_method: 'payment required',
  succeeded: 'confirmed'
}

export default {
  name: 'Purchase',
  title() {
    return 'Edge Account Portal » Purchase'
  },
  data() {
    return {
      completing: false,
      error: null,
      iRefresh: null,
      processing: false,
      purchase: null
    }
  },
  components: {
    ArrowLeftIcon,
    ExclamationIcon,
    LoadingSpinner
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
    isCancelled() {
      return this.purchase && this.purchase.intent.status === 'canceled'
    },
    isConfirmed() {
      return this.purchase && this.purchase.intent.status === 'succeeded'
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
      return this.purchase && statusLookup[this.purchase.intent.status] || 'loading'
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
      this.completing = true
      // eslint-disable-next-line max-len
      const return_url = `${document.location.protocol}//${document.location.host}/billing/payments/purchase/${this.purchase._key}`

      try {
        this.error = null
        const purchase = await this.stripe.confirmPayment({
          elements: this.stripeElements,
          confirmParams: { return_url }
        })
        this.error = purchase.error || null
      }
      catch (error) {
        this.error = error
      }
      this.completing = false
    },
    purchaseIsInProgress(purchase) {
      return purchase.intent.status !== 'canceled' && purchase.intent.status !== 'succeeded'
    },
    async updatePurchase() {
      this.purchase = await utils.purchases.getPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.purchaseId
      )
      setTimeout(() => {
        if (this.purchaseIsInProgress(this.purchase)) {
          this.addPaymentForm()
        }
      }, 0)
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
    this.updatePurchase()
    if (this.redirectStatus === 'succeeded') {
      this.processing = true
      setTimeout(async () => {
        this.refreshPurchase()
      }, 2000)
    }
    this.iRefresh = setInterval(() => {
      this.refreshPurchase()
    }, 15 * 1000)
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
      if (!this.purchaseIsInProgress(newPurchase)) {
        this.processing = false
        clearInterval(this.iRefresh)
      }
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
  @apply font-bold block;
}

.purchase__grid {
  @apply grid gap-y-4
}

@media (min-width: 450px) {
  .purchase__grid {
    @apply grid-cols-2;
  }
}
</style>
