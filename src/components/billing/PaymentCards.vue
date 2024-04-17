<template>
  <div class="flex flex-col space-y-4">
    <div class="box flex flex-col">
      <h4>Payment Cards</h4>
      <p>Add a payment card to pay your invoices. You can select one card to use to pay invoices automatically each month.</p>
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
      <FAQ>
        <div>
          <article>
            <header>
              <h4>When will I be billed?</h4>
            </header>
            <section>
              <p>
                Your invoice will be prepared on the first day of the month, each month.
                If you set up an automatic payment method, it will be paid immediately - nothing for you to worry about.
              </p>
            </section>
          </article>

          <article>
            <header>
              <h4>I have unpaid invoices - what do I do?</h4>
            </header>
            <section>
              <p>
                If you use Edge services without an automatic payment method, you may not be able to pay invoices.
                When this happens, your services may be suspended.
              </p>
              <p>
                To pay your invoices and regain your services, simply add an automatic payment card to your account.
                Your invoices will be paid shortly after as long as the card is valid.
              </p>
            </section>
          </article>

          <article>
            <header>
              <h4>Can I manage my account funding manually?</h4>
            </header>
            <section>
              <p>
                Yes. Edge invoices are paid using a native cryptocurrency called XE.
                If you have an XE wallet, you can transfer funding from that into your account and use it to pay your invoices.
              </p>
              <p>
                You can also purchase XE for your account using a payment card, even if it is used for automatic payments.
                Please note you cannot withdraw this XE to another wallet.
              </p>
              <p v-if="account.useCryptoView">
                <RouterLink :to="{ name: 'Wallet' }" class="text-green">View your wallet</RouterLink> to start funding your account manually.
              </p>
              <p v-else>
                <RouterLink :to="{ name: 'Account' }" class="text-green">Enable Crypto View</RouterLink> to start funding your account manually.
              </p>
            </section>
          </article>
        </div>
      </FAQ>
    </div>
  </div>
</template>

<script>
/* global process*/

import * as api from '@/account-utils'
import FAQ from '../FAQ.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import PaymentMethodList from '@/components/billing/PaymentMethodList'
import { PlusCircleIcon } from '@heroicons/vue/outline'
import { RouterLink } from 'vue-router'
import StripeLoadingOverlay from '@/components/billing/StripeLoadingOverlay'

import { mapState } from 'vuex'

export default {
  name: 'Payments',
  data() {
    return {
      addCardError: null,
      addingCard: false,
      showAddNewCard: false,
      showCheckout: false,

      paymentElement: null,
      paymentMethods: []
    }
  },
  components: {
    FAQ,
    LoadingSpinner,
    RouterLink,
    PaymentMethodList,
    PlusCircleIcon,
    StripeLoadingOverlay
  },
  computed: {
    ...mapState(['account', 'progress', 'session'])
  },
  methods: {
    async addPaymentMethod() {
      this.addCardError = null
      const return_url = `${document.location.protocol}//${document.location.host}/billing/payment-cards`
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
        const methods = await this.$refs.paymentMethodList.updatePaymentMethods()
        if (methods.length === 1 && !this.account.useCryptoView) {
          // If the account uses fiat view, the sole payment method should be enabled by default
          await api.billing.enableAutoPayment(
            process.env.VUE_APP_ACCOUNT_API_URL,
            this.session._key,
            {
              account: this.account._key,
              paymentMethod: methods[0]._key
            }
          )
          this.$refs.paymentMethodList.updatePaymentMethods()
          // Redirect to getting started
          if (!this.progress.all) this.$router.push('/getting-started')
        }
      }
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
