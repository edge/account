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
      <div class="flex space-x-1 items-center">
        <span
          class="truncate capitalize"
          :class="isPaid ? 'text-green' : 'text-red'"
        >
          {{ status }}
        </span>
        <Tooltip
          v-if="!canPay && onHold"
          position="right"
          :text="unholdTooltipText"
          theme="error"
          :wide="true"
        >
          <button
            :disabled="true"
            class="ml-2 text-gray-400"
            @click=unholdInvoice
          >
            <span>- <span class="underline">Pay Now</span></span>
          </button>
        </Tooltip>
        <button
          v-else-if="onHold"
          class="ml-2 hover:text-green"
          @click=unholdInvoice
        >
          <span>- <span class="underline">Pay Now</span></span>
        </button>
        <Tooltip v-if="unholdError" text="Something went wrong" theme="error" position="left">
          <ExclamationIcon class="w-5 text-red" />
        </Tooltip>
      </div>
  </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Amount:</span>
      <span class="truncate">{{ formattedAmount }} <span class="lg:hidden">USD</span></span>
    </td>
    <td class="tableBody__cell table__button col-span-2">
      <div class="flex items-center w-full space-x-2 action_buttons">
        <button
          class="button button--extraSmall button--success w-full lg:w-max"
          @click=downloadInvoice
        >
          <span class="leading-5">PDF</span>
          <div><DocumentDownloadIcon class="ml-2 w-5"/></div>
        </button>
        <Tooltip v-if="downloadError" :text="'Something went wrong'" theme="error" position="left">
          <ExclamationIcon class="w-5 text-red" />
        </Tooltip>
      </div>
    </td>
  </tr>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as format from '@/utils/format'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
import { CalendarIcon, DocumentDownloadIcon, ExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'BillingInvoiceTableItem',
  data() {
    return {
      downloadError: false,
      unholdError: false
    }
  },
  components: {
    CalendarIcon,
    DocumentDownloadIcon,
    ExclamationIcon,
    Tooltip
  },
  props: ['invoice'],
  computed: {
    ...mapState(['balance', 'session']),
    canPay() {
      return this.invoice.amount <= this.usdBalance
    },
    description() {
      const date = this.formattedDate
      return `Daily Invoice ${date}`
    },
    formattedDate() {
      return format.date(this.invoice.start)
    },
    formattedAmount() {
      return `$${format.usd(this.invoice.amount, 4)}`
    },
    isPaid() {
      return this.invoice.status === 'paid'
    },
    onHold() {
      return this.invoice.status === 'hold'
    },
    status() {
      return this.onHold ? 'Unpaid' : this.invoice.status
    },
    unholdTooltipText() {
      const topUpAmount = (this.invoice.amount - this.usdBalance) / this.balance.token.usdPerXe
      return `Please add ${(topUpAmount).toFixed(6)} XE to your wallet to pay`
    },
    usdBalance() {
      return this.balance.total.usd
    }
  },
  methods: {
    async downloadInvoice() {
      try {
        this.downloadError = false
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
        this.downloadError = true
      }
    },
    async unholdInvoice() {
      if (!this.onHold || !this.canPay) return
      this.unholdError = false
      try {
        await api.billing.unholdInvoice(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.invoice._key
        )
      }
      catch (error) {
        this.unholdError = true
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
