<template>
  <div class="box">
    <h4>Resize your server</h4>
    <button class='bg-red-200 p-2 mr-2 mt-2 border border-gray-600' @click="resize1(server.id)">1 vCPU, 1GB RAM</button>
    <button class='bg-green-200 p-2 mr-2 mt-2 border border-gray-600' @click="resize2(server.id)">2 vCPU, 2GB RAM</button>
    <p class="mt-4 text-gray-500">You are currently on the <b>XX plan for $XX per month</b>. Select an option below to resize your server.</p>
    <ServerSpecs />
    <button @click="save" :disabled="isSaving" class="h-full mt-8 button button--success">
      <span v-if="isSaving">Saving</span>
      <span v-else>Save</span>
      <span v-if="isSaving">
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
import ServerSpecs from "@/components/deploy/ServerSpecs"
import { resizeHost } from '../../utils/api'

export default {
  name: 'ServerResize',
  props: ['server'],
  components: {
    ServerSpecs
  },
  data: function () {
    return {
      isSaving: false,
      feedback: '',
      showFeedback: false
    }
  },
  methods: {
    async save () {
      this.isSaving = true
    },
    resize1 (id) {
      resizeHost(id, { cpuNumber: 1, memSize: 1 * 1024 })
    },
    resize2 (id) {
      resizeHost(id, { cpuNumber: 2, memSize: 2 * 1024 })
    }
  }
}
</script>
<style scoped>
  .box {
    @apply p-6 bg-white rounded-lg w-full;
  }
</style>
