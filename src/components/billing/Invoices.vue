<template>
  <div class="flex flex-col space-y-4">
    <div class="box">
      <h4>Invoices</h4>
      <BillingInvoiceTable />
    </div>
  </div>
</template>

<script>
import BillingInvoiceTable from '@/components/billing/BillingInvoiceTable'

export default {
  name: 'Invoices',
  components: {
    BillingInvoiceTable
  }
}
</script>

<style scoped>
</style>
