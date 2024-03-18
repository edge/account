<script setup>
import * as format from '@/utils/format'
import { CalendarIcon } from '@heroicons/vue/outline'
import { computed, defineProps } from 'vue'

const props = defineProps(['entitlement'])

function formatDate(ts) {
  return format.date(ts)
}

function formatPercentage(pc) {
  return `${pc}%`
}

function formatUSD(usd) {
  return `$${format.usd(usd, 2)}`
}

const statusMap = {
  active: 'Active',
  consumed: 'Consumed',
  partConsumed: 'Part consumed',
  void: 'Void'
}

const displayType = computed(() => {
  if (props.entitlement.promo.config.type === 'credit') return 'Credit'
  else if (props.entitlement.promo.config.type === 'discount') return 'Discount'
  return '?'
})

const displayStatus = computed(() => statusMap[props.entitlement.status] || '?')

const value = computed(() => {
  if (props.entitlement.promo.config.type === 'credit') return formatUSD(props.entitlement.credit.remaining)
  else if (props.entitlement.promo.config.type === 'discount') {
    if (props.entitlement.promo.config.mode === 'fixed') return formatUSD(props.entitlement.promo.config.amount)
    else if (props.entitlement.promo.config.mode === 'percentage') return formatPercentage(props.entitlement.promo.config.amount)
  }
  return '?'
})
</script>

<template>
  <tr>
    <td class="tableBody__cell">
      <div class="flex flex-row justify-center lg:block truncate">
        <span class="mr-2 lg:hidden">Date:</span>
        <div><CalendarIcon class="table__icon mr-1 lg:hidden" /></div>
        <span class="truncate">{{ formatDate(entitlement.created) }}</span>
      </div>
    </td>
    <td class="tableBody__cell">
      {{ entitlement.code }}
    </td>
    <td class="tableBody__cell col-span-2">
      <span class="mr-2 lg:hidden">Description:</span>
      <span class="truncate">{{ entitlement.promo.name }}</span>
    </td>
    <td class="tableBody__cell">
      {{ displayType }}
    </td>
    <td class="tableBody__cell">
      {{ value }}
    </td>
    <td class="tableBody__cell status row-start-1 col-start-2">
      <span class="mr-2 lg:hidden">Status:</span>
      <div class="flex space-x-1 items-center">
        {{ displayStatus }}
      </div>
    </td>
    <td class="tableBody__cell">
      <span v-if="entitlement.expires">{{ formatDate(entitlement.expires) }}</span>
    </td>
  </tr>
</template>

<style scoped>
tr {
  @apply grid py-4 gap-x-2 gap-y-2;
  grid-template-columns: auto;
}

.tableBody__cell {
  @apply flex items-center text-gray-500 leading-4 truncate;
}

.tableBody__cell.status, .tableBody__cell.amount {
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
