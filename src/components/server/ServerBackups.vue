<template>
  <div class="flex flex-col space-y-5">
    <div class="box">
      <h4>Create backup</h4>
      <p class="mt-3 text-gray-500">A backup copy is a disk image of the virtual machine, which is used for recovery in case the original data are lost.</p>
      <div class="flex flex-col w-full p-4 mt-5 bg-gray-100 border border-gray-300 rounded-lg lg:p-6 lg:space-x-4 lg:items-end lg:flex-row">
        <div class="flex-1 w-full lg:w-auto input-group">
          <label class="label">Backup name</label>
          <input type="text" placeholder="Name your backup" value="test2_backup_01234" class="bg-transparent input input--floating" />
        </div>
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
    <div class="box">
      <h4>Existing backups</h4>
      <table class="min-w-full mt-4 divide-y divide-gray-200">
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
                  <div class="text-sm">
                    {{ item.name }}
                  </div>
                  <div class="text-xs text-green-100">
                    {{ item.status }}
                  </div>
                </div>
              </div>
            </td>
            <td class="tableBody__cell">
              <div class="flex items-center">
                <div class="">
                  <div class="text-sm">
                    {{ item.os.name }}
                  </div>
                  <div class="text-xs">
                    {{ item.os.size }}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<script>

export default {
  name: 'ServerBackups',
  components: {
  },
  // props: ['data'],
  data: function () {
    return {
      /*
      {
        date_create: '2022-01-25 05:00:36',
        id: 242,
        name: 'disk_resize',
        params: [Object],
        state: 'complete',
        task: 418,
        user: 'james@edge.network'
      }
      */
      backups: [
        {
          date: '25 Jan 2022',
          time: '15:44',
          name: 'test2_backup_1643085796962',
          os: {
            name: 'Ubuntu 20.04',
            size: '1.8 GB'
          },
          status: 'Ready to use'
        },
        {
          date: '25 Jan 2022',
          time: '15:44',
          name: 'test2_backup_1643085796962',
          os: {
            name: 'Ubuntu 20.04',
            size: '1.8 GB'
          },
          status: 'Ready to use'
        }
      ],
      // backups: this.data,
      isSaving: false,
      feedback: '',
      showFeedback: false
    }
  },
  watch: {
    $route(to, from) {
    }
  },
  methods: {
    async save () {
      this.isSaving = true
    }
  }
}
</script>
<style scoped>
  .box {
    @apply bg-white rounded-lg w-full overflow-auto p-6;
  }
  .tableHead {
    @apply border-gray-300 border-b rounded-lg w-full;
  }
  .tableHead__cell {
    @apply pr-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
  }
  .tableBody {
    @apply bg-white divide-y divide-gray-200;
  }
  .tableBody tr {
    /* @apply hover:bg-gray-50 transition duration-300; */
  }
  .tableBody__cell {
    @apply pr-6 py-4 text-gray-500;
  }
</style>
