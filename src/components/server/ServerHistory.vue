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
              Status
            </th>
            <th scope="col" class="tableHead__cell">
              User
            </th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <tr v-for="task in tasks" :key="task._key">
            <td class="tableBody__cell">
              <div class="flex items-center">
                <div class="whitespace-nowrap">
                  <div class="text-sm">
                    {{ formatDate(task.created) }}
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ formatTime(task.created) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="tableBody__cell">
              <div class="flex items-center">
                <div class="">
                  <div class="text-sm text-gray-900">
                    {{ formatAction(task.action) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="tableBody__cell">
              <div
                class="text-xs capitalize"
                :class="task.status === 'aborted' || task.status === 'failed' || task.status === 'deferred' ? 'text-red' : 'text-green'"
              >
                {{ task.status }}
              </div>
            </td>
            <td class="tableBody__cell">
              <span class="">TBC</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

      <!-- mobile table view -->
      <div class="flex flex-col w-full mt-4 border-t border-gray-200 divide-y divide-gray-200 lg:hidden">
        <div v-for="task in tasks" :key="task._key" class="flex flex-col items-start w-full py-3 space-y-2">
          <div class="flex items-center justify-between w-full">
            <div class="text-sm text-gray-900 truncate">
              {{ formatAction(task.action) }}
            </div>
          </div>
          <div class="flex items-center space-x-4 text-xs">
            <div class="flex items-center space-x-0.5">
              <CalendarIcon class="w-3.5 h-3.5 text-gray-500" />
              <span>{{ formatDate(task.created) }}</span>
            </div>
            <div class="flex items-center space-x-0.5">
              <ClockIcon class="w-3.5 h-3.5 text-gray-500" />
              <span>{{ formatTime(task.created) }}</span>
            </div>
            <div class="flex items-center space-x-0.5">
              <UserIcon class="w-3.5 h-3.5 text-gray-500" />
              <span>TBC</span>
            </div>
          </div>
          <div class="flex-shrink-0 text-xs text-green-100 opacity-75">
            <span class="text-gray-900">Status:</span> {{ task.status }}
          </div>
        </div>
      </div>

  </div>
</template>

<script>
import moment from 'moment'
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/vue/outline'

export default {
  name: 'ServerHistory',
  components: {
    CalendarIcon,
    ClockIcon,
    UserIcon
  },
  props: ['tasks'],
  methods: {
    formatAction(action) {
      return action.slice(0, 1).toUpperCase() + action.slice(1)
    },
    formatDate(timestamp) {
      return moment(timestamp).format('LL')
    },
    formatTime(timestamp) {
      return moment(timestamp).format('LTS')
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
