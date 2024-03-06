<template>
  <div class="mainContent__inner space-y-4">
    <h1>Billing</h1>
    <div v-if="account.useCryptoView" class="flex flex-col space-y-4 lg:gap-x-6 lg:space-y-0">
      <div class="box"><DetailsBox/></div>
    </div>

    <div v-if="account.useCryptoView" class="tabs flex space-x-2 pt-4">
      <div class="tab" :class="isSelected('payments') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Payments'}">Payments</router-link>
      </div>
      <div class="tab" :class="isSelected('invoices') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Invoices'}">Invoices</router-link>
      </div>
      <div class="tab" :class="isSelected('wallet') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Wallet'}">Wallet</router-link>
      </div>
    </div>
    <div v-else class="tabs flex space-x-2 pt-4">
      <div class="tab" :class="isSelected('invoices') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Invoices'}">Invoices</router-link>
      </div>
      <div class="tab" :class="isSelected('payments') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Payments'}">Payment Cards</router-link>
      </div>
      <div class="tab" :class="isSelected('promotions') ? 'tab--selected' : ''">
        <router-link :to="{name: 'Promotions'}">Promotions</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import DetailsBox from '@/components/account/DetailsBox'
import { mapState } from 'vuex'

export default {
  name: 'Billing',
  title() {
    return 'Edge Account Portal » Billing'
  },
  components: {
    DetailsBox
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
  },
  mounted() {
    if (this.$route.fullPath === '/billing' || this.$route.fullPath === '/billing/') {
      if (this.account && (this.account.useCryptoView || !this.account.topup)) {
        this.$router.push({ name: 'Payments' })
      }
      else {
        this.$router.push({ name: 'Invoices' })
      }
    }
  }
}
</script>
<style scoped>
</style>
