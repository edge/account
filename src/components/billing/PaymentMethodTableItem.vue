<template>
  <tr>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Card Number:</span>
      <span class="truncate">{{ formattedCardNumber }}</span>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Expiry:</span>
      <span class="truncate">{{ formattedExpiry }}</span>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Card Type:</span>
      <span class="truncate capitalize">{{ cardType }}</span>
    </td>
    <td v-if=autoTopUpCard class="tableBody__cell">
      <div v-if=isAutoTopUpCard class="flex items-center">
        <div><BadgeCheckIcon class="text-green w-4 mr-1" /></div>
        Auto payment card
      </div>
      <span v-else><button @click="setAsAutoTopUp" class="underline hover:text-green">
        Set as auto payment card
      </button></span>
    </td>
    <td class="tableBody__cell actions">
      <div class="flex items-center w-full space-x-2 action_buttons">
        <button
          class="tableButton button-error delete"
          @click.prevent=toggleDeleteConfirmationModal
          :disabled=isDeleting
        >
          <div class="flex items-center">
            <div>
              <LoadingSpinner v-if=isDeleting class="tableButton__icon" />
              <TrashIcon v-else class="tableButton__icon" />
            </div>
            <span class="leading-none">Delete</span>
          </div>
        </button>
        <Tooltip v-if="httpError" :text="httpError" theme="error" position="left">
          <ExclamationIcon class="w-5 mt-1 text-red" />
        </Tooltip>
      </div>
    </td>
  </tr>
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
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import DeletePaymentMethodConfirmation from '@/components/confirmations/DeletePaymentMethodConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
import {
  ExclamationIcon,
  TrashIcon
} from '@heroicons/vue/outline'

export default {
  name: 'PaymentMethodTableItem',
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
tr {
  @apply grid py-4 gap-x-2 gap-y-2;
  grid-template-columns: auto;
}

.tableBody__cell {
  @apply flex items-center text-gray-500 leading-4 truncate;
}

.tableButton {
  @apply button button--extraSmall w-1/2 lg:w-24;
}

.tableButton.restore {
  @apply button--success
}

.tableButton.delete {
 @apply button--error
}

.tableButton__icon {
  @apply w-3.5 h-3.5 mr-1;
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-2 table-cell align-middle w-full;
  }

  .action_buttons {
    @apply space-x-2
  }

  .tableButton__icon {
    @apply w-4 h-4 mr-1;
  }
}

@media (max-width: 450px) {
  tr {
    @apply grid py-4 gap-x-2 gap-y-2;
    grid-template-columns: 1fr;
  }

  .tableBody__cell {
    @apply col-span-1;
  }

  .action_buttons {
    @apply flex-col space-x-0 space-y-2 items-start;
  }
  .tableButton {
    @apply w-full;
  }
}
</style>
