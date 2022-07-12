<template>
  <div v-if="warning" class="w-full md:top-20">
    <div class="suspension__warning"
      :class="warning.class"
    >
      <div v-if="balance.total.usd"><ExclamationIcon class="w-8"/></div>
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
    ...mapState(['account', 'balance', 'serverCount']),
    warning() {
      const warningThreshold = this.balance.threshold.warning.usd

      /* eslint-disable max-len */

      if (!this.balance.total.usd) {
        return {
          class: bannerClass.blue,
          message: `Please transfer at least $${warningThreshold} of funds to your account to enable services.`
        }
      }
      else if (this.account.suspended) {
        return {
          class: bannerClass.red,
          message: 'You have unpaid invoices. Please add funds to reactivate your services. Failure to pay will result in your services being permanently deleted.'
        }
      }
      else if (this.balanceSuspend) {
        return {
          class: bannerClass.red,
          message: 'Your balance is less than your current spend. Any services you are using will be suspended if you don\'t add funds to your account.'
        }
      }
      else if (this.balance.total.usd < warningThreshold && !this.serverCount) {
        return {
          class: bannerClass.yellow,
          message: `Your balance is less than $${warningThreshold}. Please add funds to re-enable services.`
        }
      }
      else if (this.balanceWarning && !this.serverCount) {
        return {
          class: bannerClass.yellow,
          message: `Your balance at the end of the day will be less than $${warningThreshold}. Please add funds to re-enable services.`
        }
      }
      else if (this.balance.total.usd < warningThreshold) {
        return {
          class: bannerClass.yellow,
          message: `Your balance is less than $${warningThreshold}. Any services you are using may be suspended if you don't add funds to your account.`
        }
      }
      else if (this.balanceWarning) {
        return {
          class: bannerClass.yellow,
          message: `Your balance at the end of the day will be less than $${warningThreshold}. Any services you are using may be suspended if you don't add funds to your account.`
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
