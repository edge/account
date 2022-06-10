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
          <LoadingTableDataRow v-if="!tasks" colspan="5"/>
          <ServerHistoryItem
            v-else
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
/* global process */

import * as utils from '../../account-utils'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import ServerHistoryItem from '@/components/server/ServerHistoryItem'
import { mapState } from 'vuex'

export default {
  name: 'ServerHistory',
  components: {
    LoadingTableDataRow,
    ServerHistoryItem
  },
  data() {
    return {
      iTasks: null,
      tasks: null
    }
  },
  computed: {
    ...mapState(['session']),
    serverId() {
      return this.$route.params.id
    }
  },
  // props: ['tasks'],
  methods: {
    async updateTasks() {
      try {
        const tasks = await utils.servers.getTasks(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.serverId
        )
        this.tasks = tasks.results
      }
      catch (error) {
        console.error(error)
      }
    }
  },
  mounted() {
    this.updateTasks()
    this.iTasks = setInterval(() => {
      this.updateTasks()
    }, 5000)
  },
  unmounted() {
    clearInterval(this.iTasks)
    this.iTasks = null
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

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }
}
</style>
