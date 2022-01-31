<template>
  <div class="box">
    <h4>Resize your server</h4>
    <!-- <button class='p-2 mt-2 mr-2 bg-red-200 border border-gray-600' @click="resize1(server.id)">1 vCPU, 1GB RAM</button>
    <button class='p-2 mt-2 mr-2 bg-green-200 border border-gray-600' @click="resize2(server.id)">2 vCPU, 2GB RAM</button> -->
    <p class="mt-4 text-gray-500">You are currently on the <b>XX plan for $XX per month</b>. Select an option below to resize your server.</p>
    <ResizeType />
    <span class="block mt-4 text-red">
      <span class="font-medium">Note:</span> Because your server's filesystem will be expanded, this resize is not reversible.</span>
    <div class="w-full h-px my-10 bg-gray-300" />
    <ServerSpecs />
    <div class="relative mt-8">
      <button @click="save" :disabled="isSaving" class="h-full button button--success">
        <span v-if="isSaving">Resizing</span>
        <span v-else>Resize</span>
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
  </div>
</template>

<script>
import ServerSpecs from "@/components/deploy/ServerSpecs"
import ResizeType from "@/components/server/ResizeType"
import { resizeHost } from '../../utils/api'

export default {
  name: 'ServerResize',
  props: ['server'],
  components: {
    ResizeType,
    ServerSpecs
  },
  data: function () {
    return {
      isSaving: false,
      feedback: '',
      showFeedback: false,
      showStatus: false
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
