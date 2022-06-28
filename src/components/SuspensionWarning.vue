<template>
  <div>
    <div v-if="message" class="suspension__warning"
      :class="[
        suspend ? 'bg-red text-white' : '',
        warning ? 'bg-yellow-300 text-black' : ''
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
import { mapState } from 'vuex'
import { ExclamationIcon, PlusIcon } from '@heroicons/vue/outline'

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
    ...mapState(['balance']),
    message() {
      if (!this.balance) return

      const warningThreshold = this.balance.threshold.warning
      const suspendThreshold = this.balance.threshold.suspend

      /* eslint-disable max-len */
      if (this.balance.available <= suspendThreshold) return 'Your balance is less than your current spend. Your services will be suspended if you don\'t top up.'
      if (this.balance.total <= warningThreshold) return `Your balance is less than $${warningThreshold}. Your services may be suspended if you don't top up.`
      if (this.balance.available <= warningThreshold) return `Your balance at the end of the day will be less than $${warningThreshold}. Your services may be suspended if you don't top up.`
      return ''
      /* eslint-enable max-len */
    },
    warning() {
      if (!this.balance) return
      // eslint-disable-next-line max-len
      return this.balance.available > this.balance.threshold.suspend && this.balance.available <= this.balance.threshold.warning
    },
    suspend() {
      if (!this.balance) return
      return this.balance.available <= this.balance.threshold.suspend
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
  @apply flex items-center space-x-4 py-4 px-8;
}
</style>
