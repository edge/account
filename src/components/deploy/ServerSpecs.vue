<template>
  <div>
    <div class="specs__grid">
      <div class="box">
        <span class="box__title">vCPU</span>
        <vue-slider
          v-model="cpuValue"
          dotSize=20
          width="100%"
          contained=true
          :min=1
          :max=16
          :minStart="3"
          :marks="{
            '1': '1',
            '4': '4',
            '8': '8',
            '12': '12',
            '16': '16'
          }"
          adsorb
          tooltip="always"
          :tooltip-formatter="'{value} vCPU'"
          tooltipPlacement="top"
          :tooltip-style="styles.tooltip"
          :process-style="styles.process"
          :dot-style="styles.dots"
          :label-style="styles.labels"
          :step-active-style="styles.activeStep"
        />
      </div>
      <div class="box">
        <span class="box__title">RAM (GB)</span>
        <vue-slider
          v-model="ramValue"
          :vData="ramOptions"
          ref="ramSlider"
          :marks="true"
          dotSize=20
          adsorb
          width="100%"
          contained=true
          :min=0.5
          :max=16
          tooltip="always"
          :tooltip-formatter="formatSliderRAM"
          tooltipPlacement="top"
          :tooltip-style="styles.tooltip"
          :process-style="styles.process"
          :dot-style="styles.dots"
          :label-style="styles.labels"
          :step-active-style="styles.activeStep"
        />
      </div>
      <div class="box">
        <span class="box__title">Disk (GB)</span>
        <vue-slider
          v-model="storageValue"
          ref="ssdSlider"
          dotSize=20
          width="100%"
          contained=true
          :min=10
          :max=512
          :vData="ssdOptions"
          :marks="true"
          adsorb
          tooltip="always"
          :tooltip-formatter="'{value} GB'"
          tooltipPlacement="top"
          :tooltip-style="styles.tooltip"
          :process-style="styles.process"
          :dot-style="styles.dots"
          :label-style="styles.labels"
          :step-active-style="styles.activeStep"
        />
      </div>
    </div>
    <!-- disk size change warning -->
    <span v-show="diskValueIncreased || diskValueDecreased" class="block mt-4 text-red">
      <span class="font-medium">Note: </span>
      <!-- eslint-disable-next-line max-len -->
      <span v-if=diskValueIncreased>Your server's filesystem will be expanded. This disk resize is not reversible.</span>
      <span v-else>Disk size cannot be decreased in size.
        <span class="underline cursor-pointer" @click="resetDiskMinimum">Reset</span>
      </span>
    </span>

    <!-- selected results shown on resize screen -->
    <!-- uses two rows to show current vs new specs and cost -->
    <div v-if="this.current" class="mt-5">
      <!-- eslint-disable-next-line max-len -->
      <div class="flex flex-col space-y-4 items-baseline justify-between w-full p-5 mt-8 border-t border-gray-300 lg:flex-row">
        <div class="flex flex-col items-baseline">
          <span class="text-green">Current Server</span>
          <div class="specs_and_cost flex">
            <span class="text-lg flex-shrink-0">{{ current.spec.cpus }} vCPU</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(current.spec.ram) }} RAM</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(current.spec.disk) }} Disk</span>
          </div>
        </div>
        <div class="flex flex-col items-baseline">
          <span class="text-green">Estimated Cost</span>
          <div class="specs_and_cost flex">
            <span><span class="text-lg flex-shrink-0">${{ currentHourlyCostFormatted }}</span> per hour</span>
            <span class="dot" />
            <span><span class="text-lg flex-shrink-0">${{ currentDailyCostFormatted }}</span> per day</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col space-y-4 items-baseline justify-between w-full p-5 rounded-md bg-gray-50 lg:flex-row">
        <div class="flex flex-col items-baseline">
          <span class="text-green">After Resize</span>
          <div class="specs_and_cost flex">
            <span class="text-lg flex-shrink-0">{{ cpuValue }} vCPU</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(spec.ram) }} RAM</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(spec.disk) }} Disk</span>
          </div>
        </div>
        <div class="flex flex-col items-baseline">
          <span class="text-green">Estimated Cost</span>
          <div class="specs_and_cost flex">
            <span><span class="text-lg flex-shrink-0">${{ hourlyCostFormatted }}</span> per hour</span>
            <span class="dot" />
            <span><span class="text-lg flex-shrink-0">${{ dailyCostFormatted }}</span> per day</span>
          </div>
        </div>
      </div>
    </div>

    <!-- selected results shown on deploy screen -->
    <!-- eslint-disable-next-line max-len -->
    <div v-else class="flex flex-col items-baseline justify-between w-full mt-8 space-y-5 border-t border-gray-300 lg:space-y-0 lg:flex-row pt-7">
      <div class="flex flex-col items-baseline">
        <span class="text-green">Your server</span>
        <div class="specs_and_cost flex">
          <span class="text-lg flex-shrink-0">{{ cpuValue }} vCPU</span>
          <span class="dot" />
          <span class="text-lg flex-shrink-0">{{ formatMiB(spec.ram) }} RAM</span>
          <span class="dot" />
          <span class="text-lg flex-shrink-0">{{ formatMiB(spec.disk) }} Disk</span>
        </div>
      </div>
      <div class="flex flex-col items-baseline">
        <span class="text-green">Estimated Cost</span>
        <div class="specs_and_cost flex">
          <span><span class="text-lg flex-shrink-0">${{ hourlyCostFormatted }}</span> per hour</span>
          <span class="dot" />
          <span><span class="text-lg flex-shrink-0">${{ dailyCostFormatted }}</span> per day</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-slider-component/theme/antd.css'
import VueSlider from 'vue-slider-component'

export default {
  name: 'ServerSpecs',
  props: [
    'hourlyCost',
    'currentHourlyCost',
    'current',
    'selectedSpecs'
  ],
  components: {
    VueSlider
  },
  data() {
    return {
      cpuValue: null,
      ramValue: null,
      storageValue: null,
      ramOptions: [
        { value:'0.5', label:'512MB' },
        { value:'1', label:'1GB' },
        { value:'2', label:'2GB' },
        { value:'4', label:'4GB' },
        { value:'6', label:'6GB' },
        { value:'8', label:'8GB' },
        { value:'16', label:'16GB' }
      ],
      ssdOptions: [
        { value:'10', label:'10GB' },
        { value:'16', label:'16GB' },
        { value:'32', label:'32GB' },
        { value:'64', label:'64GB' },
        { value:'128', label:'128GB' },
        { value:'256', label:'256GB' },
        { value:'512', label:'512GB' }
      ],
      styles: {
        activeStep: { background: '#fff', opacity: '1', border: 'none', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' },
        dots: { background: '#4ecd5f', boxShadow: '0 0 2px 1px #eee', border: 'none' },
        labels: { color: '#999', fontSize: '12px' },
        process: { background: '#4ecd5f' },
        tooltip: { background: '#4ecd5f', borderColor: '#4ecd5f' }
      }
    }
  },
  computed: {
    currentHourlyCostFormatted() {
      return this.formatCost(this.currentHourlyCost, 4)
    },
    currentDailyCostFormatted() {
      return this.formatCost(this.currentHourlyCost * 24, 2)
    },
    diskValueDecreased() {
      if (this.current) return this.spec.disk < this.current.spec.disk
      return false
    },
    diskValueIncreased() {
      if (this.current) return this.spec.disk > this.current.spec.disk
      return false
    },
    hourlyCostFormatted() {
      return this.formatCost(this.hourlyCost, 4)
    },
    dailyCostFormatted() {
      return this.formatCost(this.hourlyCost * 24, 2)
    },
    spec() {
      return {
        bandwidth: 10,
        cpus: this.cpuValue,
        disk: this.storageValue * 1024,
        ram: this.ramValue * 1024
      }
    }
  },
  methods: {
    formatCost(cost, decimalPlaces) {
      const mult = 10**decimalPlaces
      return (Math.round(cost * mult) / mult).toFixed(decimalPlaces)
    },
    formatMiB(MiB) {
      if (MiB < 1024) {
        return `${MiB} MB`
      }
      return `${MiB / 1024} GB`
    },
    formatSliderRAM(sliderRAM) {
      if (sliderRAM < 1) return `${sliderRAM * 1024} MB`
      else return `${sliderRAM} GB`
    },
    resetDiskMinimum() {
      if (!this.current) return
      if (this.storageValue * 1024 < this.current.spec.disk) {
        this.storageValue = (this.current.spec.disk / 1024).toString()
      }
    }
  },
  mounted() {
    this.cpuValue = this.current ? this.current.spec.cpus : 1
    this.ramValue = this.current ? (this.current.spec.ram / 1024).toString() : 0.5
    this.storageValue = this.current ? (this.current.spec.disk / 1024).toString() : 10
  },
  watch: {
    spec() {
      this.$emit('specs-changed', this.spec)
    }
  }
}
</script>

<style scoped>
.specs__grid {
  @apply mt-10 w-full grid grid-cols-1 gap-x-4 gap-y-10;
  @apply sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.specs_and_cost {
  @apply flex items-center space-x-2.5;
}
.dot {
  @apply w-1 h-1 bg-gray-400 rounded-full
}

/* radio option */
.box {
  @apply relative flex space-x-3 items-start justify-center pr-5 pl-2 pt-14 pb-8 border border-gray-300 rounded-md;
}

.box__title {
  @apply absolute top-0 inline-block px-3 text-gray-500 transform -translate-y-1/2 bg-white;
}

@media (max-width: 420px) {
  .specs_and_cost {
    @apply flex-col items-start space-x-0 space-y-2
  }
  .dot {
    @apply hidden
  }
}
</style>
