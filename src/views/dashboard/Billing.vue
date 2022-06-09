<template>
  <div class="mainContent__inner space-y-4">
    <h1>Billing</h1>
    <div class="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
      <div class="box">
        <h4>Account Details</h4>
        <div>
          <span>Account No: </span><span>{{ formattedAccountNumber }}</span>
        </div>
        <div>
          <span>Wallet: </span><span>{{ account.wallet.address }}</span>
        </div>
        <div>
          <span>Balance (XE): </span><span>123,456 (placeholder)</span>
        </div>
      </div>
      <div class="box">
        <h4>Consumption</h4>
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
import { DuplicateIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

export default {
  name: 'Billing',
  title() {
    return 'Edge Account Portal » Billing'
  },
  components: {
    BillingInvoiceTable,
    BillingTransactionTable,
    DuplicateIcon,
  },
  computed: {
    ...mapState(['account', 'session']),
    formattedAccountNumber() {
      // add space every 4 characters
      return this.account._key.replace(/.{4}/g, '$& ')
    }
  },
  data() {
    return {
      copied: false
    }
  },
  methods: {
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account._key)
      setTimeout(() => {
        this.copied = false
      }, 2000)
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

.account-number-wrapper {
  @apply flex items-center justify-between relative w-max max-w-full;
}
.account-number {
  @apply text-3xl text-green pr-4;
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}
</style>
