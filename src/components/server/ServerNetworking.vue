<template>
  <div class="box">
    <h4>Public Network</h4>
    <!-- <p>Anybody can access the VM via these public addresses.</p> -->
    <div class="mt-4 mb-5 overflow-hidden border border-gray-300 rounded-lg">
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
                  <div class="text-sm text-gray-900">
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
                class="h-full mt-5 lg:mt-0 button button--success"
                @click.prevent="() => removeIpAddress(item.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button @click="save" :disabled="isSaving || activeTask" class="h-full mt-5 lg:mt-0 button button--success">
      <span v-if="isSaving || activeTask">Adding</span>
      <span v-else>Add IP address</span>
      <span v-if="isSaving || activeTask">
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
</template>

<script>
import { addIpAddress, removeIpAddress } from '../../utils/api'

export default {
  name: 'ServerNetworking',
  components: {
    
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

      const response = await addIpAddress(this.server.serverId)

      this.polling = setInterval(() => {
        if (!this.activeTask) {
          this.isSaving = false
        }
      }, 5000)
    },
    async removeIpAddress(id) {
      this.isSaving = true

      const response = await removeIpAddress(id)
      console.log('response', response)

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
