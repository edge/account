<template>
  <div class="flex flex-col pb-20 space-y-4">
    <div class="box">
      <h4>Create a backup</h4>
      <!-- eslint-disable-next-line max-len -->
      <p class="mt-3 text-gray-500">A backup is a disk image of your server, which can be used for recovery in case of data loss.</p>
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
              <th scope="col" class="tableHead__cell sm:rounded-tl-lg" width="140">
                Date
              </th>
              <th scope="col" class="tableHead__cell" width="70">
                Time
              </th>
              <th scope="col" class="tableHead__cell" width="">
                Name
              </th>
              <th scope="col" class="tableHead__cell" width="">
                Size
              </th>
              <th scope="col" class="tableHead__cell status" width="">
                Status
              </th>
              <th scope="col" class="tableHead__cell actions sm:rounded-tr-lg" width="50"></th>
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
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import ServerBackupItem from '@/components/server/ServerBackupItem'
import ServerBackupUsage from '@/components/server/ServerBackupUsage'
import useVuelidate from '@vuelidate/core'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ServerBackups',
  components: {
    HttpError,
    LoadingSpinner,
    LoadingTableDataRow,
    Pagination,
    ServerBackupItem,
    ServerBackupUsage
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
      pageHistory: [1]
    }
  },
  validations() {
    return {
      comment: [validation.serverCommentLength]
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['session']),
    canCreate() {
      return !this.isCreating
        && !this.disableActions
        && !this.v$.comment.$invalid
        && !this.balanceSuspend
        && !this.balanceWarning
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
      const { results, metadata } = await api.servers.getBackups(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.backups = results
      this.metadata = metadata
      this.loadedBackups = true
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
