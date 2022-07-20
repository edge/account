<template>
  <tr class="hover:bg-gray-200 cursor-pointer" @click="goToPurchase">
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <span class="mr-2 lg:hidden">Date:</span>
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span class="truncate">{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <span class="mr-2 lg:hidden">Date:</span>
        <div><ClockIcon class="table__icon mr-1 lg:hidden" /></div>
        <span class="truncate">{{ formattedTime }}</span>
      </div>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Sent:</span>
      <span class="truncate">{{ formattedSentAmount }} <span class="lg:hidden">USD</span></span>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Received:</span>
      <span class="truncate">{{ formattedReceivedAmount }} <span class="lg:hidden">XE</span></span>
    </td>
    <td class="tableBody__cell status row-start-1 col-start-2">
      <span class="mr-2 lg:hidden">Status:</span>
      <div class="flex space-x-1 items-center">
        <span
          class="truncate capitalize"
          :class="[
            isConfirmed ? 'text-green' : '',
            isCancelled ? 'text-red' : '',
            isInProgress ? 'italic pr-1' : ''
          ]"
        >
          {{ status }}
        </span>
      </div>
    </td>
  </tr>
</template>

<script>
import * as format from '../../utils/format'
import { CalendarIcon, ClockIcon } from '@heroicons/vue/outline'

const statusLookup = {
  canceled: 'Cancelled',
  requires_action: 'Purchase Incomplete',
  requires_confirmation: 'Purchase Incomplete',
  requires_payment_method: 'Purchase Incomplete',
  succeeded: 'Confirmed'
}

export default {
  name: 'PurchaseTableItem',
  data() {
    return {
      downloadError: false,
      unholdError: false
    }
  },
  components: {
    CalendarIcon,
    ClockIcon
  },
  props: ['purchase'],
  computed: {
    formattedDate() {
      return format.date(this.purchase.created)
    },
    formattedReceivedAmount() {
      return format.xe(this.purchase.receive.amount)
    },
    formattedSentAmount() {
      return format.usd(this.purchase.send.amount, 2)
    },
    formattedTime() {
      return format.time(this.purchase.created)
    },
    isCancelled() {
      return this.purchase.intent.status === 'canceled'
    },
    isConfirmed() {
      return this.purchase.intent.status === 'succeeded'
    },
    isInProgress() {
      return this.purchase.intent.status !== 'canceled' && this.purchase.intent.status !== 'succeeded'
    },
    status() {
      return statusLookup[this.purchase.intent.status] || this.purchase.intent.status
    }
  },
  methods: {
    goToPurchase() {
      this.$router.push({
        name: 'Purchase',
        params: {
          id: this.purchase._key
        }
      })
    }
  }
}
</script>
<style scoped>
tr {
  @apply grid py-4 gap-x-2 gap-y-2;
  grid-template-columns: auto;
}

.tableBody__cell {
  @apply flex items-center text-gray-500 leading-4 truncate;
}

.tableBody__cell.status {
  overflow: visible;
  text-overflow: unset
}

.tableBody__cell.table__button {
  @apply overflow-visible;
}

.table__icon {
  @apply w-4;
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full;
  }
  .tableBody__cell.table__button {
    @apply py-0;
  }

  .action_buttons {
    @apply space-x-2
  }
}

@media (max-width: 450px) {
  tr {
    @apply grid py-4 gap-x-2 gap-y-2;
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
