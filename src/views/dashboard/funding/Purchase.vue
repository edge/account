<template>
  <div class="mainContent__inner space-y-4">
    <h1>Purchase #{{this.purchaseId}}</h1>
    <div v-if="error" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Error loading purchase</h4>
        <p>{{error.message}}</p>
      </div>
    </div>
    <div v-else-if="status === 'loading'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Loading...</h4>
      </div>
    </div>
    <div v-else-if="status === 'succeeded'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Purchase Complete</h4>
      </div>
    </div>
    <div v-else-if="status === 'processing'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Processing...</h4>
      </div>
    </div>
    <div v-else-if="status === 'cancelled'" class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Purchase Cancelled</h4>
      </div>
    </div>
    <div v-else class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Purchase Incomplete</h4>
        <p>{{purchase.intent.status}}</p>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import { mapState } from 'vuex'

export default {
  name: 'Purchase',
  title() {
    return 'Edge Account Portal » Purchase'
  },
  data() {
    return {
      error: null,
      purchase: null
    }
  },
  components: {
  },
  computed: {
    ...mapState(['session']),
    purchaseId() {
      return this.$route.params.id
    },
    status() {
      /** @see https://stripe.com/docs/payments/intents#intent-statuses */
      if (this.error) return 'error'
      return this.purchase && this.purchase.intent.status || 'loading'
    }
  },
  mounted() {
    utils.fiat.getPurchase(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.purchaseId)
      .then(purchase => {
        this.purchase = purchase
      })
      .catch(err => {
        this.error = err
      })
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
</style>
