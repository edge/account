<template>
  <div class="payment__item">
    <!-- <span class="uppercase text-xs pb-4">{{ paymentMethod.name }}</span> -->
    <div>
      <div v-if=isAutoPaymentCard class="flex items-center">
        <div><BadgeCheckIcon class="text-green w-4 mr-1" /></div>
        Auto payment card
      </div>
      <button v-else @click="setAsAutoPayment" class="flex-shrink-0 underline hover:text-green">
        Use for auto payments
      </button>
    </div>
    <div class="col-start-3 flex items-center justify-end">
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
            <span class="card__button__text ml-1">Delete</span>
          </div>
        </button>
        <Tooltip v-if="httpError" :text="httpError" theme="error" position="left">
          <ExclamationIcon class="w-5 mt-1 text-red" />
        </Tooltip>
      </div>
    </div>
    <span class="card_number text-2xl monospace truncate col-span-3">{{ formattedCardNumber }}</span>
    <div class="expiry flex flex-col">
      <span class="monospace">Exp:</span>
      <span class="monospace truncate">{{ formattedExpiry }}</span>
    </div>
    <div class="flex justify-end col-start-3">
      <CardBrandIcon :brand="cardType" />
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

import * as utils from '@edge/account-utils'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import CardBrandIcon from '@/components/icons/CardBrandIcon'
import DeletePaymentMethodConfirmation from '@/components/confirmations/DeletePaymentMethodConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
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
    CardBrandIcon,
    BadgeCheckIcon,
    DeletePaymentMethodConfirmation,
    ExclamationIcon,
    LoadingSpinner,
    Tooltip,
    TrashIcon
  },
  props: ['autoPaymentCard', 'paymentMethod'],
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
    isAutoPaymentCard() {
      return this.paymentMethod._key === this.autoPaymentCard
    }
  },
  methods: {
    async deletePaymentMethod() {
      try {
        this.isDeleting = true
        await utils.deletePaymentMethod(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.paymentMethod._key)
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
    async setAsAutoPayment() {
      try {
        // this.enabling = true
        await utils.setDefaultPaymentMethod(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          account: this.account._key,
          paymentMethod: this.paymentMethod._key
        })
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
  @apply grid grid-rows-3 gap-y-2 bg-gray-100 text-gray-500 border border-gray-300 rounded-md px-6 py-3 cursor-pointer;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto;
  width: 330px;
}

.card__button {
  @apply button button--extraSmall p-1;
}

.card__button.default {
 @apply button--success
}

.card__button.delete {
 @apply button--outline-error
}

.card__button__icon {
  @apply w-3.5 h-3.5;
}

@screen lg {
  /* .payment__item {
    @apply justify-between gap-x-4;
  } */

  .card__button__icon {
    @apply w-4 h-4;
  }
}

@media (max-width: 450px) {
  .card__button {
    @apply w-full;
  }
}

@media (max-width: 400px) {
  .payment__item {
    @apply w-full;
  }

  .payment__item .card_number {
    @apply text-xl;
  }
}

@media (max-width: 350px) {
  .payment__item .card_number {
    @apply text-md;
  }

  .payment__item .expiry {
    @apply text-xs;
  }

  .card__button__text {
    @apply hidden;
  }
}

@media (max-width: 310px) {
  .payment__item {
    @apply px-4
  }

  .payment__item .card_number {
    @apply text-sm;
  }
}
</style>
