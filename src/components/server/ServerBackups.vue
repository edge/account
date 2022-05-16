<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Create a backup</h4>
      <!-- eslint-disable-next-line max-len -->
      <p class="mt-3 text-gray-500">A backup copy is a disk image of the virtual machine, which is used for recovery in case the original data are lost.</p>
      <!-- eslint-disable-next-line max-len -->
      <div class="flex flex-col w-full p-4 mt-5 bg-gray-100 border-gray-300 rounded-lg lg:p-5 lg:space-x-4 lg:items-end lg:flex-row">
        <div class="flex-1 w-full lg:w-auto input-group">
          <label class="label">Backup name</label>
          <input
            type="text"
            placeholder="Name your backup"
            :value=backupName
            class="bg-transparent input input--floating"
          />
        </div>
        <div class="relative">
          <button @click="save" :disabled="isSaving || activeTask" class="h-full mt-5 lg:mt-0 button button--success">
            <span v-if="isSaving">Creating</span>
            <span v-else-if="activeTask">{{activeTask.status}}</span>
            <span v-else>Create backup</span>
            <span v-if="isSaving || activeTask">
              <LoadingSpinner />
            </span>
          </button>
        </div>
      </div>
    </div>
    <div class="box">
      <h4>Existing backups</h4>

      <!-- desktop table view -->
      <div class="hidden mt-4 border border-gray-300 rounded-lg lg:block">
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
                  <BackupMenu
                    :activeTask=activeTask
                    :backup=item
                    @delete-backup="deleteBackup"
                    @restore-backup="restoreBackup"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- mobile table view -->
      <div class="flex flex-col w-full mt-4 border-t border-gray-200 divide-y divide-gray-200 lg:hidden">
        <div v-for="item in backups" :key="item.date" class="flex flex-col items-start w-full py-3 space-y-2">
          <div class="flex items-center justify-between w-full">
            <div class="pr-5 text-sm text-gray-900 truncate">
              {{ item.name }}
            </div>
            <div class="flex-shrink-0 text-xs text-green-100 opacity-75">
              {{ item.status }}
            </div>
          </div>
          <div class="flex items-center space-x-4 text-xs">
            <div class="flex items-center space-x-0.5">
              <CalendarIcon class="w-3.5 h-3.5 text-gray-500" />
              <span>{{ item.date }}</span>
            </div>
            <div class="flex items-center space-x-0.5">
              <ClockIcon class="w-3.5 h-3.5 text-gray-500" />
              <span>{{ item.time }}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <span>{{ item.os }}</span>
            <div class="block w-1 h-1 bg-gray-300 rounded-full" />
            <span>{{ item.size }}</span>
          </div>
          <button
            class="button button--extraSmall button--success"
            @click.prevent="() => restore(item)"
          >
          <span v-if="isSaving">Restoring</span>
            <span v-else-if="activeTask">{{activeTask.status}}</span>
            <span v-else>Restore</span>
            <span v-if="isSaving || activeTask">
              <LoadingSpinner />
            </span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import BackupMenu from '@/components/server/BackupMenu'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { CalendarIcon, ClockIcon } from '@heroicons/vue/outline'
import { createBackup, deleteBackup, restoreBackup } from '../../utils/api'

export default {
  name: 'ServerBackups',
  components: {
    BackupMenu,
    CalendarIcon,
    ClockIcon,
    LoadingSpinner
  },
  props: ['activeTask','server'],
  data: function () {
    return {
      backupName: `${this.server.settings.hostname}-${new Date().getTime()}`,
      backups: this.server.backups,
      isSaving: false,
      polling: null
    }
  },
  methods: {
    async deleteBackup(backup) {
      this.isSaving = true

      await deleteBackup(backup)

      this.polling = setInterval(() => {
        if (!this.activeTask) {
          this.isSaving = false
        }
      }, 5000)
    },
    async restoreBackup(backup) {
      this.isSaving = true

      await restoreBackup(this.server.serverId, backup)

      this.polling = setInterval(() => {
        if (!this.activeTask) {
          this.isSaving = false
        }
      }, 5000)
    },
    async save() {
      this.isSaving = true

      createBackup(this.server.serverId, { name: this.backupName, comment: '' })

      this.polling = setInterval(() => {
        if (!this.activeTask) {
          this.isSaving = false
        }
      }, 5000)
    }
  },
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
