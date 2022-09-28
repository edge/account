<template>
  <tr>
    <td class="tableBody__cell date" :title="formattedDate">
      <div class="flex flex-row items-center">
        <div><CalendarIcon class="table__icon" /></div>
        <span>{{ formattedDate }}</span>
      </div>
    </td>
    <td class="tableBody__cell time" :title="formattedTime">
      <div class="flex flex-row items-center">
        <div><ClockIcon class="table__icon" /></div>
        <span>{{ formattedTime }}</span>
      </div>
    </td>
    <td class="tableBody__cell comment" :title="backup.comment">
      <span class="backup-comment">{{ backup.comment }}</span>
    </td>
    <td class="tableBody__cell status" :title="backup.status">
      <span class="mr-2 sm:hidden">Status:</span>
      <span
        class="flex items-center capitalize text-gray-500"
        :class="isInactive ? 'text-red' : ''"
      >
        <span>{{ status }}</span>
        <div><LoadingSpinner v-if=isCreating class="w-3.5 h-3.5 ml-1 text-gray" /></div>
      </span>
    </td>
    <td class="tableBody__cell actions">
      <div class="w-full flex flex-col sm:flex-row sm:items-center">
        <div class="w-full sm:w-max relative">
          <BackupMenu
            @delete-backup=toggleDestroyConfirmationModal
            @restore-backup=toggleRestoreConfirmationModal
            :isDeleting=isDeleting
            :isRestoring=isRestoring
            :disableActions=disableActions
            :balanceSuspend=balanceSuspend
          />
        </div>
        <div class="hidden sm:block">
          <Tooltip v-if="httpError" :text="httpError" theme="error" position="left">
            <ExclamationIcon class="w-5 mt-1 text-red" />
          </Tooltip>
        </div>
        <div v-if="httpError" class="sm:hidden flex items-center text-red mt-1">
          <ExclamationIcon class="w-5" />
          <span>{{ httpError }}</span>
        </div>
      </div>
    </td>
  </tr>
  <!-- destroy and restore confirmation modals -->
  <DestroyBackupConfirmation
    v-if=showDestroyConfirmationModal
    :backup=backup
    @modal-confirm=deleteBackup
    @modal-close=toggleDestroyConfirmationModal
  />
  <!-- eslint-disable-next-line vue/no-multiple-template-root-->
  <RestoreBackupConfirmation
    v-if=showRestoreConfirmationModal
    :backup=backup
    @modal-confirm=restoreBackup
    @modal-close=toggleRestoreConfirmationModal
  />
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as api from '@/account-utils'
import BackupMenu from '@/components/server/BackupMenu'
import DestroyBackupConfirmation from '@/components/confirmations/DestroyBackupConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import RestoreBackupConfirmation from '@/components/confirmations/RestoreBackupConfirmation'
import Tooltip from '@/components/Tooltip'
import {
  CalendarIcon,
  ClockIcon,
  ExclamationIcon
} from '@heroicons/vue/outline'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ServerBackupItem',
  components: {
    BackupMenu,
    CalendarIcon,
    ClockIcon,
    DestroyBackupConfirmation,
    ExclamationIcon,
    LoadingSpinner,
    RestoreBackupConfirmation,
    Tooltip
  },
  props: [
    'activeTasks',
    'attemptingAction',
    'backup',
    'disableActions',
    'onAttemptAction'
  ],
  data: function () {
    return {
      attemptingDestroy: false,
      attemptingRestore: false,
      httpError: '',
      showDestroyConfirmationModal: false,
      showRestoreConfirmationModal: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['session']),
    backupId() {
      return this.backup._key
    },
    backupTasks() {
      return this.activeTasks.filter(task => task.data && task.data._key === this.backupId)
    },
    formattedDate() {
      return format.date(this.backup.created)
    },
    formattedTime() {
      return format.time(this.backup.created)
    },
    isCreating() {
      return this.backupTasks.some(task => task.action === 'createBackup') || this.backup.status === 'creating'
    },
    isDeleting() {
      // eslint-disable-next-line max-len
      return this.attemptingDestroy || this.backupTasks.some(task => task.action === 'deleteBackup') || this.backup.status === 'deleting'
    },
    isInactive() {
      return ['crashed', 'deleted', 'deleting'].includes(this.backup.status)
    },
    isRestoring() {
      return this.attemptingRestore || this.backupTasks.some(task => task.action === 'restoreBackup')
    },
    serverId() {
      return this.$route.params.id
    },
    status() {
      if (this.backup.status === 'active') return 'Complete'
      if (this.backup.status === 'in_use') return 'In Use'
      return this.backup.status
    }
  },
  methods: {
    async deleteBackup() {
      this.httpError = null
      this.attemptingDestroy = true
      this.toggleDestroyConfirmationModal()
      try {
        const { task } = await api.servers.deleteBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.backupId
        )
        this.$emit('update-backups')
        this.$store.commit('addTask', task)
        this.attemptingDestroy = false
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error.response.body.reason || error.response.body.message
          this.attemptingDestroy = false
        }, 500)
      }
    },
    async restoreBackup() {
      this.httpError = null
      this.attemptingRestore = true
      this.toggleRestoreConfirmationModal()
      try {
        const { task } = await api.servers.restoreBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.backupId
        )
        this.$emit('update-backups')
        this.$store.commit('addTask', task)
        this.attemptingRestore = false
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error.response.body.reason || error.response.body.message
          this.attemptingRestore = false
        }, 500)
      }
    },
    toggleDestroyConfirmationModal() {
      this.showDestroyConfirmationModal = !this.showDestroyConfirmationModal
    },
    toggleRestoreConfirmationModal() {
      this.showRestoreConfirmationModal = !this.showRestoreConfirmationModal
    }
  },
  watch: {
    attemptingAction(attempting) {
      if (attempting) this.httpError = null
    },
    attemptingDestroy(newValue) {
      this.onAttemptAction(newValue)
    },
    attemptingRestore(newValue) {
      this.onAttemptAction(newValue)
    }
  }
}
</script>
<style scoped>
tr {
  @apply grid grid-rows-4 py-2 gap-x-5 gap-y-1;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
}

.tableBody__cell {
  @apply flex items-center text-gray-500;
}
.tableBody__cell.comment {
  @apply row-start-1 col-span-3;
}
.tableBody__cell.status {
  @apply justify-self-end;
}
.tableBody__cell.date {
  @apply col-start-1;
}
.tableBody__cell.time {
  @apply col-start-2;
}
.tableBody__cell.actions {
  @apply col-span-3 sm:px-0;
}

.table__icon {
  @apply w-3.5 h-3.5 text-gray-500 mr-1 sm:hidden
}

.backup-comment {
  @apply text-md text-black;
}

.tableButton {
  @apply button button--extraSmall w-1/2 sm:w-24;
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
    @apply table-row py-0;
  }
  td:first-child {
    @apply rounded-bl-lg;
  }
  td:last-child {
    @apply rounded-br-lg;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full;
  }

  .backup-comment {
    @apply text-sm text-gray-500;
  }

  .tableButton__icon {
    @apply w-4 h-4 mr-1;
  }
}

@media (max-width: 550px) {
  tr {
    grid-template-rows: repeat(3, 1fr) auto;
  }
  .tableBody__cell.status {
    @apply row-start-3 col-span-3 justify-self-start;
  }
  .tableBody__cell.date {
    @apply col-start-1;
  }
  .tableBody__cell.time {
    @apply col-start-2;
  }
}

@media (max-width: 400px) {
  tr {
    @apply gap-y-3;
    grid-template-rows: repeat(4, 1fr) auto;
    grid-template-columns: 1fr;
  }
  .tableBody__cell.status {
    @apply row-start-4;
  }
  .tableBody__cell.time {
    @apply row-start-3 col-start-1;
  }
  .tableButton {
    @apply w-full;
  }
}
</style>
