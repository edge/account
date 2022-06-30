<template>
  <div v-if="message" class="w-full sticky top-16 md:top-20 z-30">
    <div class="suspension__warning"
      :class="[
        balanceSuspend ? 'bg-red text-white' : '',
        balanceWarning || !serverCount ? 'bg-yellow-300 text-black' : ''
      ]"
    >
      <div><ExclamationIcon class="w-8"/></div>
      <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-10 xl:space-x-20">
        <span>{{ message }}</span>
        <button @click=toggleTopUpModal class="button button--solid button--small h-8 w-max flex-shrink-0">
          Top Up
          <div><PlusIcon class="w-4 ml-2"/></div>
        </button>
      </div>
    </div>
    <TopUpModal
      v-show=showTopUpModal
      @modal-close=toggleTopUpModal
    />
  </div>
</template>

<script>
import TopUpModal from '@/components/billing/TopUpModal'
import { ExclamationIcon, PlusIcon } from '@heroicons/vue/outline'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'SuspensionMessage',
  components: {
    ExclamationIcon,
    PlusIcon,
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
    message() {
      if (!this.balance) return

      const warningThreshold = this.balance.threshold.warning

      /* eslint-disable max-len */
      if (!this.serverCount) return `Top up your account to at least $${warningThreshold} to enable services`
      if (this.account.suspended) return 'You have unpaid invoices. Please top up to reactivate your services. Failure to pay will result in your services being permanently deleted.'
      if (this.balanceSuspend) return 'Your balance is less than your current spend. Your services will be suspended if you don\'t top up.'
      if (this.balanceWarning) return `Your balance ${this.balance.total <= warningThreshold ? 'is' : 'at the end of the day will be'} less than $${warningThreshold}. Your services may be suspended if you don't top up.`
      return ''
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
