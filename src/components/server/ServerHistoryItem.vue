<template>
  <tr>
    <td class="tableBody__cell">
      <div class="flex flex-row items-center">
        <div><CalendarIcon class="table__icon" /></div>
        <span>{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell">
      <div class="flex flex-row items-center">
        <div><ClockIcon class="table__icon" /></div>
        <span>{{ formattedTime }}</span>
      </div>
    </td>
    <td class="tableBody__cell row-start-1 col-span-3">
      <span class="capitalize task-action">{{ task.action }}</span>
    </td>
    <td class="tableBody__cell row-start-3 col-span-3">
      <span class="mr-2 lg:hidden">Status:</span>
      <div
        class="capitalize"
        :class="isStatusRed ? 'text-red' : 'text-green'"
      >
        <span>{{ task.status }}</span>
      </div>
    </td>
  </tr>
</template>

<script>
import moment from 'moment'
import { CalendarIcon, ClockIcon } from '@heroicons/vue/outline'

export default {
  name: 'ServerHistoryItem',
  components: {
    CalendarIcon,
    ClockIcon
  },
  props: ['task'],
  computed: {
    formattedAction() {
      return this.task.action.slice(0, 1).toUpperCase() + this.task.action.slice(1)
    },
    formattedDate() {
      return moment(this.task.created).format('LL')
    },
    formattedTime() {
      return moment(this.task.created).format('LTS')
    },
    isStatusRed() {
      return this.task.status === 'aborted' || this.task.status === 'failed' || this.task.status === 'deferred'
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
  @apply flex items-center text-gray-500;
}

.table__icon {
  @apply w-3.5 h-3.5 text-gray-500 mr-1 lg:hidden
}

.task-action {
  @apply text-md text-black
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm px-6 py-4 table-cell align-middle;
  }

  .task-action {
    @apply text-gray-500;
  }
}
</style>
