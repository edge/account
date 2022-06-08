<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Create a backup</h4>
      <!-- eslint-disable-next-line max-len -->
      <p class="mt-3 text-gray-500">A backup copy is a disk image of the virtual machine, which is used for recovery in case the original data are lost.</p>
      <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
        <div class="flex-1 w-full lg:w-auto input-group">
          <label class="label">Backup name</label>
          <input
            type="text"
            v-model=comment
            placeholder="Add backup name here"
            class="bg-transparent input input--floating"
          />
        </div>
        <div>
          <button @click="createBackup"
            :disabled="!canCreate"
            class="mt-5 lg:mt-0 button button--success"
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
    <div class="box">
      <h4>Existing backups</h4>
      <!-- desktop table view -->
      <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
        <table class="divide-y divide-gray-200">
          <thead class="hidden lg:table-header-group tableHead">
            <tr>
              <th scope="col" class="tableHead__cell" width="120">
                Date
              </th>
              <th scope="col" class="tableHead__cell" width="90">
                Time
              </th>
              <th scope="col" class="tableHead__cell" width="">
                Name
              </th>
              <th scope="col" class="tableHead__cell" width="">
                Status
              </th>
              <th scope="col" class="tableHead__cell actions" width="220"></th>
            </tr>
          </thead>
          <tbody class="tableBody">
            <LoadingTableDataRow v-if="isLoadingBackups" :colspan="5"/>
            <ServerBackupItem
              v-else
              v-for="backup in backups"
              :activeTasks=activeTasks
              :backup=backup
              :disableActions=disableActions
              :key="backup.name"
            />
          </tbody>
        </table>
      </div>


    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import * as validation from '../../utils/validation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import ServerBackupItem from '@/components/server/ServerBackupItem'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'ServerBackups',
  components: {
    HttpError,
    LoadingSpinner,
    LoadingTableDataRow,
    ServerBackupItem
  },
  props: [
    'activeTasks',
    'backups',
    'disableActions',
    'isLoadingBackups',
    'server'
  ],
  data: function () {
    return {
      comment: '',
      httpError: '',
      iBackups: [],
      isCreating: false,
      isUpdating: false
    }
  },
  validations() {
    return {
      comment: [validation.serverCommentLength]
    }
  },
  computed: {
    ...mapState(['session']),
    canCreate() {
      return !this.isCreating && !this.disableActions && !this.v$.comment.$invalid
    },
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    async createBackup() {
      this.isCreating = true
      try {
        this.httpError = ''
        // this.toggleConfirmationModal()
        const response = await utils.servers.createBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.comment
        )
        this.$emit('update-backups')
        this.$store.commit('addTask', response.task)
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
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
<style scoped>
.box {
  @apply rounded-lg bg-white w-full overflow-auto p-4 md:p-6;
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

@screen lg {
  table {
    @apply table;
  }

  tbody {
    @apply table-row-group;
  }

  tr {
    @apply table-row py-0;
  }
}
</style>
