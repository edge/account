<template>
  <div class="mainContent__inner space-y-4">
    <h1>Billing</h1>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <DetailsBox>
        <template v-slot:buttons>
          <button @click=addFunds class="button button--success button--small h-10">
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
    <div class="flex space-x-2">
      <router-link :to="{name: 'Invoices'}" class="tab">Invoices</router-link>
      <router-link :to="{name: 'Payments'}" class="tab">Payments</router-link>
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
      this.$router.push('/funding')
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full pb-2 mb-4 font-medium;
}

.tab {
  @apply hover:underline hover:text-green
}
</style>
