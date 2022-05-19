<template>
  <tr>
    <td class="tableBody__cell">
      <span class="tableData__header">IP</span>
      <span class="tableData__data">{{ ip }}</span>
    </td>
    <td class="tableBody__cell">
      <span class="tableData__header">Gateway</span>
      <span class="tableData__data relative">
        <span>{{ ip }}</span>
        <div
        class="text-xs capitalize lg:absolute lg:-bottom-4"
        :class="ip === 'aborted' || ip === 'failed' || ip === 'deferred' ? 'text-red' : 'text-green'"
        >
          {{ ip }}
        </div>
      </span>
    </td>
    <td class="tableBody__cell">
      <span class="tableData__header">Mask</span>
      <span class="tableData__data">{{ ip }}</span>
    </td>
    <td class="tableBody__cell">
      <span class="tableData__header">Domain</span>
      <span class="tableData__data">{{ ip }}</span>
    </td>
    <td class="tableBody__cell">
      <button
        :disabled="activeTask || server.network.ip.length === 1"
        class="deleteButton my-1"
        @click.prevent="deleteIP(ip)"
      >
        <div class="flex items-center">
          <div><TrashIcon class="deleteButton__icon" /></div>
          <span class="leading-none lg:hidden">Delete</span>
        </div>
      </button>
    </td>
  </tr>
</template>

<script>
import { TrashIcon } from '@heroicons/vue/outline'

export default {
  name: 'ServerNetworkItem',
  components: {
    TrashIcon
  },
  props: ['activeTask', 'deleteIP', 'ip', 'server'],
  watch: {
    activeTask(value) {
      if (value === null) {
        clearInterval(this.polling)
        this.polling = null
      }
    }
  }
}
</script>
<style scoped>
tr {
  @apply grid auto-rows-auto grid-cols-2 py-2 gap-x-2 gap-y-1;
}

.tableBody__cell {
  @apply text-xs flex flex-col text-gray-500 mb-1;
}

.tableData__header {
  @apply text-xs uppercase mb-1;
}

.tableData__data {
  @apply text-sm text-gray-900;
}

.deleteButton__icon {
  @apply w-3.5 h-3.5 mr-1;
}


@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm px-6 py-4 table-cell align-middle;
  }

  .tableData__header {
    @apply hidden;
  }

  .deleteButton {
    @apply text-gray-500 hover:text-red;
  }

  .deleteButton__icon {
    @apply w-5 h-5 mr-0;
  }
}

@media (max-width: 1023px) {
  .deleteButton {
    @apply w-1/2 button button--extraSmall button--error;
  }
}
</style>
