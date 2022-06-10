<template>
  <tr>
    <td class="tableBody__cell">
      <div class="flex flex-row items-center justify-center lg:block truncate">
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span>{{ formattedDate }}, {{ formattedTime }}</span>
      </div>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Tx Hash:</span>
      <span class="truncate">{{ tx.hash }}</span>
    </td>
    <td class="tableBody__cell col-span-2">
      <div v-if="sent" class="flex items-center">
        <span class="mr-2 lg:hidden">To:</span>
        <div><ArrowDownIcon class="table__icon w-4 mr-1 text-red" /></div>
        <span class="truncate">{{ tx.recipient }}</span>
      </div>
      <div v-else class="flex items-center">
        <span class="mr-2 lg:hidden">From:</span>
        <div><ArrowUpIcon class="table__icon w-4 mr-1 text-green" /></div>
        <span class="truncate">{{ tx.sender }}</span>
      </div>

    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Memo:</span>
      <span>{{ tx.data.memo }}</span>
    </td>
    <td class="tableBody__cell row-start-1 col-start-2">
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
    <td class="tableBody__cell">
      <span class="mr-2 lg:hidden">Amount:</span>
      <span>{{ formattedAmount }} <span class="lg:hidden">XE</span></span>
    </td>
  </tr>
</template>

<script>
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
    formattedAmount() {
      return (this.tx.amount / 1e6).toFixed(6)
    },
    formattedDate() {
      return moment(this.tx.timestamp).format('LL')
    },
    formattedTime() {
      return moment(this.tx.timestamp).format('LTS')
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
  @apply text-xs flex items-center text-gray-500;
}

.table__icon {
  @apply w-4
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full truncate;
  }
}
</style>
