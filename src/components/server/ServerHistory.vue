<template>
  <div class="box">
    <h4>Server history</h4>
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <TableHeader
              header="Date"
              param="created"
              width="180"
              class="tableHead__cell sm:rounded-tl-lg"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Time"
              width="150"
              class="tableHead__cell"
            />
            <TableHeader
              header="Event"
              param="action"
              class="tableHead__cell"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
            <TableHeader
              header="Status"
              param="status"
              class="tableHead__cell"
              :sortQuery="sortQuery"
              @update-sort="updateSortQuery"
            />
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

import * as api from '@/account-utils'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import ServerHistoryItem from '@/components/server/ServerHistoryItem'
import TableHeader from '@/components/TableHeader'
import { mapState } from 'vuex'

export default {
  name: 'ServerHistory',
  components: {
    LoadingTableDataRow,
    Pagination,
    ServerHistoryItem,
    TableHeader
  },
  data() {
    return {
      limit: 10,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      iTasks: null,
      sortQuery: '',
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
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = [this.sortQuery, '-created', 'updated']

      const { results, metadata } = await api.servers.getTasks(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId,
        params
      )
      this.tasks = results
      this.metadata = metadata
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
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
    },
    sortQuery() {
      this.updateTasks()
    }
  }
}
</script>
<style scoped>
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
