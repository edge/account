<template>
  <div>
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
              Amount (USD)
            </th>
            <th scope="col" class="tableHead__cell" width="120"></th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <LoadingTableDataRow v-if="!invoices" colspan="5" />
          <tr v-else-if="!invoices.length">
            <td colspan="5" class="tableBody__cell text-center text-gray-500">No invoices</td>
          </tr>
          <BillingInvoiceTableItem
            v-else
            v-for="invoice in invoices"
            :invoice="invoice"
            :key="invoice._key"
          />
        </tbody>
      </table>
    </div>
    <Pagination
      :border="true"
      :currentPage=currentPage
      :limit=limit
      :totalCount="metadata.totalCount"
      @change-page=changePage
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import BillingInvoiceTableItem from '@/components/billing/BillingInvoiceTableItem'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

export default {
  name: 'BillingInvoiceTable',
  components: {
    BillingInvoiceTableItem,
    LoadingTableDataRow,
    Pagination
  },
  data() {
    return {
      iInvoices: null,
      invoices: null,
      limit: 5,
      metadata: { totalCount: 0 },
      pageHistory: [1]
    }
  },
  computed: {
    ...mapState(['session']),
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    }
  },
  methods: {
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    async updateInvoices() {
      const invoices = await utils.billing.getInvoices(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.invoices = invoices.results
      this.metadata = invoices.metadata
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
  },
  watch: {
    pageHistory() {
      this.updateInvoices()
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

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }
}
</style>
