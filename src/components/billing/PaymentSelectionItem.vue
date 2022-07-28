<template>
  <div
    @click=selectCard
    class="payment__item"
    :class="selected ? 'selected' : ''"
  >
    <div class="flex flex-col items-center justify-center">
      <CreditCardIcon class="w-10 text-green" />
      <span class="truncate capitalize">{{ cardType }}</span>
    </div>
    <div class="flex flex-col md:flex-row md:justify-between md:items-center">
      <span class="monospace truncate">{{ formattedCardNumber }}</span>
      <span class="monospace truncate">{{ formattedExpiry }}</span>
    </div>
  </div>
</template>

<script>
import { CreditCardIcon } from '@heroicons/vue/solid'
import { mapState } from 'vuex'

export default {
  name: 'PaymentSelectionItem',
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
    CreditCardIcon
  },
  props: ['paymentMethod', 'selected'],
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
    }
  },
  methods: {
    selectCard() {
      this.$emit('selectCard', this.paymentMethod)
    }
  },
  emits: ['selectCard']
}
</script>
<style scoped>
.payment__item {
  @apply grid gap-x-4 h-20 bg-white text-gray-500 border border-gray-300 rounded-md w-full p-2 pr-4 cursor-pointer;
  grid-template-columns: auto 1fr auto;
}
.payment__item.selected {
  @apply border-l-8 border-green;
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
