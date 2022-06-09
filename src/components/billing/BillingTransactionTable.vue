<template>
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
          <th scope="col" class="tableHead__cell" width="15%">
            Amount (XE)
          </th>
        </tr>
      </thead>
      <tbody class="tableBody" v-if=transactions>
        <BillingTransactionTableItem
          v-for="tx in transactions"
          :tx="tx"
          :key="tx._key"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import BillingTransactionTableItem from '@/components/billing/BillingTransactionTableItem'
import { mapState } from 'vuex'

export default {
  name: 'BillingTransactionTable',
  components: {
    BillingTransactionTableItem
  },
  data() {
    return {
      iTransactions: null,
      transactions: null
    }
  },
  computed: {
    ...mapState(['account', 'session'])
  },
  methods: {
    async updateTransactions() {
      try {
        // const transactions = await utils.billing.gettransactions(
        //   process.env.VUE_APP_ACCOUNT_API_URL,
        //   this.session._key
        // )
        // this.transactions = transactions.results
        this.transactions = [
          {
            created: Date.now(),
            hash: '123456784f1542982f9c804ac2cf8fddb8b4cc7b573c54c1127b9b8e38dede1',
            amount: 125000000,
            sender: this.account.wallet.address,
            recipient: 'xe_a1237683b23c342d324',
            status: 'pending',
            memo: 'Invoice Payment 30 May 2022',
            _key: '111'
          },
          {
            created: Date.now(),
            hash: '98765484f1542982f9c804ac2cf8fddb8b4cc7b573c54c1127b9b8e38dede1',
            amount: 170000000,
            sender: 'xe_123abc456def789abc012def',
            recipient: 'xe_a1237683b23c342d324',
            status: 'confirmed',
            memo: 'Invoice Payment 29 May 2022',
            _key: '222'
          },
          {
            created: Date.now(),
            hash: 'a1b2c34f1542982f9c804ac2cf8fddb8b4cc7b573c54c1127b9b8e38dede1',
            amount: 189000000,
            sender: 'xe_123abc456def789abc012def',
            recipient: 'xe_a1237683b23c342d324',
            status: 'confirmed',
            memo: 'Invoice Payment 28 May 2022',
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
    this.updateTransactions()
    this.iTransactions = setInterval(() => {
      this.updateTransactions()
    }, 5000)
  },
  unmounted() {
    clearInterval(this.iTransactions)
    this.iTransactions = null
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
