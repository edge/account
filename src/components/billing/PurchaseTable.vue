<template>
  <div>
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <TableHeader
              header="Reference"
              param="_key"
              class="tableHead__cell"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Date"
              param="created"
              class="tableHead__cell"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Time"
              class="tableHead__cell"
            />
            <TableHeader
              header="Type"
              class="tableHead__cell"
            />
            <TableHeader
              :header="account.useCryptoView ? 'Sent (USD)' : 'Paid (USD)'"
              param="send.amount"
              class="tableHead__cell"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              v-if="account.useCryptoView"
              header="Received (XE)"
              param="receive.amount"
              class="tableHead__cell"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Status"
              param="status"
              class="tableHead__cell"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
          </tr>
        </thead>
        <tbody class="tableBody">
          <LoadingTableDataRow v-if="!purchases" :colspan="account.useCryptoView ? 7 : 6" />
          <tr v-else-if="!purchases.length">
            <td :colspan="account.useCryptoView ? 7 : 6" class="tableBody__cell text-center text-gray-500 py-4">No purchases</td>
          </tr>
          <PurchaseTableItem
            v-else
            v-for="purchase in purchases"
            :purchase="purchase"
            :key="purchase._key"
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

import * as utils from '@edge/account-utils'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import PurchaseTableItem from '@/components/billing/PurchaseTableItem'
import TableHeader from '@/components/TableHeader'
import { mapState } from 'vuex'

export default {
  name: 'PurchaseTable',
  components: {
    LoadingTableDataRow,
    PurchaseTableItem,
    Pagination,
    TableHeader
  },
  data() {
    return {
      iPurchases: null,
      purchases: null,
      limit: 10,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      sortQuery: ''
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
    async updatePurchases() {
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = [this.sortQuery, '-created', 'updated']

      const purchases = await utils.getPurchases(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, params)
      this.purchases = purchases.results
      this.metadata = purchases.metadata
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
    }
  },
  mounted() {
    this.updatePurchases()
    this.iPurchases = setInterval(() => {
      this.updatePurchases()
    }, 15000)
  },
  unmounted() {
    clearInterval(this.iPurchases)
    this.iPurchases = null
  },
  watch: {
    pageHistory() {
      this.updatePurchases()
    },
    sortQuery() {
      this.updatePurchases()
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
}
</style>
