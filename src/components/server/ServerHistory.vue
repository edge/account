<template>
  <div class="box">
    <h4>Server history</h4>
    <div class="hidden mt-4 overflow-hidden border border-gray-300 rounded-lg lg:block">
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
          <tr v-for="item in history" :key="item.event">
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
                    {{ item.event }}
                  </div>
                  <div
                    class="text-xs capitalize"
                    :class="item.status === 'aborted' || item.status === 'failed' || item.status === 'deferred' ? 'text-red' : 'text-green'"
                  >
                    {{ item.status }}
                  </div>
                </div>
              </div>
            </td>
            <td class="tableBody__cell">
              <span class="">{{ item.user }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

      <!-- mobile table view -->
      <div class="flex flex-col w-full mt-4 border-t border-gray-200 divide-y divide-gray-200 lg:hidden">
        <div v-for="item in history" :key="item.event" class="flex flex-col items-start w-full py-3 space-y-2">
          <div class="flex items-center justify-between w-full">
            <div class="text-sm text-gray-900 truncate">
              {{ item.event }}
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
            <div class="flex items-center space-x-0.5">
              <UserIcon class="w-3.5 h-3.5 text-gray-500" />
              <span>{{ item.user }}</span>
            </div>
          </div>
          <div class="flex-shrink-0 text-xs text-green-100 opacity-75">
            <span class="text-gray-900">Status:</span> {{ item.status }}
          </div>
        </div>
      </div>

  </div>
</template>

<script>
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/vue/outline'

export default {
  name: 'ServerResize',
  components: {
    CalendarIcon,
    ClockIcon,
    UserIcon
  },
  props: ['data'],
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
        user: ''
      }
      */
      history: this.data,
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
    @apply bg-white rounded-lg w-full overflow-auto p-4 md:p-6;
  }
  .tableHead {
    @apply border-gray-300 border-b rounded-lg w-full bg-gray-50;
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
