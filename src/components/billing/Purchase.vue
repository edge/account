<template>
  <div class="space-y-4">
    <div class="box">
      <div class="w-max">
        <router-link :to="{ name: 'Payments' }" class="flex items-center space-x-1 hover:text-green mb-4">
          <ArrowLeftIcon class="w-4" /><span>Back</span>
        </router-link>
      </div>
      <h4>Purchase
        <span v-if="isConfirmed || isCancelled || isProcessing">#{{this.purchaseId}} - <span
          class="capitalize font-normal"
          :class="[
            isConfirmed ? 'text-green' : '',
            isCancelled ? 'text-red' : '',
            isProcessing ? 'italic' : ''
          ]"
        >{{ status }}</span></span>
        <span v-else>XE</span>
      </h4>

      <div v-if="purchase">
        <!-- stripe payment in progress -->
        <div v-if="processingStripe">
          <div class="flex items-center space-x-2">
            <div><LoadingSpinner /></div>
            <span>Processing Payment</span>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <span>This could take a few minutes. Please do not refresh or navigate away from this page until the purchase is complete.</span>
        </div>
        <!-- purchase unpaid - payment form -->
        <div v-else-if="isPurchaseUnpaid(purchase)">
          <div v-if="!expired">
            <span class="block mb-2">Please enter your card details below to complete your purchase.</span>
            <span class="block mb-2 italic">
              This purchase will expire at {{ expiryTime }}, {{ expiryDate }}.
            </span>
            <div class="flex flex-col space-y-2 w-1/2">
              <!-- saved card list -->
              <PaymentSelectionItem
                v-for="p in paymentMethods"
                :key="p._key"
                :paymentMethod=p
                :selected="p === paymentCard"
                @selectCard="onSelectCard"
              />
              <!-- use new card button -->
              <button
                v-if="!useNewCard"
                @click=openUseNewCard
                class="addNewPayment__button h-20"
              >
                <div class="flex items-center justify-center w-full">
                  <div><PlusCircleIcon class="w-5 mr-2" /></div>
                  <span>Use New Card</span>
                </div>
              </button>
              <!-- stripe card input form -->
              <div
                :class="useNewCard && paymentMethods.length ? 'border border-green border-l-8 p-4 rounded-md' : ''"
                ref="paymentElement"
              />
              <!-- purchase summary -->
              <div
                class="summary-grid"
                :class="useNewCard ? 'pt-2' : 'pt-0'"
              >
                <span class="mr-4">Purchasing:</span>
                <span><span class="font-bold">{{ purchasingXE }}</span> XE</span>
                <span class="mr-4">Charge:</span>
                <span><span class="font-bold">{{ purchasingUSD }}</span> USD</span>
              </div>
              <!-- confirm or cancel buttons -->
              <div
                class="flex flex-col space-y-2 lg:flex-row w-full self-end lg:space-x-2 lg:space-y-0"
              >
                <button
                  class="w-full button button--small button--outline"
                  @click="cancelPurchase"
                  :disabled="completing"
                >
                  Cancel Purchase
                </button>
                <button
                  class="w-full button button--small button--success"
                  @click="confirmPurchase"
                  :disabled="completing || !canComplete"
                >
                  <span>Complete Purchase</span>
                  <div v-if="completing" class="ml-1"><LoadingSpinner /></div>
                </button>
              </div>
              <div v-if="error" class="flex items-center errorMessage mt-2">
                <ExclamationIcon class="w-3.5 text-red" />
                <span class="errorMessage__text">{{
                  error.message || 'Payment Declined'
                }}</span>
              </div>
            </div>
          </div>
          <div v-else>
            <span class="text-red block mb-2 italic">
              This purchase has expired.
            </span>
            <router-link :to="{ name: 'Payments' }" class="mt-2 button button--small button--success">
              Start Again
            </router-link>
          </div>
        </div>
        <!-- complete, processing (xe side) or cancelled -->
        <div v-else class="purchase__grid md:grid-cols-2 gap-y-4">
          <div v-if=isProcessing class="col-span-2">
            <!-- eslint-disable-next-line max-len -->
            <span>Thank you for your purchase. We have received your payment and are now processing your XE. Please note that this can take up to 15 minutes.</span>
          </div>
          <div><span class="label">Date</span>{{ createdDate }}</div>
          <div><span class="label">Time</span>{{ createdTime }}</div>
          <div><span class="label">
            {{ isConfirmed || isProcessing ? 'Sent' : 'Send' }}
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
import PaymentSelectionItem from '@/components/billing/PaymentSelectionItem'
import { mapState } from 'vuex'
import moment from 'moment'
import {
  ArrowLeftIcon,
  ExclamationIcon,
  PlusCircleIcon
} from '@heroicons/vue/outline'

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
      processingStripe: false,
      purchase: null,

      paymentCard: null,
      paymentMethods: null,

      useNewCard: false
    }
  },
  components: {
    ArrowLeftIcon,
    ExclamationIcon,
    LoadingSpinner,
    PaymentSelectionItem,
    PlusCircleIcon
  },
  computed: {
    ...mapState(['session']),
    canComplete() {
      if (!this.useNewCard) return this.paymentCard
      return true
    },
    createdDate() {
      return format.date(this.purchase.created)
    },
    createdTime() {
      return format.time(this.purchase.created)
    },
    expired() {
      return moment().isAfter(this.softExpiry)
    },
    expiresIn() {
      return moment(this.softExpiry).fromNow()
    },
    expiryDate() {
      return this.purchase.expires && format.date(this.softExpiry)
    },
    expiryTime() {
      return this.purchase.expires && format.time(this.softExpiry)
    },
    formattedSentAmount() {
      return `${format.usd(this.purchase.send.amount, 2)} USD`
    },
    formattedReceivedAmount() {
      return `${format.xe(this.purchase.receive.amount)} XE`
    },
    isCancelled() {
      return this.purchase && this.purchase.status === 'cancelled'
    },
    isConfirmed() {
      return this.purchase && this.purchase.status === 'complete'
    },
    isProcessing() {
      return this.purchase && ['paid', 'pending', 'processed', 'unsent'].includes(this.purchase.status)
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
    softExpiry() {
      // set expiry 30 seconds before true expiry
      return this.purchase.expires && this.purchase.expires - 30000 || null
    },
    status() {
      if (this.isProcessing) return 'processing'
      return this.purchase && this.purchase.status
    }
  },
  methods: {
    addPaymentForm() {
      this.stripeElements = this.stripe.elements({ clientSecret: this.purchase.intent.client_secret })
      this.paymentElement = this.stripeElements.create('payment')
      if (this.paymentMethods && !this.paymentMethods.length) {
        this.useNewCard = true
        this.paymentElement.mount(this.$refs.paymentElement)
      }
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
        let purchase
        this.error = null

        if (!this.useNewCard) {
          purchase = await this.stripe.confirmCardPayment(this.purchase.intent.client_secret, {
            payment_method: this.paymentCard.stripe.id,
            return_url
          })
        }
        else {
          purchase = await this.stripe.confirmPayment({
            elements: this.stripeElements,
            confirmParams: { return_url }
          })
        }
        this.error = purchase.error || null
      }
      catch (error) {
        this.error = error
        this.completing = false
      }
    },
    async getPaymentMethods() {
      const paymentMethods = await utils.billing.getPaymentMethods(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key
      )
      this.paymentMethods = paymentMethods.results
      this.paymentCard = paymentMethods.results[0]
    },
    isPurchaseUnpaid(purchase) {
      return purchase.status === 'unpaid'
    },
    async getPurchase() {
      this.purchase = await utils.purchases.getPurchase(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.purchaseId
      )
      setTimeout(async () => {
        if (this.isPurchaseUnpaid(this.purchase)) {
          await this.getPaymentMethods()
          this.addPaymentForm()
        }
      }, 0)
    },
    onSelectCard(card) {
      this.useNewCard = false
      this.paymentCard = card
      this.paymentElement.unmount(this.$refs.paymentElement)
    },
    openUseNewCard() {
      this.useNewCard = true
      this.paymentCard = null
      this.paymentElement.mount(this.$refs.paymentElement)
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
    },
    toggleUseSavedCard() {
      if (this.useSavedCard) this.paymentElement.mount(this.$refs.paymentElement)
      else this.paymentElement.unmount(this.$refs.paymentElement)
      this.useSavedCard = !this.useSavedCard
    }
  },
  mounted() {
    this.getPurchase()
    if (this.redirectStatus === 'succeeded') {
      this.processing = true
      setTimeout(async () => {
        this.refreshPurchase()
      }, 1500)
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
      if (!this.isPurchaseUnpaid(newPurchase)) {
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
  @apply w-full mb-4 font-medium;
}

.label {
  @apply font-bold block;
}

.purchase__grid {
  @apply grid gap-y-4
}

select {
  @apply border border-gray-500 bg-white rounded p-2;
}

option {
  @apply rounded p-2;
}

select:focus {
  outline: none;
}

@media (min-width: 450px) {
  .purchase__grid {
    @apply grid-cols-2;
  }
}


.payment__item {
  @apply grid gap-x-4 h-20 bg-white text-gray-500 border border-gray-300 rounded-md w-full p-2 pr-4;
  grid-template-columns: auto 1fr auto;
}

/* ListBox */
.listButton {
  @apply relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-500 rounded cursor-pointer;
  @apply focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25;
}
.listButton__icon {
  @apply absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400;
}

/* options */
.listOptions {
  @apply absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
}
.listOption {
  @apply relative flex items-center justify-between cursor-pointer py-2 pl-4 pr-4 text-gray-900 cursor-default select-none;
}
.listOption.active {
  @apply text-green bg-green bg-opacity-5;
}
/* checkmark */
.checkmark {
  @apply flex items-center pl-3 text-green;
}

.addNewPayment__button {
  @apply flex items-center bg-white text-gray-500 border border-dashed border-gray-300 rounded-md w-full p-2 pr-8 mt-2 cursor-pointer;
}
.addNewPayment__button:hover {
  @apply border-green text-green;
  border-style: solid;
}

.summary-grid {
  @apply grid text-right pb-2;
  grid-template-columns: 1fr auto;
}
</style>
