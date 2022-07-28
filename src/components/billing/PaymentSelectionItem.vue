<template>
  <div
    @click=selectCard
    class="payment__item"
    :class="selected ? 'selected' : ''"
  >
    <span class="uppercase text-xs text-right col-start-3 pb-4">{{ paymentMethod.name }}</span>
    <span class="card_number text-2xl monospace truncate col-span-3">{{ formattedCardNumber }}</span>
    <div class="expiry flex flex-col">
      <span class="monospace">Exp:</span>
      <span class="monospace truncate">{{ formattedExpiry }}</span>
    </div>
    <div class="flex justify-end col-start-3">
      <CardBrandIcon :brand="cardType" />
    </div>
  </div>
</template>

<script>
import CardBrandIcon from '@/components/icons/CardBrandIcon'
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
    CardBrandIcon
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
  @apply grid grid-rows-3 gap-y-2 bg-gray-100 text-gray-500 border border-gray-300 rounded-md px-6 py-2 cursor-pointer;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto;
  width: 330px;
}
.payment__item.selected {
  @apply border-l-8 border-green;
  padding-left: calc(1rem + 1px);
}
.payment__item:hover {
  @apply border-green;
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
}

@media (max-width: 310px) {
  .payment__item .card_number {
    @apply text-sm;
  }

}
</style>
