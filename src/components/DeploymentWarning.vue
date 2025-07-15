<template>
  <div :class="`box flex space-x-2 ${className || ''}`">
    <div><ExclamationIcon class="w-5 text-red" /></div>
    <span v-if="account.useCryptoView" class="text-red">
      <span v-if="config.accounts.limits.ignoreBalanceRestrictionsWithCard">Deployments are disabled while your balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to deploy new services.</span>
      <span v-else>Deployments are disabled while your balance is below ${{ balance.threshold.warning.usd }}. Please add funds to enable services.</span>
    </span>
    <span v-else class="text-red">
      <span v-if="config.accounts.limits.ignoreBalanceRestrictionsWithCard">Deployments are disabled until a payment card has been added to your account.</span>
      <span v-else>Deployments are disabled while your balance is below ${{ balance.threshold.warning.usd }}. Please add funds to enable services.</span>
    </span>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

export default {
  name: 'DeploymentWarning',
  computed: {
    ...mapState(['account', 'balance', 'config'])
  },
  props: ['className'],
  components: { ExclamationIcon }
}
</script>
