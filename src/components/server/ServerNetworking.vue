<template>
  <div class="box">
    <h4>Public Network</h4>
    <!-- <p>Anybody can access the VM via these public addresses.</p> -->
    <div class="hidden mt-4 mb-5 overflow-hidden border border-gray-300 rounded-lg lg:block">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="tableHead">
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
            <th scope="col" class="tableHead__cell">

            </th>
          </tr>
        </thead>
        <tbody class="tableBody">
          <tr v-for="item in server.ipv4" :key="item.id">
            <td class="tableBody__cell">
              <div class="flex items-center">
                <div class="whitespace-nowrap">
                  <div class="text-sm">
                    {{ item.ip_addr }}
                  </div>
                </div>
              </div>
            </td>
            <td class="tableBody__cell">
              <div class="flex items-center">
                <div class="">
                  <div class="text-sm">
                    {{ item.gateway }}
                  </div>
                  <div
                    class="text-xs capitalize"
                    :class="item.status === 'aborted' || item.status === 'failed' || item.status === 'deferred' ? 'text-red' : 'text-green'"
                  >
                    {{ item.state }}
                  </div>
                </div>
              </div>
            </td>
            <td class="tableBody__cell">
              <span class="">{{ item.mask }}</span>
            </td>
            <td class="tableBody__cell">
              <span class="">{{ item.domain }}</span>
            </td>
            <td class="tableBody__cell">
              <button
                :disabled="isSaving || activeTask || server.ipv4.length === 1"
                class="text-gray-500 hover:text-red"
                @click.prevent="() => removeIpAddress(item.id)">
                <TrashIcon class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- mobile table view -->
    <div class="flex flex-col w-full mt-4 mb-5 border-t border-b border-gray-200 divide-y divide-gray-200 lg:hidden">
      <div v-for="item in server.ipv4" :key="item.id" class="grid w-full grid-cols-2 py-3 text-sm gap-y-4 gap-x-2">
        <div class="flex flex-col space-y-0.5">
          <span class="text-xs tracking-wider text-gray-500 uppercase">IP</span>
          <span class="truncate">{{ item.ip_addr }}</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          <span class="text-xs tracking-wider text-gray-500 uppercase">Gateway</span>
          <span class="truncate">{{ item.gateway }}</span>
          <span
            class="text-xs capitalize"
            :class="item.status === 'aborted' || item.status === 'failed' || item.status === 'deferred' ? 'text-red' : 'text-green'"
          >
            {{ item.state }}
          </span>
        </div>
        <div class="flex flex-col space-y-0.5">
          <span class="text-xs tracking-wider text-gray-500 uppercase">Mask</span>
          <span class="truncate">{{ item.mask }}</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          <span class="text-xs tracking-wider text-gray-500 uppercase">Domain</span>
          <span class="truncate">{{ item.domain }}</span>
        </div>
        <button
          :disabled="isSaving || activeTask || server.ipv4.length === 1"
          class="w-1/2 button button--extraSmall button--error"
          @click.prevent="() => removeIpAddress(item.id)">
          <TrashIcon class="w-3.5 h-3.5 mr-1" />
          <span>Delete</span>
        </button>
      </div>
    </div>

    <button @click="save" :disabled="isSaving || activeTask" class="h-full mt-5 lg:mt-0 button button--success">
      <span v-if="isSaving">Adding</span>
      <span v-else-if="activeTask">{{activeTask.status}}</span>
      <span v-else>Add IP address</span>
      <span v-if="isSaving || activeTask">
        <LoadingSpinner />
      </span>
    </button>

  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { TrashIcon } from '@heroicons/vue/outline'
import { addIpAddress, removeIpAddress } from '../../utils/api'

export default {
  name: 'ServerNetworking',
  components: {
    LoadingSpinner,
    TrashIcon
  },
  props: ['activeTask', 'server'],
  data: function () {
    return {
      isSaving: false,
      polling: null
    }
  },
  methods: {
    async save() {
      this.isSaving = true

      await addIpAddress(this.server.serverId)

      this.polling = setInterval(() => {
        if (!this.activeTask) {
          this.isSaving = false
        }
      }, 5000)
    },
    async removeIpAddress(id) {
      this.isSaving = true

      await removeIpAddress(id)

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
  /*DL, DT, DD TAGS LIST DATA*/
  dl {
      margin-bottom:50px;
  }

  dl dt {
      background:#5f9be3;
      color:#fff;
      float:left;
      font-weight:bold;
      margin-right:10px;
      padding:5px;
  }

  dl dd {
      margin:2px 0;
      padding:5px 0;
  }
</style>
