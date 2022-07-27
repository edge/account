<template>
  <div class="payment__item">
    <div class="flex flex-col items-center justify-center row-span-2">
      <CreditCardIcon class="w-10 text-green" />
      <span class="truncate capitalize">{{ cardType }}</span>
    </div>
    <div class="flex flex-col md:flex-row md:justify-between md:items-center">
      <span class="monospace truncate">{{ formattedCardNumber }}</span>
      <span class="monospace truncate">{{ formattedExpiry }}</span>
    </div>
    <div class="row-span-2 flex items-center">
      <div class="flex items-center space-x-2">
        <button
          class="card__button delete"
          @click.prevent=toggleDeleteConfirmationModal
          :disabled=isDeleting
        >
          <div class="flex items-center">
            <div>
              <LoadingSpinner v-if=isDeleting class="card__button__icon" />
              <TrashIcon v-else class="card__button__icon" />
            </div>
            <span class="leading-none">Delete</span>
          </div>
        </button>
        <Tooltip v-if="httpError" :text="httpError" theme="error" position="left">
          <ExclamationIcon class="w-5 mt-1 text-red" />
        </Tooltip>
      </div>
    </div>
    <div v-if="account.topup" class="w-48">
      <div v-if=isAutoTopUpCard class="flex items-center">
        <div><BadgeCheckIcon class="text-green w-4 mr-1" /></div>
        Auto top-up card
      </div>
      <button v-else @click="setAsAutoTopUp" class="flex-shrink-0 underline hover:text-green">
        Set as auto top-up card
      </button>
    </div>
  </div>
  <!-- eslint-disable-next-line vue/no-multiple-template-root-->
  <DeletePaymentMethodConfirmation
    v-if=showDeleteConfirmation
    :paymentMethod=paymentMethod
    @modal-confirm=deletePaymentMethod
    @modal-close=toggleDeleteConfirmationModal
  />
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import DeletePaymentMethodConfirmation from '@/components/confirmations/DeletePaymentMethodConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
import { BadgeCheckIcon, CreditCardIcon } from '@heroicons/vue/solid'
import { ExclamationIcon, TrashIcon } from '@heroicons/vue/outline'

export default {
  name: 'PaymentMethodItem',
  data() {
    return {
      downloadError: false,
      httpError: null,
      isDeleting: false,
      showDeleteConfirmation: false,
      unholdError: false
    }
  },
  components: {
    BadgeCheckIcon,
    CreditCardIcon,
    DeletePaymentMethodConfirmation,
    ExclamationIcon,
    LoadingSpinner,
    Tooltip,
    TrashIcon
  },
  props: ['autoTopUpCard', 'paymentMethod'],
  computed: {
    ...mapState(['account', 'session']),
    cardType() {
      return this.paymentMethod.stripe.card.brand
    },
    formattedCardNumber() {
      return `XXXX XXXX XXXX ${this.paymentMethod.stripe.card.last4}`
    },
    formattedExpiry() {
      const card = this.paymentMethod.stripe.card
      return `${('0' + card.exp_month).slice(-2)}/${card.exp_year.toString().slice(2)}`
    },
    isAutoTopUpCard() {
      return this.paymentMethod._key === this.autoTopUpCard
    }
  },
  methods: {
    async deletePaymentMethod() {
      try {
        this.isDeleting = true
        await utils.billing.deletePaymentMethod(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.paymentMethod._key
        )
        this.toggleDeleteConfirmationModal()

        setTimeout(() => {
          this.$emit('refreshPaymentMethods')
          this.isDeleting = false
        }, 1000)
      }
      catch (error) {
        this.httpError = error
        this.isDeleting = false
      }
    },
    async setAsAutoTopUp() {
      try {
        // this.enabling = true
        await utils.billing.enableAutoTopUp(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
            paymentMethod: this.paymentMethod._key,
            targetBalance: this.account.topup.targetBalance
          }
        )
        this.$store.dispatch('updateAccount')

        // setTimeout(() => {
        //   this.enabling = false
        // }, 1000)
      }
      catch (error) {
        console.error(error)
        // this.enabling = false
      }
    },
    toggleDeleteConfirmationModal() {
      this.showDeleteConfirmation = !this.showDeleteConfirmation
    }
  },
  emits: ['refreshPaymentMethods']
}
</script>
<style scoped>
.payment__item {
  @apply grid gap-x-4 h-20 bg-white text-gray-500 border border-gray-300 rounded-md w-full p-2 pr-4;
  grid-template-columns: auto 1fr auto;
}

.card__button {
  @apply button button--extraSmall w-1/2 lg:w-24;
}

.card__button.default {
 @apply button--success
}

.card__button.delete {
 @apply button--outline-error
}

.card__button__icon {
  @apply w-3.5 h-3.5 mr-1;
}

@screen lg {
  /* .payment__item {
    @apply justify-between gap-x-4;
  } */

  .card__button__icon {
    @apply w-4 h-4 mr-1;
  }
}

@media (max-width: 450px) {
  .card__button {
    @apply w-full;
  }
}
</style>
