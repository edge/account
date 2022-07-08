<template>
  <div v-if="warning" class="w-full md:top-20">
    <div class="suspension__warning"
      :class="warning.class"
    >
      <div v-if="txCount"><ExclamationIcon class="w-8"/></div>
      <div v-else><CashIcon class="w-8"/></div>
      <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-10 xl:space-x-20">
        <span>{{ warning.message }}</span>
        <button @click=toggleTopUpModal class="button button--solid button--small h-8 w-max flex-shrink-0">
          Add Funds
        </button>
      </div>
    </div>
    <TopUpModal
      v-if=showTopUpModal
      @modal-close=toggleTopUpModal
    />
  </div>
</template>

<script>
import TopUpModal from '@/components/billing/TopUpModal'
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
    ExclamationIcon,
    TopUpModal
  },
  data() {
    return {
      showTopUpModal: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['account', 'balance', 'serverCount', 'txCount']),
    bannerClass() {
      if (this.hasConsumption) {
        if (this.balanceSuspend) return 'bg-red text-white'
        if (this.balanceWarning) return 'bg-yellow-300 text-black'
      }
      return 'bg-blue-100 text-black'
    },
    warning() {
      if (!this.balance) return null

      const warningThreshold = this.balance.threshold.warning.usd

      /* eslint-disable max-len */
      if (this.account.suspended) {
        return {
          class: bannerClass.red,
          message: 'You have unpaid invoices. Please top up to reactivate your services. Failure to pay will result in your services being permanently deleted.'
        }
      }
      else if (this.balanceSuspend) {
        return {
          class: bannerClass.red,
          message: 'Your balance is less than your current spend. Any services you are using will be suspended if you don\'t top up.'
        }
      }
      else if (this.balance.total.usd < warningThreshold && !this.serverCount && this.txCount) {
        return {
          class: bannerClass.yellow,
          message: `Your balance is less than $${warningThreshold}. Please top up to re-enabled services.`
        }
      }
      else if (this.balanceWarning && !this.serverCount && this.txCount) {
        return {
          class: bannerClass.yellow,
          message: `Your balance at the end of the day will be less than $${warningThreshold}. Please top up to re-enabled services.`
        }
      }
      else if (this.balance.total.usd < warningThreshold && this.txCount) {
        return {
          class: bannerClass.yellow,
          message: `Your balance is less than $${warningThreshold}. Any services you are using may be suspended if you don't top up your account.`
        }
      }
      else if (this.balanceWarning && this.txCount) {
        return {
          class: bannerClass.yellow,
          message: `Your balance at the end of the day will be less than $${warningThreshold}. Any services you are using may be suspended if you don't top up your account.`
        }
      }
      else if (this.balanceWarning && !this.txCount) {
        return {
          class: bannerClass.blue,
          message: `Please top up your account to at least $${warningThreshold} to enable services.`
        }
      }
      return null
      /* eslint-enable max-len */
    }
  },
  methods: {
    toggleTopUpModal() {
      this.showTopUpModal = !this.showTopUpModal
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
