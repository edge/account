<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <AutoPayment :paymentMethods=paymentMethods />
      <AddFundsCalculator @update="onCalculatorUpdate">
        <template v-slot:buttons>
          <button
            class="w-full md:max-w-xs mt-3 button button--small button--success sm:mt-0 self-end"
            @click="startPurchase"
            :disabled="!canStartPurchase"
          >
            Purchase XE
          </button>
          <div v-if="!canStartPurchase" class="errorMessage md:self-end mt-1">
            <span class="errorMessage__text">Minimum purchase is $1.00</span>
          </div>
        </template>
      </AddFundsCalculator>
    </div>
    <div class="box flex flex-col">
      <h4>Payment Cards</h4>
      <p>Adding a card makes it simple to add funds to your account and allows you to enable Pay by Credit Card for automatic invoice payments.</p>
      <div class="flex flex-col">
        <!-- current saved cards list -->
        <div class="flex flex-col">
          <PaymentMethodList @updatePaymentMethods=onUpdatePaymentMethods ref="paymentMethodList" />
          <button
            v-if="!showAddNewCard"
            @click=startAddPaymentMethod
            class="addNewPayment__button"
          >
            <div class="flex items-center justify-center w-full">
              <div><PlusCircleIcon class="w-5 mr-2" /></div>
              <span>Add New Card</span>
            </div>
          </button>
        </div>
        <!-- add new card form -->
        <div
          class="addNewPayment__form"
          :class="showAddNewCard ? 'flex flex-col border border-dashed border-gray-300 rounded-md mt-2 p-4' : ''"
        >
          <div class="max-w-5xl">
            <div
              v-show="paymentElement"
              class="mb-4"
              ref="paymentElement"
            />
            <div v-if=showAddNewCard class="flex flex-col space-y-2">
              <button
                @click=cancelAddPaymentMethod
                class="w-full button button--small button--outline"
              >
                Cancel
              </button>
              <button
                @click="addPaymentMethod"
                :disabled=addingCard
                class="w-full button button--small button--success"
              >
                <div v-if=addingCard class="flex items-center">
                  <span>Adding</span>
                  <span class="ml-2"><LoadingSpinner /></span>
                </div>
                <span v-else>Add card</span>
              </button>
              <div class="errorMessage" v-if=addCardError>
                <span class="errorMessage__text">{{ addCardError.message }}</span>
              </div>
              <StripeLoadingOverlay v-if=addingCard @cancel-stripe=onCancelStripe />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box">
      <h4>Purchase History</h4>
      <PurchaseTable />
    </div>
  </div>
</template>

<script>
/* global process*/

import * as api from '@/account-utils'
import * as format from '@/utils/format'
import AddFundsCalculator from '@/components/billing/AddFundsCalculator'
import AutoPayment from '@/components/billing/AutoPayment'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import PaymentMethodList from '@/components/billing/PaymentMethodList'
import { PlusCircleIcon } from '@heroicons/vue/outline'
import PurchaseTable from '@/components/billing/PurchaseTable'
import StripeLoadingOverlay from '@/components/billing/StripeLoadingOverlay'

import { mapState } from 'vuex'

export default {
  name: 'Payments',
  data() {
    return {
      addCardError: null,
      addingCard: false,
      copied: false,
      iBalance: null,
      rate: null,
      showAddNewCard: false,
      showCheckout: false,
      calculatedUSD: 0,
      calculatedXE: 0,
      purchasingUSD: 0,
      purchasingXE: 0,

      purchase: null,
      paymentElement: null,
      paymentMethods: []
    }
  },
  components: {
    AddFundsCalculator,
    AutoPayment,
    LoadingSpinner,
    PaymentMethodList,
    PlusCircleIcon,
    PurchaseTable,
    StripeLoadingOverlay
  },
  computed: {
    ...mapState(['account', 'balance', 'session']),
    canStartPurchase() {
      return this.calculatedUSD >= 1
    },
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
      this.addCardError = null
      const return_url = `${document.location.protocol}//${document.location.host}/billing/payments`
      const overlayTimeout = setTimeout(() => {
        this.addingCard = true
      }, 100)
      try {
        const { error } = await this.stripe.confirmSetup({
          elements: this.stripeElements,
          confirmParams: { return_url }
        })
        if (error) {
          clearTimeout(overlayTimeout)
          this.addingCard = false
          if (error.type !== 'validation_error') this.addCardError = error
          throw error
        }
      }
      catch (error) {
        clearTimeout(overlayTimeout)
        console.error(error)
        this.addingCard = false
        if (error.type !== 'validation_error') this.addCardError = error
      }
    },
    cancelAddPaymentMethod() {
      this.addCardError = null
      this.showAddNewCard = false
      this.paymentElement = null
    },
    async handleSetupIntentRedirect() {
      if (this.$route.query.redirect_status === 'succeeded') {
        await api.billing.addPaymentMethod(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
            account: this.account._key,
            name: 'Credit Card',
            stripe: this.$route.query.setup_intent
          }
        )
        this.$refs.paymentMethodList.updatePaymentMethods()
      }
    },
    onCalculatorUpdate({ usd, xe }) {
      this.calculatedUSD = usd
      this.calculatedXE = xe
    },
    onCancelStripe() {
      this.addCardError = null
      this.addingCard = false
    },
    onUpdatePaymentMethods(paymentMethods) {
      this.paymentMethods = paymentMethods
    },
    async startAddPaymentMethod() {
      if (this.showAddNewCard) return
      const { setup } = await api.billing.createStripeSetupIntent(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.account._key
      )
      this.stripeElements = this.stripe.elements({ clientSecret: setup.client_secret })
      this.paymentElement = this.stripeElements.create('payment')
      this.paymentElement.mount(this.$refs.paymentElement)
      this.showAddNewCard = true
    },
    async startPurchase() {
      this.purchasingUSD = this.calculatedUSD
      this.purchasingXE = this.calculatedXE
      this.showCheckout = true

      const data = {
        account: this.account._key,
        send: {
          amount: this.calculatedUSD,
          currency: 'USD'
        },
        receive: {
          currency: 'XE'
        }
      }

      const { purchase } = await api.purchases.createPurchase(
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
  setup() {
    const stripe = window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
    return {
      stripe
    }
  }
}
</script>

<style scoped>
.currency {
  @apply border border-gray-500 rounded w-full py-2 px-4;
}

.addNewPayment__form {
  @apply bg-gray-100;
  width: 330px;
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

@media (max-width: 400px) {
  .payment__form {
    width: 100%
  }

  .addNewPayment__form, .addNewPayment__button {
    width: 100%;
  }
}
</style>
