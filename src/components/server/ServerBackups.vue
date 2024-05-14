<template>
  <div class="flex flex-col pb-20 space-y-4">
    <BackupStrategy :server="server" @update-server="updateServer" />
    <div class="box">
      <h4>Create a backup</h4>
      <p class="mt-3 text-gray-500">A backup is a disk image of your server, which can be used for recovery in case of data loss. You can create an instant backup at any time, whether or not automatic backups are enabled for this server.</p>
      <p class="mt-3 text-gray-500">Backups for this server will be retained for {{ backupRetentionWeeks }} week(s).</p>
      <div class="flex flex-col w-full mt-4 sm:space-x-4 sm:items-end sm:flex-row">
        <div class="flex-1 w-full sm:w-auto input-group">
          <label class="label">Backup name</label>
          <input
            type="text"
            v-model=comment
            placeholder="Add backup name here"
            class="bg-transparent input input--floating"
            @keypress.enter=createBackup
          />
        </div>
        <div class="sm:flex sm:justify-end">
          <button @click="createBackup"
            :disabled="!canCreate"
            class="mt-4 sm:mt-0 button button--success button--small w-full sm:max-w-xs"
          >
            <div v-if="isCreating" class="flex items-center">
              <span>Creating</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Create backup</span>
          </button>
        </div>
      </div>
      <HttpError :error=httpError class="mt-2" />
    </div>
    <ServerBackupUsage :region="region" :server="server" />
    <div class="box backups__table">
      <h4>Existing backups</h4>
      <!-- desktop table view -->
      <div class="mt-4 sm:border sm:border-gray-300 sm:rounded-lg">
        <table class="divide-y divide-gray-200">
          <thead class="hidden sm:table-header-group tableHead">
            <tr>
              <TableHeader
                header="Date"
                param="created"
                width="140"
                class="tableHead__cell sm:rounded-tl-lg"
                :sortQuery="sortQuery"
                @update-sort="updateSortQuery"
              />
              <TableHeader
                header="Time"
                width="70"
                class="tableHead__cell"
              />
              <TableHeader
                header="Name"
                param="comment"
                class="tableHead__cell"
                :sortQuery="sortQuery"
                @update-sort="updateSortQuery"
              />
              <TableHeader
                header="Size"
                param="size"
                width="140"
                class="tableHead__cell"
                :sortQuery="sortQuery"
                @update-sort="updateSortQuery"
              />
              <TableHeader
                header="Status"
                param="status"
                width="140"
                class="tableHead__cell"
                :sortQuery="sortQuery"
                @update-sort="updateSortQuery"
              />
              <TableHeader
                header=""
                width="50"
                class="tableHead__cell sm:rounded-tr-lg"
              />
            </tr>
          </thead>
          <tbody class="tableBody">
            <LoadingTableDataRow v-if="!backups" colspan="5"/>
            <tr v-else-if="!backups.length">
              <td colspan="5" class="tableBody__cell text-center text-gray-500">No backups</td>
            </tr>
            <ServerBackupItem
              v-else
              v-for="backup in backups"
              :activeTasks=activeTasks
              :attemptingAction=attemptingAction
              :backup=backup
              :disableActions=disableBackupActions
              :key="backup.name"
              :onAttemptAction=updateAttemptingAction
            />
          </tbody>
        </table>
      </div>
      <Pagination
        :border="true"
        :currentPage=currentPage
        :limit=limit
        :totalCount="metadata.totalCount"
        @change-page=changePage
      />
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import BackupStrategy from './BackupStrategy.vue'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import ServerBackupItem from '@/components/server/ServerBackupItem'
import ServerBackupUsage from '@/components/server/ServerBackupUsage'
import TableHeader from '@/components/TableHeader'
import useVuelidate from '@vuelidate/core'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ServerBackups',
  components: {
    BackupStrategy,
    HttpError,
    LoadingSpinner,
    LoadingTableDataRow,
    Pagination,
    ServerBackupItem,
    ServerBackupUsage,
    TableHeader
  },
  props: [
    'activeTasks',
    'disableActions',
    'region',
    'server'
  ],
  data: function () {
    return {
      attemptingAction: false,
      backups: null,
      comment: this.server.settings.name,
      httpError: null,
      iBackups: null,
      isCreating: false,
      isUpdating: false,
      limit: 10,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      sortQuery: ''
    }
  },
  validations() {
    return {
      comment: [validation.serverCommentLength]
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['config', 'session']),
    canCreate() {
      return !this.isCreating
        && !this.disableActions
        && !this.v$.comment.$invalid
        && !this.balanceSuspend
        && !this.balanceWarning
    },
    backupRetentionWeeks() {
      const week = 1000 * 60 * 60 * 24 * 7
      let retention = this.config.server && this.config.server.backups && this.config.server.backups.defaultRetention || week
      if (this.server.backups && this.server.backups.strategy && this.server.backups.strategy.retention) {
        retention = this.server.backups.strategy.retention
      }
      return retention / week
    },
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    },
    disableBackupActions() {
      return this.disableActions || this.attemptingAction
    },
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    clearAllErrors() {
      this.httpError = null
    },
    async createBackup() {
      this.isCreating = true
      try {
        this.httpError = null
        const { task } = await api.servers.createBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.comment
        )
        this.$store.commit('addTask', task)
        this.comment = ''
        this.isCreating = false
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.comment = ''
          this.isCreating = false
        }, 500)
      }
    },
    updateAttemptingAction(newState) {
      this.attemptingAction = newState
    },
    async updateBackups() {
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = [this.sortQuery, '-created']

      const { results, metadata } = await api.servers.getBackups(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId,
        params
      )
      this.backups = results
      this.metadata = metadata
      this.loadedBackups = true
    },
    updateServer() {
      this.$emit('update-server')
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
    }
  },
  mounted() {
    this.updateBackups()
    this.iBackups = setInterval(() => {
      this.updateBackups()
    }, 5000)
  },
  unmounted() {
    clearInterval(this.iBackups)
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    pageHistory() {
      this.updateBackups()
    },
    sortQuery() {
      this.updateBackups()
    }
  }
}
</script>

<style scoped>
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

  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }
  .tableHead__cell.status {
    @apply hidden
  }
}

@screen lg {
  .tableHead__cell.status {
    @apply table-cell
  }
}
</style>
