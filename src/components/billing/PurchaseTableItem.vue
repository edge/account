<template>
  <tr>
    <td class="tableBody__cell reference">
      <span class="mr-2 lg:hidden">Reference:</span>
      <span class="flex items-center space-x-1">
        <button @click=goToPurchase class="underline hover:text-green">#{{ purchase._key }}</button>
        <Tooltip
          v-if="purchase.auto"
          text="Purchase made by auto payment"
          position="right"
        >
          <InformationCircleIcon class="w-4 text-gray-400" />
        </Tooltip>
      </span>
    </td>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <span class="mr-2 lg:hidden">Date:</span>
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span class="truncate">{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <span class="mr-2 lg:hidden">Time:</span>
        <div><ClockIcon class="table__icon mr-1 lg:hidden" /></div>
        <span class="truncate">{{ formattedTime }}</span>
      </div>
    </td>
    <td class="tableBody__cell">
      <span class="mr-2 lg:hidden">Sent:</span>
      <span class="truncate">{{ formattedSentAmount }} <span class="lg:hidden">USD</span></span>
    </td>
    <td class="tableBody__cell">
      <span class="mr-2 lg:hidden">Received:</span>
      <span class="truncate">{{ formattedReceivedAmount }} <span class="lg:hidden">XE</span></span>
    </td>
    <td class="tableBody__cell">
      <span class="mr-2 lg:hidden">Status:</span>
      <span
        class="truncate capitalize"
        :class="[
          isConfirmed ? 'text-green' : '',
          isCancelled ? 'text-red' : '',
          isProcessing ? 'italic pr-1' : ''
        ]"
      >
        {{ status }}
      </span>
    </td>
  </tr>
</template>

<script>
import * as format from '@/utils/format'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import Tooltip from '@/components/Tooltip'
import { CalendarIcon, ClockIcon } from '@heroicons/vue/outline'

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
    ClockIcon,
    InformationCircleIcon,
    Tooltip
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
      return this.purchase.status === 'cancelled'
    },
    isConfirmed() {
      return (this.purchase.status) === 'complete'
    },
    isProcessing() {
      return ['paid', 'pending', 'processed', 'unsent'].includes(this.purchase.status)
    },
    isInProgress() {
      return this.purchase.status === 'unpaid'
    },
    status() {
      if (this.isProcessing) return 'processing'
      return this.purchase.status
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

.tableBody__cell.status, .tableBody__cell.reference {
  overflow: visible;
  text-overflow: unset;
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
