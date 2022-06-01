<template>
  <tr>
    <td class="tableBody__cell date">
      <div class="flex flex-row items-center">
        <div><CalendarIcon class="table__icon" /></div>
        <span>{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell time">
      <div class="flex flex-row items-center">
        <div><ClockIcon class="table__icon" /></div>
        <span>{{ formattedTime }}</span>
      </div>
    </td>
    <td class="tableBody__cell status">
      <span class="mr-2 lg:hidden">Status:</span>
      <div
        class="capitalize text-gray-500"
        :class="[
          isInactive ? 'text-red' : '',
          isActive ? 'text-green' : ''
        ]"
      >
        <span>{{ backup.status }}</span>
      </div>
    </td>
    <td class="tableBody__cell comment" :title="backup.comment">
      <span class="backup-comment">{{ backup.comment }}</span>
    </td>
    <td class="tableBody__cell actions">
      <div class="flex items-center w-full space-x-2 action_buttons">
        <button
          :disabled="isActionDisabled"
          class="tableButton restore"
          @click.prevent="restoreBackup"
        >
          <div class="flex items-center">
            <div>
              <LoadingSpinner v-if=isRestoring class="tableButton__icon" />
              <RefreshIcon v-else class="tableButton__icon" />
            </div>
            <span class="leading-none">Restore</span>
          </div>
        </button>
        <button
          :disabled="isActionDisabled"
          class="tableButton button-error delete"
          @click.prevent="deleteBackup"
        >
          <div class="flex items-center">
            <div>
              <LoadingSpinner v-if=isDeleting class="tableButton__icon" />
              <TrashIcon v-else class="tableButton__icon" />
            </div>
            <span class="leading-none">Delete</span>
          </div>
        </button>
      </div>
    </td>
  </tr>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import moment from 'moment'
import { CalendarIcon, ClockIcon, RefreshIcon, TrashIcon } from '@heroicons/vue/outline'

export default {
  name: 'ServerBackupItem',
  components: {
    CalendarIcon,
    ClockIcon,
    LoadingSpinner,
    RefreshIcon,
    TrashIcon
  },
  props: ['backup'],
  data: function () {
    return {
      httpError: '',
      isLoading: false
    }
  },
  computed: {
    ...mapState(['session', 'tasks']),
    backupId() {
      return this.backup._key
    },
    creationDate() {
      const dateStr = this.backup.name.split('-').slice(-3).join('-')
      return dateStr
    },
    formattedDate() {
      return moment(this.creationDate).format('LL')
    },
    formattedTime() {
      return moment(this.creationDate).format('LTS')
    },
    isActionDisabled() {
      return !this.isActive || this.isRestoring || this.isDeleting
    },
    isActive() {
      return this.backup.status === 'active'
    },
    isDeleting() {
      return this.backup.status === 'deleting'
    },
    isInactive() {
      return ['crashed', 'deleted', 'deleting'].includes(this.backup.status)
    },
    isRestoring() {
      return false
    },
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    async deleteBackup() {
      this.isLoading = true
      try {
        const response = await utils.servers.deleteBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.backup._key
        )
        this.$emit('update-backups')
        this.$store.commit('addTask', response.task)
        this.isLoading = false
      }
      catch (error) {
        console.error(error.response.body)
        this.isLoading = false
      }
    },
    async restoreBackup() {
      this.isLoading = true
      try {
        const response = await utils.servers.restoreBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.backup._key
        )
        this.$emit('update-backups')
        this.$store.commit('addTask', response.task)
        this.isLoading = false
      }
      catch (error) {
        console.error(error.response.body)
        this.isLoading = false
      }
    }
  }
}
</script>
<style scoped>
tr {
  @apply grid grid-rows-4 py-2 gap-x-5 gap-y-1;
  grid-template-columns: auto auto 1fr;
}

.tableBody__cell {
  @apply flex items-center text-gray-500;
}
.tableBody__cell.comment {
  @apply row-start-1 col-span-3;
}
.tableBody__cell.status {
  @apply row-start-2 col-span-3 sm:col-start-3 sm:col-span-1;
}
.tableBody__cell.date {
  @apply sm:row-start-2;
}
.tableBody__cell.time {
  @apply sm:row-start-2 col-start-2;
}
.tableBody__cell.actions {
  @apply col-span-3 lg:px-0;
}

.table__icon {
  @apply w-3.5 h-3.5 text-gray-500 mr-1 lg:hidden
}

.backup-comment {
  @apply text-md text-black;
}

.tableButton {
  @apply button button--extraSmall w-1/2 lg:w-24;
}

.tableButton.restore {
  @apply button--success
}

.tableButton.delete {
 @apply button--error
}

.tableButton__icon {
  @apply w-3.5 h-3.5 mr-1;
}

@screen sm {
  tr {
  @apply grid-rows-3;
}
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm px-6 py-4 table-cell align-middle w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }

  .backup-comment {
    @apply text-gray-500;
  }

  .action_buttons {
    @apply space-x-2
  }

  .tableButton__icon {
    @apply w-4 h-4 mr-1;
  }
}

@media (max-width: 400px) {
  tr {
    @apply gap-y-3;
    grid-template-rows: repeat(4, 1fr) auto;
  }

  .tableBody__cell.time {
    @apply row-start-4 col-start-1;
  }

  .action_buttons {
    @apply flex-col space-x-0 space-y-2 items-start;
  }
  .tableButton {
    @apply w-full;
  }
}
</style>
