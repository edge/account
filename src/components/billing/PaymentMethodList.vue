<template>
  <div v-if="paymentMethods && paymentMethods.length" class="flex flex-col space-y-2">
    <PaymentMethodItem
      v-for="paymentMethod in paymentMethods"
      :autoTopUpCard=autoTopUpCard
      :paymentMethod="paymentMethod"
      :key="paymentMethod._key"
      @refreshPaymentMethods="updatePaymentMethods"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import PaymentMethodItem from '@/components/billing/PaymentMethodItem'
import { mapState } from 'vuex'


export default {
  name: 'PaymentMethodList',
  components: {
    PaymentMethodItem
  },
  data() {
    return {
      iPaymentMethods: null,
      paymentMethods: null
    }
  },
  computed: {
    ...mapState(['account', 'session']),
    autoTopUpEnabled() {
      return this.account && this.account.topup
    },
    autoTopUpCard() {
      if (this.autoTopUpEnabled) return this.account.topup.paymentMethod
      return null
    }
  },
  methods: {
    onRefreshPaymentMethods() {
      this.updatePaymentMethods()
    },
    async updatePaymentMethods() {
      const paymentMethods = await utils.billing.getPaymentMethods(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.paymentMethods = paymentMethods.results
      this.metadata = paymentMethods.metadata
      this.$emit('updatePaymentMethods', paymentMethods.results)
    }
  },
  mounted() {
    this.updatePaymentMethods()
    this.iPaymentMethods = setInterval(() => {
      this.updatePaymentMethods()
    }, 15000)
  },
  unmounted() {
    clearInterval(this.iPaymentMethods)
    this.iPaymentMethods = null
  },
  emits: ['updatePaymentMethods']
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}
.box h4 {
  @apply w-full mb-4 font-medium;
}
</style>
