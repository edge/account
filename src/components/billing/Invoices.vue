<template>
  <div class="flex flex-col space-y-4">
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

export default {
  name: 'Invoices',
  components: {
    BillingInvoiceTable,
    BillingTransactionTable
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
