<template>
  <div class="box">
    <h4>Server history</h4>
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <th scope="col" class="tableHead__cell" width="180">
              Date
            </th>
            <th scope="col" class="tableHead__cell" width="150">
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
    <Pagination
      :border="true"
      :currentPage=currentPage
      :limit=limit
      :totalCount="metadata.totalCount"
      @change-page=changePage
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import ServerHistoryItem from '@/components/server/ServerHistoryItem'
import { mapState } from 'vuex'

export default {
  name: 'ServerHistory',
  components: {
    LoadingTableDataRow,
    Pagination,
    ServerHistoryItem
  },
  data() {
    return {
      limit: 10,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      iTasks: null,
      tasks: null
    }
  },
  computed: {
    ...mapState(['session']),
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    },
    serverId() {
      return this.$route.params.id
    }
  },
  // props: ['tasks'],
  methods: {
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    async updateTasks() {
      const tasks = await utils.servers.getTasks(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.tasks = tasks.results
      this.metadata = tasks.metadata
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
  },
  watch: {
    pageHistory() {
      this.updateTasks()
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
