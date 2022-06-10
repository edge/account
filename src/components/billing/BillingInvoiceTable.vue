<template>
  <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="hidden lg:table-header-group tableHead">
        <tr>
          <th scope="col" class="tableHead__cell">
            Date
          </th>
          <th scope="col" class="tableHead__cell">
            Description
          </th>
          <th scope="col" class="tableHead__cell">
            Status
          </th>
          <th scope="col" class="tableHead__cell">
            Amount (XE)
          </th>
          <th scope="col" class="tableHead__cell" width="80"></th>
        </tr>
      </thead>
      <tbody class="tableBody" v-if=invoices>
        <BillingInvoiceTableItem
          v-for="invoice in invoices"
          :invoice="invoice"
          :key="invoice._key"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import BillingInvoiceTableItem from '@/components/billing/BillingInvoiceTableItem'
import { mapState } from 'vuex'

export default {
  name: 'BillingInvoiceTable',
  components: {
    BillingInvoiceTableItem
  },
  data() {
    return {
      iInvoices: null,
      invoices: null
    }
  },
  computed: {
    ...mapState(['session'])
  },
  methods: {
    async updateInvoices() {
      try {
        const invoices = await utils.billing.getInvoices(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        console.log(invoices.results)
        // this.invoices = invoices.results
        this.invoices = [
          {
            end: Date.now(),
            items: {
              amount: 125000000,
              summary: 'Daily invoice'
            },
            amount: 125000000,
            status: 'unpaid',
            _key: '111'
          },
          {
            end: Date.now(),
            items: {
              amount: 170000000,
              summary: 'Daily invoice'
            },
            amount: 170000000,
            status: 'paid',
            _key: '222'
          },
          {
            end: Date.now(),
            items: {
              amount: 189000000,
              summary: 'Daily invoice'
            },
            amount: 189000000,
            status: 'paid',
            _key: '333'
          }
        ]
      }
      catch (error) {
        console.error(error)
      }
    }
  },
  mounted() {
    this.updateInvoices()
    this.iInvoices = setInterval(() => {
      this.updateInvoices()
    }, 5000)
  },
  unmounted() {
    clearInterval(this.iInvoices)
    this.iInvoices = null
  }
}
</script>
<style scoped>
.box {
  @apply rounded-lg bg-white w-full overflow-auto p-4 md:p-6;
}
.tableHead {
  @apply border-gray-300 border-b rounded-lg w-full bg-gray-50;
}
.tableHead__cell {
  @apply px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
}
.tableBody {
  @apply bg-white divide-y divide-gray-200;
}

table {
  @apply table-fixed w-full;
}
table, tbody {
  @apply block;
}

@screen lg {
  table {
    @apply table;
  }

  tbody {
    @apply table-row-group;
  }

  tr {
    @apply table-row py-0;
  }
}
</style>
