<template>
  <div class="box">
    <h4>Resize your server</h4>

    <p class="mt-3 text-gray-500">You are currently on the <b>XX plan for $XX per month</b>. Select an option below to resize your server.</p>
    
    <ResizeType @resize-type-changed="captureResizeType" />

    <div class="w-full h-px my-10 bg-gray-300" />
   
    <ServerSpecs :current=currentServerSpecs :resizeType=selectedResizeType :selectedSpecs=selectedResizeSpecs @specs-changed="captureResizeSpecs" />

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
import { getTask, resizeHost } from '../../utils/api'

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
      selectedResizeType: null,
      selectedResizeSpecs: null,
      showFeedback: false,
      showStatus: false
    }
  },
  computed: {
    currentServerSpecs() {
      return { cpu: this.server.cpu_number, ram: (this.server.ram_mib), ssd: this.server.disk.disk_mib }
    }
  },
  methods: {
    captureResizeType(data) {
      this.selectedResizeType = data
      this.selectedResizeSpecs = null
    },
    captureResizeSpecs(data) {
      this.selectedResizeSpecs = data
    },
    async save() {
      this.isSaving = true
      this.resize(this.server.id, this.server.disk.id)
    },
    async resize (id, diskId) {
      if (this.selectedResizeType.id === 1) {
        // CPU & RAM only.
        const response = await resizeHost(id, {
          diskId,
          cpuNumber: this.selectedResizeSpecs.cpu,
          memSize: this.selectedResizeSpecs.ram
        })
        
        console.log('response', response)
      } else {
        // CPU, RAM & SSD.
        const response = await resizeHost(id, {
          diskId,
          cpuNumber: this.selectedResizeSpecs.cpu,
          hddSize: this.selectedResizeSpecs.ssd,
          memSize: this.selectedResizeSpecs.ram
        })
        
        console.log('response', response)
      }
    }
  }
}
</script>
<style scoped>
  .box {
    @apply p-4 md:p-6 bg-white rounded-lg w-full;
  }
</style>
