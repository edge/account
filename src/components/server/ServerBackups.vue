<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Create a backup</h4>
      <p class="mt-3 text-gray-500">A backup copy is a disk image of the virtual machine, which is used for recovery in case the original data are lost.</p>
      <div class="flex flex-col w-full p-4 mt-5 bg-gray-100 border-gray-300 rounded-lg lg:p-5 lg:space-x-4 lg:items-end lg:flex-row">
        <div class="flex-1 w-full lg:w-auto input-group">
          <label class="label">Backup name</label>
          <input type="text" placeholder="Name your backup" :value=backupName class="bg-transparent input input--floating" />
        </div>
        <div class="relative">
          <button @click="save" :disabled="isSaving" class="h-full mt-5 lg:mt-0 button button--success">
            <span v-if="isSaving">Creating</span>
            <span v-else>Create backup</span>
            <span v-if="isSaving">
              <svg class="w-4 ml-2 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <line x1="12" y1="6" x2="12" y2="3" />
                <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
                <line x1="18" y1="12" x2="21" y2="12" />
                <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
                <line x1="12" y1="18" x2="12" y2="21" />
                <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
                <line x1="6" y1="12" x2="3" y2="12" />
                <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
    <div class="box">
      <h4>Existing backups</h4>
      <div class="mt-4 border border-gray-300 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="tableHead">
            <tr>
              <th scope="col" class="tableHead__cell">
                Creation Date
              </th>
              <th scope="col" class="tableHead__cell">
                Name
              </th>
              <th scope="col" class="tableHead__cell">
                OS
              </th>
              <th scope="col" class="pr-0 tableHead__cell">
                
              </th>
            </tr>
          </thead>
          <tbody class="tableBody">
            <tr v-for="item in backups" :key="item.date">
              <td class="tableBody__cell">
                <div class="flex items-center">
                  <div class="whitespace-nowrap">
                    <div class="text-sm">
                      {{ item.date }}
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ item.time }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="tableBody__cell">
                <div class="flex items-center">
                  <div class="">
                    <div class="text-sm text-gray-900">
                      {{ item.name }}
                    </div>
                    <div class="text-xs text-green-100 opacity-75">
                      {{ item.status }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="tableBody__cell">
                <div class="flex items-center">
                  <div class="">
                    <div class="text-sm">
                      {{ item.os }}
                    </div>
                    <div class="text-xs">
                      {{ item.size }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="pr-0 tableBody__cell">
                <div class="flex items-center justify-end">
                  <BackupMenu />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
import BackupMenu from "@/components/server/BackupMenu"
import { createBackup } from '../../utils/api'
import { mapMutations } from 'vuex'

export default {
  name: 'ServerBackups',
  components: {
    BackupMenu
  },
  props: ['server'],
  data: function () {
    return {
      backupName: `${this.server.name}-${new Date().getTime()}`,
      backups: this.server.backups,
      isSaving: false,
      feedback: '',
      showFeedback: false
    }
  },
  methods: {
    // ...mapMutations([
    //   'addTask'
    // ]),
    async save() {
      this.isSaving = true
      this.showStatus = true
      
      createBackup(this.server.id, { name: this.backupName, comment: 'x' })
    }
  },
  watch: {
    $route(to, from) {
    }
  }
}
</script>
<style scoped>
  .box {
    @apply bg-white rounded-lg w-full p-4 md:p-6;
  }
  .tableHead {
    @apply border-gray-300 bg-gray-50 border-b rounded-lg w-full;
  }
  .tableHead__cell {
    @apply px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
  }
  .tableBody {
    @apply bg-white divide-y divide-gray-200;
  }
  .tableBody tr {
    /* @apply hover:bg-gray-50 transition duration-300; */
  }
  .tableBody__cell {
    @apply px-6 py-4 text-gray-500;
  }
</style>
