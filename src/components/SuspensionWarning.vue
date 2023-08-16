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
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['account', 'balance']),
    warning() {
      const warningThreshold = this.balance.threshold.warning.usd

      // The account is warned or suspended, and has an XE purchase pending
      if (this.balance.purchases.pending > 0 && (this.balanceWarning || this.balanceSuspend)) {
        return {
          class: bannerClass.blue,
          message: 'Your XE purchase is processing. Please allow up to 10 minutes for your balance to update.'
        }
      }
      // If the account uses Pay By Card or is managed [by administrators] then no message will be shown
      if (this.account.managed || this.account.topup) return null
      // The account balance is exactly $0 and the account is not consuming any services (default message)
      if (this.balance.total.usd === 0 && !this.balance.consumption.any) {
        return {
          class: bannerClass.blue,
          message: `Please transfer at least $${warningThreshold} of funds to your account or add a payment card to enable services.`
        }
      }
      // The account is suspended (has unpaid invoices)
      if (this.account.suspended) {
        return {
          class: bannerClass.red,
          message: 'You have unpaid invoices. Please add funds to reactivate your services. Failure to pay will result in your services being permanently deleted.'
        }
      }
      // The next invoice to the account will cause it to be suspended
      if (this.balanceSuspend) {
        return {
          class: bannerClass.red,
          message: 'Your balance is less than your current spend. Any services you are using will be suspended if you don\'t add funds to your account.'
        }
      }
      // The account balance is below warning threshold, but it is not consuming any services
      else if (this.balance.total.usd < warningThreshold && !this.balance.consumption.any) {
        return {
          class: bannerClass.yellow,
          message: `Your balance is less than $${warningThreshold}. Please add funds to re-enable services.`
        }
      }
      // The next invoice to the account will cause its balance to drop under the warning threshold, but it is not currently consuming any services
      // (The account will already have a balance warning in API in this scenario)
      else if (this.balanceWarning && !this.balance.consumption.any) {
        return {
          class: bannerClass.yellow,
          message: `Your balance at the end of the day will be less than $${warningThreshold}. Please add funds to re-enable services.`
        }
      }
      // The account balance is below warning threshold
      else if (this.balance.total.usd < warningThreshold) {
        return {
          class: bannerClass.yellow,
          message: `Your balance is less than $${warningThreshold}. Any services you are using may be suspended if you don't add funds to your account.`
        }
      }
      // The next invoice to the account will cause its balance to drop under the warning threshold
      // (Again, the account will already have a balance warning in API in this scenario)
      else if (this.balanceWarning) {
        return {
          class: bannerClass.yellow,
          message: `Your balance at the end of the day will be less than $${warningThreshold}. Any services you are using may be suspended if you don't add funds to your account.`
        }
      }
      return null
      /* eslint-enable max-len */
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
