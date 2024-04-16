<template>
  <div class="space-y-4">
    <div class="box">
      <div class="w-max">
        <router-link :to="{ name: 'Payments' }" class="flex items-center space-x-1 hover:text-green mb-4">
          <ArrowLeftIcon class="w-4" /><span>Back</span>
        </router-link>
      </div>
      <h4 v-if="!purchaseNotFound" class="flex items-center">
        <span>Purchase</span>
        <span v-if="isConfirmed || isCancelled || isProcessing" class="ml-1">
          #{{this.purchaseId}} -
          <span
            class="capitalize font-normal"
            :class="[
              isConfirmed ? 'text-green' : '',
              isCancelled ? 'text-red' : '',
              isProcessing ? 'italic' : ''
            ]"
          >{{ status }}</span>
        </span>
        <span v-else class="ml-1">XE</span>
        <Tooltip
          v-if="purchase && purchase.auto"
          text="Purchase made by Pay by Credit Card"
          position="right"
        >
          <InformationCircleIcon class="ml-1 w-4 text-gray-400" />
        </Tooltip>
      </h4>

      <!-- purchase not found -->
      <div v-if="purchaseNotFound" class="flex flex-col items-center space-y-2">
        <span class="text-xl">Purchase Not Found</span>
        <span class="pb-1">We couldn't find a record of this purchase on your account.</span>
        <router-link :to="{ name: 'Payments' }" class="button button--small button--success">Go Back</router-link>
      </div>
      <!-- purchase loaded -->
      <div v-else-if="purchase">
        <!-- stripe payment in progress -->
        <div v-if="processingStripe">
          <div class="flex items-center space-x-2">
            <div><LoadingSpinner /></div>
            <span>Processing Payment</span>
          </div>
          <span>This could take a few minutes. Please do not refresh or navigate away from this page until the purchase is complete.</span>
        </div>
        <!-- purchase unpaid - payment form -->
        <div v-else-if="isPurchaseUnpaid(purchase)">
          <div v-if="!expired">
            <span class="block mb-2">Please enter your card details below to complete your purchase.</span>
            <span class="block mb-2 italic">
              This purchase will expire at {{ expiryTime }}, {{ expiryDate }}.
            </span>
            <div class="payment__form grid space-y-2">
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
                class="addNewPayment__button"
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
                <span class="mr-4">Cost:</span>
                <span><span class="font-bold">{{ purchasingUSD }}</span> USD</span>
              </div>
              <!-- confirm or cancel buttons -->
              <div
                class="flex flex-col space-y-2 w-full self-end"
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
              <div v-if="error" class="errorMessage mt-2">
                <span class="errorMessage__text inline-block">{{
                  error.message || 'Payment Declined'
                }}</span>
              </div>
              <StripeLoadingOverlay v-if=completing @cancel-stripe=onCancelStripe />
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
import * as api from '@/account-utils'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import PaymentSelectionItem from '@/components/billing/PaymentSelectionItem'
import StripeLoadingOverlay from '@/components/billing/StripeLoadingOverlay'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
import moment from 'moment'
import {
  ArrowLeftIcon,
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
      paymentCard: null,
      paymentMethods: null,
      processingStripe: false,
      purchase: null,
      purchaseNotFound: false,
      useNewCard: false
    }
  },
  components: {
    ArrowLeftIcon,
    InformationCircleIcon,
    LoadingSpinner,
    PaymentSelectionItem,
    PlusCircleIcon,
    StripeLoadingOverlay,
    Tooltip
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
      try {
        const { purchase } = await api.purchases.cancelPurchase(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.purchaseId
        )
        this.purchase = purchase
        this.$router.push({ name: 'Wallet' })
      }
      catch (error) {
        console.error(error)
      }
    },
    async confirmPurchase() {
      const overlayTimeout = setTimeout(() => {
        this.completing = true
      }, 100)
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
        if (purchase.error) {
          clearTimeout(overlayTimeout)
          this.completing = false
          this.error = purchase.error.type === 'validation_error' ? null : purchase.error
        }
        else await this.refreshPurchase()
      }
      catch (error) {
        clearTimeout(overlayTimeout)
        this.error = error
        this.completing = false
      }
    },
    async getPaymentMethods() {
      const { results } = await api.billing.getPaymentMethods(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key
      )
      this.paymentMethods = results
      this.paymentCard = results[0]
    },
    isPurchaseUnpaid(purchase) {
      return purchase.status === 'unpaid'
    },
    async getPurchase() {
      try {
        const { purchase } = await api.purchases.getPurchase(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.purchaseId
        )
        this.purchase = purchase
        setTimeout(async () => {
          if (this.isPurchaseUnpaid(this.purchase)) {
            await this.getPaymentMethods()
            this.addPaymentForm()
          }
        }, 0)
      }
      catch (error) {
        if (error.status === 500) this.purchaseNotFound = true
      }
    },
    onCancelStripe() {
      this.error = null
      this.completing = false
      this.cancelPurchase()
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
        const { purchase } = await api.purchases.refreshPurchase(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.purchaseId
        )
        if (purchase.status !== 'unpaid') this.completing = false
        this.purchase = purchase
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

.payment__form {
  width: 330px
}

.addNewPayment__button {
  @apply flex items-center bg-gray-100 text-gray-500 border border-dashed border-gray-300 rounded-md w-full mt-2 cursor-pointer;
  width: 330px;
  height: 133px;
}
.addNewPayment__button:hover {
  @apply border-green text-green;
  border-style: solid;
}

.summary-grid {
  @apply grid text-right pb-2;
  grid-template-columns: 1fr auto;
}


@media (min-width: 450px) {
  .purchase__grid {
    @apply grid-cols-2;
  }
}

@media (max-width: 400px) {
  .payment__form {
    width: 100%
  }

  .addNewPayment__button {
    width: 100%;
  }
}
</style>
