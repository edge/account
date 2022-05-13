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
          :max=32
          :marks="{
            '1': '1',
            '4': '4',
            '8': '8',
            '12': '12',
            '16': '16',
            '20': '20',
            '24': '24',
            '28': '28',
            '32': '32'
          }"
          adsorb
          silent
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
          tooltip="always"
          :tooltip-formatter="formatRam"
          tooltipPlacement="top"
          :tooltip-style="styles.tooltip"
          :process-style="styles.process"
          :dot-style="styles.dots"
          :label-style="styles.labels"
          :step-active-style="styles.activeStep"
        />
      </div>
      <div class="box">
        <span class="box__title">Storage (GB)</span>
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

    <!-- selected results shown on resize screen -->
    <!-- uses two rows to show current vs new specs and cost -->
    <div v-if="this.current" class="mt-5">
      <div class="flex flex-col items-baseline justify-between w-full p-5 mt-8 border-t border-gray-300 lg:flex-row">
        <div class="flex flex-col lg:items-center lg:flex-row">
          <div class="w-36 text-green">Current server:</div>
          <div class="flex items-center space-x-2.5">
            <span class="text-lg">{{ current.cpu }} vCPU</span>
            <span class="w-1 h-1 bg-gray-400 rounded-full" />
            <span class="text-lg">{{ formatRam(current.ram) }} RAM</span>
            <span class="w-1 h-1 bg-gray-400 rounded-full" />
            <span class="text-lg">{{ current.ssd }}GB SSD</span>
          </div>
        </div>
        <div class="flex flex-col items-baseline">
          <span><span class="text-lg">${{ currentCost }}</span> per month</span>
        </div>
      </div>
      <div class="flex flex-col items-baseline justify-between w-full p-5 rounded-md bg-gray-50 lg:flex-row">
        <div class="flex flex-col lg:items-center lg:flex-row">
          <div class="w-36 text-green">After resize:</div>
          <div class="flex items-center space-x-2.5">
            <span class="text-lg">{{ cpuValue }} vCPU</span>
            <span class="w-1 h-1 bg-gray-400 rounded-full" />
            <span class="text-lg">{{ formatRam(ramValue) }} RAM</span>
            <span class="w-1 h-1 bg-gray-400 rounded-full" />
            <span class="text-lg">{{ storageValue }}GB SSD</span>
          </div>
        </div>
        <div class="flex flex-col items-baseline">
          <span><span class="text-lg font-medium">${{ calculatedCost }}</span> per month</span>
        </div>
      </div>
    </div>

    <!-- selected results shown on deploy screen -->
    <!-- eslint-disable-next-line max-len -->
    <div v-else class="flex flex-col items-baseline justify-between w-full mt-8 space-y-5 border-t border-gray-300 md:space-y-0 md:flex-row pt-7">
      <div class="flex flex-col items-baseline">
        <span class="text-green">Your server</span>
        <div class="flex items-center space-x-2.5">
          <span class="text-lg">{{ cpuValue }} vCPU</span>
          <span class="w-1 h-1 bg-gray-400 rounded-full" />
          <span class="text-lg">{{ formatRam(ramValue) }} RAM</span>
          <span class="w-1 h-1 bg-gray-400 rounded-full" />
          <span class="text-lg">{{ storageValue }}GB SSD</span>
        </div>
      </div>
      <div class="flex flex-col items-baseline">
        <span class="text-green">Cost</span>
        <span><span class="text-lg">${{ calculatedCost }}</span> per month</span>
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
    'calculatedCost',
    'currentCost',
    'current',
    'resizeType',
    'selectedSpecs'
  ],
  components: {
    VueSlider
  },
  data() {
    return {
      presets: null,
      selectedPreset: null,
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
    formattedRam() {
      if (this.current.ram < 1) {
        return `${this.current.ram * 1024}MB`
      }
      return `${this.current.ram}GB`
    },
    spec() {
      return {
        cpus: this.cpuValue,
        disk: this.storageValue * 1024,
        ram: this.ramValue * 1024
      }
    }
  },
  methods: {
    changeStorage(value) {
      if (this.current && value < this.current.ssd) {
        this.$refs.ssdSlider.setValue(this.current.ssd)
      }
    },
    formatRam(value) {
      if (value < 1) {
        return `${value * 1024}MB`
      }
      return `${value}GB`
    },
    updateParentResizeSpecs(data) {
      this.$emit('specs-changed', data)
    }
    // update() {
    //   const { current, resizeType, selectedSpecs } = this
    //   let matchingPreset

    //   if (this.presets && this.presets.length) {
    //     console.log('current , selectedSpecs', current , selectedSpecs)
    //     // if (current && !selectedSpecs) {
    //     if (current) {
    //       matchingPreset = this.presets.map(p => {
    //         if (p.ram === current.ram && p.cpu === current.cpu) {
    //           return p
    //         } else {
    //           return null
    //         }
    //       }).filter(Boolean)


    //       // Loop over presets and disable those that can't be used.
    //       this.presets.forEach(p => {
    //         p.enabled = true

    //         console.log('resizeType, p.ssd, current.ssd', resizeType, p.ssd, current.ssd)

    //         // SSD cannot be downsized.
    //         // if (p.ssd < current.ssd) {
    //         if (resizeType && resizeType.id === 2 && p.ssd < current.ssd) {
    //           p.enabled = false
    //         }
    //       })
    //     }

    //     if (selectedSpecs) {
    //       this.selectedPreset = selectedSpecs
    //     } else {
    //       if (matchingPreset && matchingPreset[0]) {
    //         this.selectedPreset = matchingPreset[0]
    //       } else {
    //         this.selectedPreset = this.presets[0]
    //       }
    //     }

    //     console.log('this.selectedPreset',this. selectedPreset)
    //   }
    // }
  },
  mounted() {
    this.cpuValue = this.current ? this.current.cpu : 1
    this.ramValue = this.current ? this.current.ram : 0.5
    this.storageValue = this.current ? this.current.ssd : 10
  },
  watch: {
    presets(value) {
      this.update()
      // const { current, resizeType, selectedSpecs } = this
      // let matchingPreset

      //   console.log('resizeType, current , selectedSpecs', resizeType, current , selectedSpecs)
      // if (this.presets && this.presets.length) {
      //   if (current && !selectedSpecs) {
      //     matchingPreset = this.presets.map(p => {
      //       if (p.ram === current.ram && p.cpu === current.cpu) {
      //         return p
      //       } else {
      //         return null
      //       }
      //     }).filter(Boolean)


      //     // Loop over presets and disable those that can't be used.
      //     this.presets.forEach(p => {
      //       p.enabled = true

      //       console.log('resizeType, p.ssd, current.ssd', resizeType, p.ssd, current.ssd)

      //       // SSD cannot be downsized.
      //       if (p.ssd < current.ssd) {
      //         p.enabled = false
      //       }
      //     })
      //   }

      //   if (selectedSpecs) {
      //     this.selectedPreset = selectedSpecs
      //   } else {
      //     if (matchingPreset && matchingPreset[0]) {
      //       this.selectedPreset = matchingPreset[0]
      //     } else {
      //       this.selectedPreset = this.presets[0]
      //     }
      //   }
      // }
    },
    resizeType(value) {
      console.log('value', value)
      // this.resizeType = value
      // this.update()
      if (this.resizeType.id === 2) {
        // Set the ssd slider back to current.
        this.storageValue = this.current.ssd
        this.$refs.ssdSlider.setValue(this.current.ssd)
      }
    },
    spec() {
      this.$emit('specs-changed', this.spec)
    },
    selectedPreset(value) {
      // this.updateParentResizeSpecs(value)
    }
  }
}
</script>

<style scoped>
  .specs__grid {
    @apply mt-10 w-full grid grid-cols-1 gap-x-4 gap-y-10;
    @apply sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3;
  }

  /* radio option */
  .box {
    @apply relative flex space-x-3 items-start justify-center pr-5 pl-2 pt-14 pb-8 border border-gray-300 rounded-md;
  }

  .box__title {
    @apply absolute top-0 inline-block px-3 text-gray-500 transform -translate-y-1/2 bg-white;
  }

  /* option title */
  .optionTitle {
    @apply text-center w-full pb-3 border-b border-gray-300;
  }
  .optionTitle.active {
    @apply border-green border-opacity-20;
  }
  .optionTitle.checked {
    @apply border-green border-opacity-40;
  }

  /* option specs */
  .optionSpecs {
    @apply flex flex-col items-center w-full mt-4 text-sm text-gray-500;
  }

  /* disabled tooltip */
  .whyDisabled {
    @apply w-full h-full md:h-auto top-0 left-0 absolute md:pb-2;
    @apply transition md:transform md:-translate-y-10 md:group-hover:-translate-y-full;
  }
  .whyDisabled__inner {
    @apply flex items-center justify-center w-full h-full md:h-auto p-3;
    @apply text-center bg-opacity-90 bg-black text-white rounded-md leading-snug text-xs z-10 opacity-0;
    @apply group-hover:opacity-100;
  }
  .whyDisabled__notch {
    @apply w-4 h-4 bg-black transform rotate-45 absolute bottom-1;
    @apply hidden md:block;
  }
</style>
