<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0">
      <TransferXE />
      <div class="box">
        <div class="flex flex-col">
          <h4>Add Funds with FIAT</h4>
          <!-- eslint-disable-next-line max-len -->
          <p>You can also purchase XE with your credit or debit card. This is possible through one-off payments or enabling auto top-ups which will ensure you always have the correct funds in your account.</p>
          <span></span>
          <p>The current exchange rate is 1.00 USD = {{ formattedXE }} XE</p>
          <router-link
            :to="{ name: 'Payments'}"
            class="button button--small button--success w-full md:max-w-xs self-end"
          >
            Add funds with FIAT
          </router-link>
        </div>
      </div>
    </div>
    <div class="box">
      <h4>Transactions</h4>
      <BillingTransactionTable />
    </div>
  </div>
</template>

<script>
import BillingTransactionTable from '@/components/billing/BillingTransactionTable'
import TransferXE from '@/components/billing/TransferXE'
import { mapState } from 'vuex'

export default {
  name: 'Wallet',
  components: {
    BillingTransactionTable,
    TransferXE
  },
  computed: {
    ...mapState(['account', 'balance']),
    formattedXE() {
      return this.balance.token.usdPerXe.toFixed(6)
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
</style>
