<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Create a backup</h4>
      <!-- eslint-disable-next-line max-len -->
      <p class="mt-3 text-gray-500">A backup copy is a disk image of the virtual machine, which is used for recovery in case the original data are lost.</p>
      <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
        <div class="flex-1 w-full lg:w-auto input-group">
          <label class="label">Backup comment</label>
          <input
            type="text"
            v-model=comment
            placeholder="Add backup comment here"
            class="bg-transparent input input--floating"
          />
        </div>
        <div class="relative">
          <button @click="createBackup"
            :disabled="isLoading"
            class="mt-5 lg:mt-0 button button--success"
          >
            <div v-if="isLoading" class="flex items-center">
              <span>Creating</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Create backup</span>
          </button>
        </div>
      </div>
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
                Status
              </th>
              <th scope="col" class="tableHead__cell" width="">
                Comment
              </th>
              <th scope="col" class="tableHead__cell actions" width="220"></th>
            </tr>
          </thead>
          <tbody class="tableBody">
            <ServerBackupItem
              v-for="backup in backups"
              :backup=backup
              :key="backup.name"
              @update-backups=updateBackups
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
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ServerBackupItem from '@/components/server/ServerBackupItem'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'ServerBackups',
  components: {
    LoadingSpinner,
    ServerBackupItem
  },
  props: ['server'],
  data: function () {
    return {
      comment: '',
      backups: this.server.backups,
      httpError: '',
      iBackups: [],
      isLoading: false
    }
  },
  validations() {
    return {
      comment: [validation.serverCommentLength]
    }
  },
  computed: {
    ...mapState(['session']),
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    async createBackup() {
      this.isLoading = true
      try {
        // this.toggleConfirmationModal()
        const response = await utils.servers.createBackup(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId,
          this.comment
        )
        this.updateBackups()
        this.$store.commit('addTask', response.task)
        this.comment = ''
        this.isLoading = false
      }
      catch (error) {
        console.error(error)
        setTimeout(() => {
          this.httpError = error
          this.comment = ''
          this.isLoading = false
        }, 500)
      }
    },
    async updateBackups() {
      const response = await utils.servers.getBackups(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      this.backups = response.results
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
