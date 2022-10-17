<template>
  <div class="box">
    <h4>Public Network</h4>
    <!-- <p>Anybody can access the VM via these public addresses.</p> -->
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-300 border-b border-gray-300 lg:border-none">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <th scope="col" class="tableHead__cell">
              IP
            </th>
            <th scope="col" class="tableHead__cell">
              Gateway
            </th>
            <th scope="col" class="tableHead__cell">
              Mask
            </th>
            <th scope="col" class="tableHead__cell">
              Domain
            </th>
            <!-- delete icon column -->
            <th scope="col" class="tableHead__cell"></th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <ServerNetworkItem
            v-for="ip in server.network.ip"
            :key=ip
            :deleteIP=deleteIP
            :ip=ip
            :server=server
          />
        </tbody>
      </table>
    </div>

    <button @click="addIP" :disabled="isSaving || activeTask" class="h-full mt-4 button button--success">
      <span v-if="activeTask">{{ activeTask.status }}</span>
      <span v-else>Add IP address</span>
      <span v-if="activeTask" class="ml-2">
        <LoadingSpinner />
      </span>
    </button>

  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ServerNetworkItem from '@/components/server/ServerNetworkItem'

export default {
  name: 'ServerNetwork',
  components: {
    LoadingSpinner,
    ServerNetworkItem
  },
  props: ['activeTask', 'addIP', 'deleteIP', 'server'],
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
.tableHead {
  @apply border-gray-300 border-b rounded-lg w-full bg-gray-50;
}

.tableHead__cell {
  @apply px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
}

.tableBody {
  @apply bg-white divide-y divide-gray-300;
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
