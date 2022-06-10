<template>
  <tr>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span>{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Description:</span>
      <span>{{ description }}</span>
    </td>
    <td class="tableBody__cell row-start-1 col-start-2">
      <span class="mr-2 lg:hidden">Status:</span>
      <div
        class="capitalize"
        :class="isStatusRed ? 'text-red' : 'text-green'"
      >
        <span>{{ invoice.status }}</span>
      </div>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Amount:</span>
      <span class="capitalize">{{ formattedAmount }} <span class="lg:hidden">XE</span></span>
    </td>
    <td class="tableBody__cell col-span-2">
      <button
        class="cursor-pointer hover:text-green"
        @click=downloadInvoice
      ><DocumentDownloadIcon class="w-5"/></button>
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
    description() {
      const date = moment(this.invoice.end).format('LL')
      return `Daily Invoice ${date}`
    },
    formattedDate() {
      return moment(this.invoice.end).format('LL')
    },
    formattedTime() {
      return moment(this.invoice.end).format('LTS')
    },
    formattedAmount() {
      return (this.invoice.items.amount / 1e6).toFixed(6)
    },
    isStatusRed() {
      return this.invoice.status === 'unpaid'
    }
  },
  methods: {
    downloadInvoice() {
      console.log('download invoice TBD')
    }
  }
}
</script>
<style scoped>
tr {
  @apply grid grid-rows-4 py-4 gap-x-2 gap-y-2;
  grid-template-columns: auto;
}

.tableBody__cell {
  @apply text-xs flex items-center text-gray-500;
}

.table__icon {
  @apply w-4;
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }
}
</style>
