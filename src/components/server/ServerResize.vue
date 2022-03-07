<template>
  <div class="box">
    <h4>Resize your server</h4>

    <p class="mt-3 text-gray-500">You are currently on the <b>XX plan for $XX per month</b>. Select an option below to resize your server.</p>
    
    <ResizeType :resizeTypes="resizeTypes" @resize-type-changed="captureResizeType" />

    <div class="w-full h-px my-10 bg-gray-300" />
    
    <ServerSpecs
      :currentCost=currentCost
      :calculatedCost=newCost
      :current=currentServerSpecs
      :resizeType=selectedResizeType
      :selectedSpecs=selectedResizeSpecs
      @specs-changed="captureResizeSpecs"
    />

    <div class="relative mt-8">
      <button @click="save" :disabled="isSaving || !selectedResizeSpecs || activeTask" class="h-full button button--success">
        <span v-if="isSaving || activeTask">Resizing</span>
        <span v-else>Resize</span>
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
  </div>
</template>

<script>
import ServerSpecs from "@/components/deploy/ServerSpecs"
import ResizeType from "@/components/server/ResizeType"
import { resizeHost } from '../../utils/api'

export default {
  name: 'ServerResize',
  props: ['activeTask','server'],
  components: {
    ResizeType,
    ServerSpecs
  },
  data: function () {
    return {
      currentCost: 0,
      feedback: '',
      isSaving: false,
      newCost: 0,
      polling: null,
      resizeTypes: [
        {
          id: 1,
          title: 'CPU and  RAM only',
          description: 'This will only increase or decrease the CPU and RAM of your server, not disk size. This can be reversed.',
          enabled: true
        },
        {
          id: 2,
          title: 'Disk, CPU and RAM',
          description: 'This will increase the disk size, CPU and RAM of your server. This is a permanent change and cannot be reversed.',
          enabled: true
        }
      ],
      selectedResizeType: null,
      selectedResizeSpecs: {},
      showFeedback: false,
      showStatus: false
    }
  },
  computed: {
    currentServerSpecs() {
      return { cpu: this.server.cpu_number, ram: this.server.ram_mib / 1024, ssd: this.server.disk_mib / 1024 }
    }
  },
  mounted() {
    this.selectedResizeType = this.resizeTypes[0]

    console.log('this.currentServerSpecs', this.currentServerSpecs)
    this.calculateCosts()
  },
  methods: {
    calculateCosts() {
      const { ramCostPerGb, ssdCostPerGb, cpuCostPer } = this.server.region
      
      this.currentCost = 
        (ramCostPerGb * this.currentServerSpecs.ram) +
        (ssdCostPerGb * this.currentServerSpecs.ssd) +
        (cpuCostPer * this.currentServerSpecs.cpu)
      
      this.newCost = 
        (ramCostPerGb * this.selectedResizeSpecs.ram / 1024) +
        (ssdCostPerGb * this.selectedResizeSpecs.ssd / 1024) +
        (cpuCostPer * this.selectedResizeSpecs.cpu)
    },
    captureResizeType(data) {
      console.log('data', data)
      this.selectedResizeType = data
      // this.selectedResizeSpecs = null
      console.log('this.selectedResizeType', this.selectedResizeType)
    },
    captureResizeSpecs(data) {
      console.log('data', data)
      this.selectedResizeSpecs[data.spec] = data.value

      console.log('this.selectedResizeSpecs', this.selectedResizeSpecs)
      this.calculateCosts()
    },
    async save() {
      this.isSaving = true
      await this.resize()
      
      this.polling = setInterval(() => {
        if (!this.activeTask) {
          this.isSaving = false
        }
      }, 5000)
    },
    async resize () {
      // Defaults for CPU & RAM only.
      const resizeOptions = {
        diskId: this.server.disk_id,
        cpuNumber: this.selectedResizeSpecs.cpu,
        memSize: this.selectedResizeSpecs.ram
      } 

      // Additional parameter for HDD resize.
      if (this.selectedResizeSpecs.ssd > this.currentServerSpecs.ssd) {
        resizeOptions.hddSize = this.selectedResizeSpecs.ssd
      }

      console.log('resizeOptions', resizeOptions)

      console.log('this.selectedResizeSpecs', this.selectedResizeSpecs)
      console.log('this.currentServerSpecs', this.currentServerSpecs)
      // console.log('this.selectedResizeType', this.selectedResizeType)
      const response = await resizeHost(this.server.serverId, resizeOptions)
      console.log('response', response)
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
    @apply p-4 md:p-6 bg-white rounded-lg w-full;
  }
</style>
