<template>
  <div>
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <th scope="col" class="tableHead__cell" width="15%">
              Date
            </th>
            <th scope="col" class="tableHead__cell" width="15%">
              Tx Hash
            </th>
            <th scope="col" class="tableHead__cell" width="20%">
              From/To
            </th>
            <th scope="col" class="tableHead__cell" width="20%">
              Memo
            </th>
            <th scope="col" class="tableHead__cell" width="15%">
              Status
            </th>
            <th scope="col" class="tableHead__cell amount" width="15%">
              Amount (XE)
            </th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <LoadingTableDataRow v-if="!transactions" colspan="6" />
          <tr v-else-if="!transactions.length">
            <td colspan="6" class="tableBody__cell text-center text-gray-500">No transactions</td>
          </tr>
          <BillingTransactionTableItem
            v-else
            v-for="tx in transactions"
            :tx="tx"
            :key="tx._key"
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

import * as index from '@edge/index-utils'
import BillingTransactionTableItem from '@/components/billing/BillingTransactionTableItem'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

export default {
  name: 'BillingTransactionTable',
  components: {
    BillingTransactionTableItem,
    LoadingTableDataRow,
    Pagination
  },
  data() {
    return {
      iTransactions: null,
      limit: 5,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      transactions: null
    }
  },
  computed: {
    ...mapState(['account', 'session']),
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    }
  },
  methods: {
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    async updateTransactions() {
      const transactions = await index.tx.transactions(
        process.env.VUE_APP_INDEX_URL,
        this.account.wallet.address,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.transactions = transactions.results
      this.metadata = transactions.metadata
    }
  },
  mounted() {
    this.updateTransactions()
    this.iTransactions = setInterval(() => {
      this.updateTransactions()
    }, 5000)
  },
  unmounted() {
    clearInterval(this.iTransactions)
  },
  watch: {
    pageHistory() {
      this.updateTransactions()
    }
  }
}
</script>
<style scoped>
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

  .tableHead__cell.amount {
    @apply text-right
  }
}
</style>
