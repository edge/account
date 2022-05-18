<template>
  <div class="box">
    <h4>Server history</h4>
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <th scope="col" class="tableHead__cell" width="20%">
              Date
            </th>
            <th scope="col" class="tableHead__cell" width="20%">
              Time
            </th>
            <th scope="col" class="tableHead__cell">
              Event
            </th>
            <th scope="col" class="tableHead__cell">
              Status
            </th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <ServerHistoryItem
            v-for="task in tasks"
            :task="task"
            :key="task._key"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ServerHistoryItem from '@/components/server/ServerHistoryItem'
import moment from 'moment'

moment.locale('en-GB')

export default {
  name: 'ServerHistory',
  components: {
    ServerHistoryItem
  },
  props: ['tasks']
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
  @apply px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
}
.tableBody {
  @apply bg-white divide-y divide-gray-200;
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
