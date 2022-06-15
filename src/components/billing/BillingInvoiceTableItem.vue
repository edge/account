<template>
  <tr>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <span class="mr-2 lg:hidden">Date:</span>
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span class="truncate">{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Description:</span>
      <span class="truncate">{{ description }}</span>
    </td>
    <td class="tableBody__cell status row-start-1 col-start-2">
      <span class="mr-2 lg:hidden">Status:</span>
      <span
        class="truncate capitalize"
        :class="isPaid ? 'text-green' : 'text-red'"
      >
        {{ invoice.status }}
      </span>
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Amount:</span>
      <span class="truncate">{{ formattedAmount }} <span class="lg:hidden">USD</span></span>
    </td>
    <td class="tableBody__cell table__button col-span-2">
      <button
        class="button button--extraSmall button--success w-full lg:w-max"
        @click=downloadInvoice
      >
        <span class="leading-5">PDF</span>
        <div><DocumentDownloadIcon class="ml-2 w-5"/></div>
      </button>
    </td>
  </tr>
</template>

<script>
/* global process */

import { mapState } from 'vuex'
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
    ...mapState(['session']),
    description() {
      const date = moment(this.invoice.start).format('LL')
      return `Daily Invoice ${date}`
    },
    formattedDate() {
      return moment(this.invoice.start).format('LL')
    },
    formattedAmount() {
      return `$ ${(Math.round(this.invoice.amount * 1e4) / 1e4).toFixed(4)}`
    },
    isPaid() {
      return this.invoice.status === 'paid'
    }
  },
  methods: {
    async downloadInvoice() {
      try {
        const url = `${process.env.VUE_APP_ACCOUNT_API_URL}/billing/invoices/${this.invoice._key}/download`
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.session._key}`
          }
        })
        const blob = await response.blob()
        // explicitly set the mime-type to avoid browser issues
        const newBlob = new Blob([blob], { type: 'application/pdf' })

        // handle Microsoft browser quirks
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          return window.navigator.msSaveOrOpenBlob(newBlob)
        }
        // for normal browsers
        const objectUrl = window.URL.createObjectURL(newBlob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = `Edge Invoice - ${this.formattedDate}`
        link.click()

        // open the pdf in a new tab, but doesn't set the pdf file name this would replace the above 4 lines
        // window.open(objectUrl, '_blank')

        // revoke ObjectURL (cleanup)
        setTimeout(() => window.URL.revokeObjectURL(objectUrl), 100)
      }
      catch (error) {
        console.error(error)
      }
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
  @apply text-xs flex items-center text-gray-500 leading-4 truncate;
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
