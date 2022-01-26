<template>
  <div class="box">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="tableHead">
        <tr>
          <th scope="col" class="tableHead__cell">
            Date
          </th>
          <th scope="col" class="tableHead__cell">
            Event
          </th>
          <th scope="col" class="tableHead__cell">
            User
          </th>
        </tr>
      </thead>
      <tbody class="tableBody">
        <tr v-for="item in this.historyData" :key="item.event">
          <td class="tableBody__cell">
            <div class="flex items-center">
              <div class="whitespace-nowrap">
                <div class="text-sm">
                  {{ item.date }}
                </div>
                <div class="text-xs">
                  {{ item.time }}
                </div>
              </div>
            </div>
          </td>
          <td class="tableBody__cell">
            <div class="flex items-center">
              <div class="">
                <div class="text-sm text-gray-900">
                  {{ item.event }}
                </div>
                <div class="text-xs text-green">
                  {{ item.status }}
                </div>
              </div>
            </div>
          </td>
          <td class="tableBody__cell">
            <span class="">{{ item.user }}</span>
          </td>
        </tr>

        <!-- More people... -->
      </tbody>
    </table>

  </div>
</template>

<script>
import ServerSpecs from "@/components/deploy/ServerSpecs"

export default {
  name: 'ServerResize',
  components: {
    ServerSpecs
  },
  setup() {
  },
  data: function () {
    return {
      isSaving: false,
      feedback: '',
      showFeedback: false,
      historyData: [
        {
          date: '25 Jan 2022',
          time: '16:00',
          event: 'Changed the disk size from 15GB to 16GB',
          status: 'Successfully',
          user: 'james@edge.network'
        },
        {
          date: '25 Jan 2022',
          time: '15:44',
          event: 'Created the backup copy test2_backup_1643085796962',
          status: 'Successfully',
          user: 'james@edge.network'
        },
        {
          date: '21 Jan 2022',
          time: '10:31',
          event: 'Created the VM , OS: Ubuntu 20.04, IP address: 185.167.216.64, main disk size 15GB, RAM1GB, vCPU 1',
          status: 'Successfully',
          user: 'james@edge.network'
        }
      ]
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
