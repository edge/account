<template>
  <div v-if="paymentMethods && paymentMethods.length" class="flex flex-row flex-wrap gap-2">
    <PaymentMethodItem
      v-for="paymentMethod in paymentMethods"
      :autoPaymentCard=autoPaymentCard
      :paymentMethod="paymentMethod"
      :key="paymentMethod._key"
      @refreshPaymentMethods="updatePaymentMethods"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '@edge/account-utils'
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
    autoPaymentEnabled() {
      return this.account && this.account.topup
    },
    autoPaymentCard() {
      if (this.autoPaymentEnabled) return this.account.topup.paymentMethod
      return null
    }
  },
  methods: {
    onRefreshPaymentMethods() {
      this.updatePaymentMethods()
    },
    async updatePaymentMethods() {
      const { results, metadata } = await utils.getPaymentMethods(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
        limit: this.limit,
        page: this.currentPage
      })
      this.paymentMethods = results
      this.metadata = metadata
      this.$emit('updatePaymentMethods', results)
      return results
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
</style>
