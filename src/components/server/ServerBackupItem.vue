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
      <span class="mr-2 lg:hidden">Status:</span>
      <span
        class="flex items-center capitalize text-gray-500"
        :class="isInactive ? 'text-red' : ''"
      >
        <span>{{ isActive ? 'Complete' : backup.status }}</span>
        <div><LoadingSpinner v-if=isCreating class="w-3.5 h-3.5 ml-1 text-gray" /></div>
      </span>
    </td>
    <td class="tableBody__cell actions">
      <div class="flex items-center w-full space-x-2 action_buttons">
        <button
          :disabled="disableActions"
          class="tableButton restore"
          @click.prevent="toggleRestoreConfirmationModal"
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
          :disabled="disableActions"
          class="tableButton button-error delete"
          @click.prevent="toggleDestroyConfirmationModal"
        >
          <div class="flex items-center">
            <div>
              <LoadingSpinner v-if=isDeleting class="tableButton__icon" />
              <TrashIcon v-else class="tableButton__icon" />
            </div>
            <span class="leading-none">Delete</span>
          </div>
        </button>
        <Tooltip v-if="httpError" :text="httpError" theme="error" position="left">
          <ExclamationIcon class="w-5 mt-1 text-red" />
        </Tooltip>
      </div>
    </td>
  </tr>
  <!-- destroy and restore confirmation modals -->
  <DestroyBackupConfirmation
    v-show=showDestroyConfirmationModal
    :backup=backup
    @modal-confirm=deleteBackup
    @modal-close=toggleDestroyConfirmationModal
  />
  <!-- eslint-disable-next-line vue/no-multiple-template-root-->
  <RestoreBackupConfirmation
    v-show=showRestoreConfirmationModal
    :backup=backup
    @modal-confirm=restoreBackup
    @modal-close=toggleRestoreConfirmationModal
  />
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import DestroyBackupConfirmation from '@/components/confirmations/DestroyBackupConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import RestoreBackupConfirmation from '@/components/confirmations/RestoreBackupConfirmation'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
import moment from 'moment'
import {
  CalendarIcon,
  ClockIcon,
  ExclamationIcon,
  RefreshIcon,
  TrashIcon
} from '@heroicons/vue/outline'

export default {
  name: 'ServerBackupItem',
  components: {
    CalendarIcon,
    ClockIcon,
    DestroyBackupConfirmation,
    ExclamationIcon,
    LoadingSpinner,
    RefreshIcon,
    RestoreBackupConfirmation,
    Tooltip,
    TrashIcon
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
      httpError: null,
      showDestroyConfirmationModal: false,
      showRestoreConfirmationModal: false
    }
  },
  computed: {
    ...mapState(['session']),
    backupId() {
      return this.backup._key
    },
    backupTasks() {
      return this.activeTasks.filter(task => task.data && task.data._key === this.backupId)
    },
    formattedDate() {
      return moment(this.backup.created).format('LL')
    },
    formattedTime() {
      return moment(this.backup.created).format('LTS')
    },
    isActive() {
      return this.backup.status === 'active'
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
    }
  },
  methods: {
    async deleteBackup() {
      this.httpError = null
      this.attemptingDestroy = true
      this.toggleDestroyConfirmationModal()
      try {
        const response = await utils.servers.deleteBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.backupId
        )
        this.$emit('update-backups')
        this.$store.commit('addTask', response.task)
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
        const response = await utils.servers.restoreBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.backupId
        )
        this.$emit('update-backups')
        this.$store.commit('addTask', response.task)
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
    @apply text-sm pl-6 py-4 table-cell align-middle w-full;
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
