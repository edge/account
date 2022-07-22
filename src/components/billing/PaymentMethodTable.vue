<template>
  <div v-if="paymentMethods && paymentMethods.length">
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <th scope="col" class="tableHead__cell" width="">
              Card Number
            </th>
            <th scope="col" class="tableHead__cell" width="100">
              Expiry
            </th>
            <th scope="col" class="tableHead__cell" width="100">
              Type
            </th>
            <th scope="col" class="tableHead__cell" width="">
              Default
            </th>
            <th scope="col" class="tableHead__cell actions" width="150"></th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <PaymentMethodTableItem
            v-for="paymentMethod in paymentMethods"
            :paymentMethod="paymentMethod"
            :key="paymentMethod._key"
            @updatePaymentMethods=updatePaymentMethods
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
import Pagination from '@/components/Pagination'
import PaymentMethodTableItem from '@/components/billing/PaymentMethodTableItem'
import { mapState } from 'vuex'

export default {
  name: 'PaymentMethodTable',
  components: {
    PaymentMethodTableItem,
    Pagination
  },
  data() {
    return {
      iPaymentMethods: null,
      paymentMethods: null,
      limit: 10,
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
    async updatePaymentMethods() {
      const paymentMethods = await utils.billing.getPaymentMethods(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.paymentMethods = paymentMethods.results
      this.metadata = paymentMethods.metadata
      this.$emit('updatePaymentMethods', paymentMethods.results)
    }
  },
  mounted() {
    this.updatePaymentMethods()
    this.iPaymentMethods = setInterval(() => {
      this.updatePaymentMethods()
    }, 15000)
  },
  unmounted() {
    clearInterval(this.iPaymentMethods)
    this.iPaymentMethods = null
  },
  watch: {
    pageHistory() {
      this.updatePaymentMethods()
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
