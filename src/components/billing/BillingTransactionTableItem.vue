<template>
  <tr>
    <td class="tableBody__cell">
      <div class="flex flex-row items-center lg:block truncate">
        <span class="mr-2 lg:hidden flex-shrink-0">Date:</span>
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span class="truncate">{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden flex-shrink-0">Tx Hash:</span>
      <a :href="explorerUrlTx" target="_blank" rel="noreferrer">
        <span class="truncate">{{ tx.hash }}</span>
      </a>
    </td>
    <td class="tableBody__cell col-span-2">
      <div v-if="sent" class="flex items-center truncate">
        <span class="mr-2 lg:hidden">To:</span>
        <div><ArrowUpIcon class="table__icon mr-1 text-red" /></div>
        <a :href="explorerUrlToAddress" target="_blank" rel="noreferrer">
          <span class="truncate">{{ tx.recipient }}</span>
        </a>
      </div>
      <div v-else class="flex items-center truncate">
        <span class="mr-2 lg:hidden">From:</span>
        <div><ArrowDownIcon class="table__icon mr-1 text-green" /></div>
        <a :href="explorerUrlFromAddress" target="_blank" rel="noreferrer">
          <span class="truncate">{{ tx.sender }}</span>
        </a>
      </div>

    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Memo:</span>
      <span class="truncate">{{ tx.data.memo }}</span>
    </td>
    <td class="tableBody__cell status row-start-1 col-start-2">
      <span class="mr-2 lg:hidden">Status:</span>
      <div
        class="flex items-center truncate"
        :class="isConfirmed ? 'text-green' : 'italic text-gray-400'"
      >
        <div v-if="isConfirmed"><CheckCircleIcon class="table__icon w-4 mr-1"/></div>
        <div v-else><ClockIcon class="table__icon w-4 mr-1"/></div>
        <span class="capitalize truncate">{{ status }}</span>
      </div>
    </td>
    <td class="tableBody__cell amount">
      <span class="mr-2 lg:hidden">Amount:</span>
      <span>{{ formattedAmount }} <span class="lg:hidden">XE</span></span>
    </td>
  </tr>
</template>

<script>
/* global process */

import { mapState } from 'vuex'
import moment from 'moment'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/vue/outline'

export default {
  name: 'BillingTransactionTableItem',
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon
  },
  props: ['tx'],
  computed: {
    ...mapState(['account']),
    explorerUrlFromAddress() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.tx.sender}`
    },
    explorerUrlToAddress() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.tx.recipient}`
    },
    explorerUrlTx() {
      return `${process.env.VUE_APP_EXPLORER_URL}/transaction/${this.tx.hash}`
    },
    formattedAmount() {
      return (this.tx.amount / 1e6).toFixed(6)
    },
    formattedDate() {
      return moment(this.tx.timestamp).format('LL')
    },
    isConfirmed() {
      return this.tx.confirmations >= 10
      // return (this.tx.confirmations || 0) >= 10
    },
    isPending() {
      return this.tx.pending
    },
    sent() {
      return this.tx.sender === this.tx.recipient || this.account.wallet.address === this.tx.sender
    },
    status() {
      if (this.isConfirmed) return 'Confirmed'
      if (this.isPending) return 'Pending'
      return `${this.tx.confirmations} confirmations`
    }
  }
}
</script>
<style scoped>
tr {
  @apply grid grid-rows-4 py-4 gap-x-2 gap-y-2;
  grid-template-columns: repeat(2, 1fr);
}

.tableBody__cell {
  @apply text-xs flex items-center text-gray-500 leading-4 truncate;
}

.table__icon {
  @apply w-3.5 lg:w-4
}

a {
  @apply truncate
}

a span {
  @apply text-gray-500 border-b border-gray-500 hover:text-green hover:border-green
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle;
  }

  .tableBody__cell.amount {
    @apply text-right pr-6
  }
}

@media (max-width: 450px) {
  tr {
    @apply grid grid-rows-4 py-4 gap-x-2 gap-y-2;
    grid-template-columns: 1fr;
  }

  .status {
    @apply row-start-2 col-start-1;
  }
  .tableBody__cell {
    @apply col-span-1;
  }
}
</style>
