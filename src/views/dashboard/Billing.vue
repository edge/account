<template>
  <div class="mainContent__inner space-y-4">
    <h1>Billing</h1>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <DetailsBox>
        <template v-slot:buttons>
          <button @click=addFunds class="button button--success button--small">
            Add Funds
          </button>
        </template>
      </DetailsBox>
      <div class="box">
        <ReferralCode />
      </div>
      <!-- <div class="box">
        <h4>Consumption</h4>
        <span>Some consumption related info will go here. We'll make it look really cool. </span>
      </div> -->
    </div>
    <div class="tabs flex space-x-2">
      <div class="tab" :class="isSelected('wallet') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Wallet'}">Wallet</router-link>
      </div>
      <div class="tab" :class="isSelected('payments') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Payments'}">Payments</router-link>
      </div>
      <div class="tab" :class="isSelected('invoices') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Invoices'}">Invoices</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
/* global process */

import * as format from '../../utils/format'
import DetailsBox from '@/components/account/DetailsBox'
import ReferralCode from '@/components/ReferralCode'
import { mapState } from 'vuex'

export default {
  name: 'Billing',
  title() {
    return 'Edge Account Portal » Billing'
  },
  components: {
    DetailsBox,
    ReferralCode
  },
  data() {
    return {
      iBalance: null,
      rate: null
    }
  },
  computed: {
    ...mapState(['account', 'balance', 'session']),
    explorerUrlWallet() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.account.wallet.address}`
    },
    formattedBalance() {
      return format.xe(this.balance.total.xe)
    },
    formattedUSDBalance() {
      return format.usd(this.usdBalance, 2)
    },
    usdBalance() {
      return this.balance.total.usd
    }
  },
  methods: {
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account.wallet.address)
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    addFunds() {
      this.$router.push('/billing/payments')
    },
    isSelected(route) {
      return this.$route.fullPath.includes(route)
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full mb-4 font-medium;
}

.tabGroup {
  @apply relative;
}

.tabs {
  @apply w-full space-x-4 md:space-x-8 border-b border-gray-300 overflow-auto flex flex-nowrap;
}
.tab {
  @apply pb-1 font-medium border-b text-gray-500 border-transparent;
  @apply hover:text-black;
}
.tab.tab--selected {
  @apply text-green border-green;
  @apply hover:text-green;
}
</style>
