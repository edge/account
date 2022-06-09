<template>
  <div class="mainContent__inner space-y-4">
    <h1>Billing</h1>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Account Details</h4>
        <div class="details__section">
          <span class="details__title">Account No:</span>
          <span class="details__info">{{ formattedAccountNumber }}</span>
        </div>
        <div class="details__section">
          <span class="details__title">Wallet:</span>
          <a href="" class="link">
            <span class="details__info">{{ account.wallet.address }}</span>
          </a>
        </div>
        <div class="details__section">
          <span class="details__title">Balance:</span>
          <span class="details__info">123,456.000000 XE (placeholder)</span>
        </div>
      </div>
      <div class="box">
        <h4>Consumption</h4>
        <span>Some consumption related info will go here. We'll make it look really cool. </span>
      </div>
    </div>
    <div class="box">
      <h4>Transactions</h4>
      <BillingTransactionTable />
    </div>

    <div class="box">
      <h4>Invoices</h4>
      <BillingInvoiceTable />
    </div>
  </div>
</template>

<script>
import BillingInvoiceTable from '@/components/billing/BillingInvoiceTable'
import BillingTransactionTable from '@/components/billing/BillingTransactionTable'
import { mapState } from 'vuex'

export default {
  name: 'Billing',
  title() {
    return 'Edge Account Portal » Billing'
  },
  components: {
    BillingInvoiceTable,
    BillingTransactionTable
  },
  computed: {
    ...mapState(['account', 'session']),
    formattedAccountNumber() {
      // add space every 4 characters
      return this.account._key.replace(/.{4}/g, '$& ')
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

.details__section {
  @apply flex flex-col my-2;
}
.details__title {
  
}
.details__info {
  @apply text-gray-500 text-md;
}

.link .details__info {
  @apply border-b border-gray-400;
}
.link:hover .details__info {
  @apply text-green-400 border-green-400;
}
</style>
