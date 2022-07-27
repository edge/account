<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-4 xl:flex-row xl:space-x-6 lg:space-y-0">
      <AddFundsCalculator @update="onCalculatorUpdate">
        <template v-slot:buttons>
          <button
            class="w-full md:max-w-xs mt-3 button button--small button--success sm:mt-0 self-end"
            @click="startPurchase"
          >
            Purchase XE
          </button>
        </template>
      </AddFundsCalculator>
      <AutoTopUp :paymentMethods=paymentMethods />
    </div>
    <div class="box flex flex-col">
      <h4>Payment Cards</h4>
      <p>Adding a card makes it simple to top-up your account in future and enables the automatic top-up feature.</p>
      <div class="w-1/2 flex flex-col">
        <!-- current saved cards list -->
        <div class="flex flex-col">
          <PaymentMethodList @updatePaymentMethods=onUpdatePaymentMethods ref="paymentMethodList" />
          <button
            v-if="!showAddNewCard"
            @click=startAddPaymentMethod
            class="addNewPayment__button h-20"
          >
            <div class="flex items-center justify-center w-full">
              <div><PlusCircleIcon class="w-5 mr-2" /></div>
              <span>Add New Card</span>
            </div>
          </button>
        </div>
        <!-- add new card form -->
        <div class="flex flex-col border border-dashed border-gray-300 rounded-md mt-2 p-4">
          <div class="max-w-5xl">
            <div
              v-show="paymentElement"
              class="mb-5"
              ref="paymentElement"
            />
            <div class="flex flex-col md:flex-row md:space-x-2">
              <button
                v-if=showAddNewCard
                @click=cancelAddPaymentMethod
                class="w-full button button--small button--outline"
              >
                Cancel
              </button>
              <button
                v-if="showAddNewCard"
                @click="addPaymentMethod"
                class="w-full button button--small button--success"
              >
                Add card
              </button>
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

import * as format from '@/utils/format'
import * as utils from '@/account-utils'
import AddFundsCalculator from '@/components/billing/AddFundsCalculator'
import AutoTopUp from '@/components/billing/AutoTopUp'
import PaymentMethodList from '@/components/billing/PaymentMethodList'
import { PlusCircleIcon } from '@heroicons/vue/outline'
import PurchaseTable from '@/components/billing/PurchaseTable'

import { mapState } from 'vuex'

export default {
  name: 'Payments',
  data() {
    return {
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
    AutoTopUp,
    PaymentMethodList,
    PlusCircleIcon,
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
    cancelAddPaymentMethod() {
      this.showAddNewCard = false
      this.paymentElement = null
    },
    async handleSetupIntentRedirect() {
      if (this.$route.query.redirect_status === 'succeeded') {
        await utils.billing.addPaymentMethod(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
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
    onUpdatePaymentMethods(paymentMethods) {
      this.paymentMethods = paymentMethods
    },
    async startAddPaymentMethod() {
      if (this.showAddNewCard) return
      const intent = await utils.billing.createStripeSetupIntent(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key)

      this.stripeElements = this.stripe.elements({ clientSecret: intent.client_secret })
      this.paymentElement = this.stripeElements.create('payment')
      this.paymentElement.mount(this.$refs.paymentElement)
      this.showAddNewCard = true
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
  @apply w-full mb-4 font-medium;
}

.currency {
  @apply border border-gray-500 rounded w-full py-2 px-4;
}

.addNewPayment__button {
  @apply flex items-center bg-white text-gray-500 border border-dashed border-gray-300 rounded-md w-full p-2 pr-8 mt-2 cursor-pointer;
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

select {
  @apply w-full border border-gray-500 bg-white rounded w-full p-2;
}
</style>
