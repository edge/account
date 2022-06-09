<template>
  <tr>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span>{{ formattedDate }}, {{ formattedTime }}</span>
      </div>
    </td>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block">
        <span>{{ invoice.description }}</span>
      </div>
    </td>
    <td class="tableBody__cell row-start-3 col-span-3">
      <span class="mr-2 lg:hidden">Status:</span>
      <div
        class="capitalize"
        :class="isStatusRed ? 'text-red' : 'text-green'"
      >
        <span>{{ invoice.status }}</span>
      </div>
    </td>
    <td class="tableBody__cell row-start-1 col-span-3">
      <span class="capitalize task-action">{{ formattedAmount }}</span>
    </td>
    <td class="tableBody__cell">
      <div><DocumentDownloadIcon class="w-5"/></div>
    </td>
  </tr>
</template>

<script>
import moment from 'moment'
import { CalendarIcon, DocumentDownloadIcon } from '@heroicons/vue/outline'

export default {
  name: 'BillingInvoiceTableItem',
  components: {
    CalendarIcon,
    DocumentDownloadIcon
  },
  props: ['invoice'],
  computed: {
    formattedDate() {
      return moment(this.invoice.created).format('LL')
    },
    formattedTime() {
      return moment(this.invoice.created).format('LTS')
    },
    formattedAmount() {
      return (this.invoice.amount / 1e6).toFixed(6)
    },
    isStatusRed() {
      return this.invoice.status === 'unpaid'
    }
  }
}
</script>
<style scoped>
tr {
  @apply grid grid-rows-3 py-2 gap-x-2 gap-y-1;
  grid-template-columns: auto auto 1fr;
}

.tableBody__cell {
  @apply text-xs flex items-center text-gray-500;
}

.table__icon {
  @apply w-4;
}

.task-action {
  @apply text-sm text-black
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }

  .task-action {
    @apply text-gray-500;
  }
}
</style>
