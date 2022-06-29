<template>
  <div v-if="message" class="mb-8 w-full">
    <div class="suspension__warning"
      :class="[
        balanceSuspend ? 'bg-red text-white' : '',
        balanceWarning ? 'bg-yellow-300 text-black' : ''
      ]"
    >
      <div><ExclamationIcon class="w-8"/></div>
      <span>{{ message }}</span>
      <button @click=toggleTopUpModal class="button button--success button--small h-10 w-max">
        Top Up
        <div><PlusIcon class="w-4 ml-2"/></div>
      </button>
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
    ...mapState(['account', 'balance']),
    message() {
      if (!this.balance) return

      const warningThreshold = this.balance.threshold.warning

      /* eslint-disable max-len */
      if (this.account.suspended) return 'You have unpaid invoices. Please top up to reactive your services. Failure to pay will result in your services being permanently deleted.'
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
  @apply fixed z-30 flex items-center space-x-4 py-4 px-8;
  width: inherit;
}
</style>
