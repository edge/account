<template>
  <div v-if="warning" class="w-full md:top-20">
    <div class="suspension__warning"
      :class="warning.class"
    >
      <div v-if="balance.total.usd"><ExclamationIcon class="w-8"/></div>
      <div v-else><CashIcon class="w-8"/></div>
      <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-10 xl:space-x-20">
        <span>{{ warning.message }}</span>
        <router-link to="/billing/payments" class="button button--solid button--small h-8 w-max flex-shrink-0">
          Add Funds
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { CashIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { mapGetters, mapState } from 'vuex'

const bannerClass = {
  'red': 'bg-red text-white',
  'yellow': 'bg-yellow-300 text-black',
  'blue': 'bg-blue-100 text-black'
}

export default {
  name: 'SuspensionMessage',
  components: {
    CashIcon,
    ExclamationIcon
  },
  computed: {
    ...mapGetters(['nextInvoiceDate']),
    ...mapState(['account', 'balance']),
    warning() {
      // Show status of pending purchases irrespective of account status and Pay By Card configuration
      if (this.balance.purchases.pending > 0) {
        return {
          class: bannerClass.blue,
          message: 'Your XE purchase is processing. Please allow up to 10 minutes for your balance to update.'
        }
      }

      // Show no other possible warnings if account is managed (thus exempt from all billing effects) or uses Pay By Card
      if (this.account.managed || this.account.topup) return null

      // Account has been suspended due to non-payment of invoices
      if (this.account.suspended) {
        return {
          class: bannerClass.red,
          message: [
            this.balance.consumption.invoices.unpaid > 0 ? 'You have unpaid invoices.' : false,
            'Please add funds or enable Pay By Credit Card to reactivate your services.',
            'Failure to pay will result in your services being permanently deleted.'
          ].filter(Boolean).join(' ')
        }
      }

      // Account has been warned of low balance and should top up before next invoice
      if (this.account.warned) {
        const dateStr = this.nextInvoiceDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

        return {
          class: bannerClass.yellow,
          message: [
            `Your balance minus usage is less than $${this.balance.threshold.warning.usd} and some actions have been restricted.`,
            `Any services you are using may be suspended if you are unable to pay your next invoice on ${dateStr}.`,
            'Add funds or enable Pay By Credit Card to prevent this happening.'
          ].join(' ')
        }
      }

      // The account balance is exactly $0 and the account is not consuming any services (default message)
      if (this.balance.total.usd === 0 && !this.balance.consumption.any) {
        return {
          class: bannerClass.blue,
          message: `Please transfer at least $${this.balance.threshold.warning.usd} of funds to your account or add a payment card to enable services.`
        }
      }

      return null
    }
  }
}
</script>

<style scoped>
.suspension__warning {
  @apply flex sm:items-center space-x-4 py-4 px-8;
  width: inherit;
}
</style>
