<template>
  <div class="box">
    <h4>Usage</h4>
    <!-- eslint-disable-next-line max-len -->
    <p class="text-gray-500">Each server has a free quota of backup space equivalent to the server's disk size. You will be billed daily for backup usage above your free quota.</p>
    <!-- eslint-disable-next-line max-len -->
    <p class="text-gray-500">The estimated charge is based on current active backups being used over a 24 hour period.</p>
    <div class="mt-4 sm:border sm:border-gray-300 sm:rounded-lg">
      <table>
        <thead class="hidden sm:table-header-group tableHead">
          <tr class="hidden sm:table-header-group tableHead">
            <th class="tableHead__cell sm:rounded-tl-lg"><span>Used</span></th>
            <th class="tableHead__cell"><span>Disk</span></th>
            <th class="tableHead__cell"><span>Billable</span></th>
            <th class="tableHead__cell sm:rounded-tr-lg"><span>Estimated Charge</span></th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <tr>
            <td class="tableBody__cell">
              <span class="mr-2 sm:hidden">Used:</span>
              <span>{{ formattedUsage }}</span>
            </td>
            <td class="tableBody__cell">
              <span class="mr-2 sm:hidden">Disk:</span>
              <span>{{ formattedDisk }}</span>
            </td>
            <td class="tableBody__cell">
              <span class="mr-2 sm:hidden">Billable:</span>
              <span>{{ formattedBillable }}</span>
            </td>
            <td class="tableBody__cell">
              <span class="mr-2 sm:hidden">Estimated Charge:</span>
              <span>{{ estimatedCharge }} USD</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as format from '@/utils/format'
import { mapState } from 'vuex'

export default {
  name: 'ServerBackups',
  props: [
    'server'
  ],
  data: function () {
    return {
      totalBackupUsage: 0
    }
  },
  computed: {
    ...mapState(['session']),
    estimatedCharge() {
      return Math.max(this.totalBackupUsage - this.server.spec.disk, 0) * 10
    },
    formattedBillable() {
      return format.mib(Math.max(this.totalBackupUsage - this.server.spec.disk, 0))
    },
    formattedDisk() {
      return format.mib(this.server.spec.disk)
    },
    formattedUsage() {
      return format.mib(this.totalBackupUsage)
    },
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    async updateBackupsUsage() {
      const { usage } = await api.servers.getBackupsUsage(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      this.totalBackupUsage = usage
    }
  },
  mounted() {
    this.updateBackupsUsage()
    this.iBackups = setInterval(() => {
      this.updateBackupsUsage()
    }, 5000)
  },
  unmounted() {
    clearInterval(this.iBackups)
  }
}
</script>

<style scoped>
tbody tr {
  @apply grid py-2 gap-x-5 gap-y-1;
}

.box.backups__table {
  text-overflow: unset;
  overflow: unset;
}
.tableHead {
  @apply border-gray-300 border-b rounded-lg w-full bg-gray-50;
}
.tableHead__cell {
  @apply pl-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
}
.tableBody__cell {
  @apply flex items-center text-gray-500;
}
.tableBody {
  @apply bg-white divide-y divide-gray-200;
}

table {
  @apply table-fixed w-full;
}
table, tbody {
  @apply block;
}

@screen sm {
  table {
    @apply table;
    border-collapse: separate;
    border-spacing: 0;
  }

  tbody {
    @apply table-row-group;
  }

  tbody tr, thead tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full;
  }
  td:first-child {
    @apply rounded-bl-lg;
  }
  td:last-child {
    @apply rounded-br-lg;
  }
}

@media (max-width: 300px) {
  .tableBody__cell {
    @apply flex-col items-start;
  }
}

</style>
