<template>
  <div>
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <TableHeader
              header="Date"
              param="timestamp"
              class="tableHead__cell"
              width="15%"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Tx Hash"
              param="hash"
              class="tableHead__cell"
              width="15%"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="From/To"
              class="tableHead__cell"
              width="20%"
            />
            <TableHeader
              header="Memo"
              param="data.memo"
              class="tableHead__cell"
              width="20%"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Status"
              param="block.height"
              class="tableHead__cell"
              width="15%"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Amount (XE)"
              param="amount"
              class="tableHead__cell"
              width="15%"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
          </tr>
        </thead>
        <tbody class="tableBody">
          <LoadingTableDataRow v-if="!transactions" colspan="6" />
          <tr v-else-if="!transactions.length">
            <td colspan="6" class="tableBody__cell text-center text-gray-500 py-4">No transactions</td>
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
import TableHeader from '@/components/TableHeader'
import { mapState } from 'vuex'

export default {
  name: 'BillingTransactionTable',
  components: {
    BillingTransactionTableItem,
    LoadingTableDataRow,
    Pagination,
    TableHeader
  },
  data() {
    return {
      iTransactions: null,
      limit: 5,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      sortQuery: '',
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
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = [this.sortQuery, '-timestamp']

      const transactions = await index.tx.transactions(
        process.env.VUE_APP_INDEX_URL,
        this.account.wallet.address,
        params
      )
      this.transactions = transactions.results
      this.metadata = transactions.metadata
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
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
    },
    sortQuery() {
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
