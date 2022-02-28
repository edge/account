<template>
  
  <div class="specs__grid">
    <div class="box">
      <span class="box__title">vCPU</span>
      <vue-slider
        v-model="cpuValue"
        dotSize=20
        width="100%"
        contained=true
        min=1
        max=32
        adsorb
        tooltip="always"
        :tooltip-formatter="'{value} vCPU'"
        tooltipPlacement="top"
        :marks="{'1':'1', '8':'8', '16':'16', '24':'24', '32':'32'}"
        :tooltip-style="{ background: '#4ecd5f', borderColor: '#4ecd5f' }"
        :process-style="{ background: '#4ecd5f' }"
        :dot-style="{ background: '#4ecd5f', boxShadow: '0 0 2px 1px #eee', border: 'none' }"
        :label-style="{ color: '#999', fontSize: '12px' }"
        :step-active-style="{ background: '#fff', opacity: '1', border: 'none', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }"
      />
    </div>
    <div class="box">
      <span class="box__title">RAM (mb)</span>
      <vue-slider
        v-model="ramValue"
        dotSize=20
        width="100%"
        contained=true
        min=512
        max=32768
        adsorb
        tooltip="always"
        :tooltip-formatter="'{value} MB'"
        tooltipPlacement="top"
        :marks="{'512':'512mb', '8000':'8GB', '16000':'16GB', '24000':'24GB', '32768':'32GB'}"
        :tooltip-style="{ background: '#4ecd5f', borderColor: '#4ecd5f' }"
        :process-style="{ background: '#4ecd5f' }"
        :dot-style="{ background: '#4ecd5f', boxShadow: 'none', border: 'none' }"
        :label-style="{ color: '#999', fontSize: '12px' }"
        :step-active-style="{ background: '#fff', opacity: '1', border: 'none', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }"
      />
    </div>
    <div class="box">
      <span class="box__title">Storage (GB)</span>
      <vue-slider
        v-model="storageValue"
        dotSize=20
        width="100%"
        contained=true
        min=4
        max=1024
        adsorb
        tooltip="always"
        :tooltip-formatter="'{value} GB'"
        tooltipPlacement="top"
        :marks="{'4':'4GB', '256':'256GB', '500':'500GB', '750':'750GB', '1024':'1024GB'}"
        :tooltip-style="{ background: '#4ecd5f', borderColor: '#4ecd5f' }"
        :process-style="{ background: '#4ecd5f' }"
        :dot-style="{ background: '#4ecd5f', boxShadow: '0 0 2px 1px #eee', border: 'none' }"
        :label-style="{ color: '#999', fontSize: '12px' }"
        :step-active-style="{ background: '#fff', opacity: '1', border: 'none', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }"
      />
    </div>
  </div>
  <div class="flex flex-col items-baseline justify-between w-full mt-8 space-y-5 border-t border-gray-300 md:space-y-0 md:flex-row pt-7">
    <div class="flex flex-col items-baseline">
      <span class="text-green">Your server</span>
      <div class="flex items-center space-x-2.5">
        <span class="text-lg">{{cpuValue}} vCPU</span>
        <span class="w-1 h-1 bg-gray-400 rounded-full" />
        <span class="text-lg">{{ramValue}}mb RAM</span>
        <span class="w-1 h-1 bg-gray-400 rounded-full" />
        <span class="text-lg">{{storageValue}} GB SSD</span>
      </div>
    </div>
    <div class="flex flex-col items-baseline">
      <span class="text-green">Cost</span>
      <span><span class="text-lg">$12</span> per month</span>
    </div>
  </div>
</template>

<script>
import {

} from '@headlessui/vue'

import { ref, onUpdated } from 'vue'
import useSWRV from 'swrv'
import { fetcher } from '../../utils/api'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'

export default {
  name: 'ServerSpecs',
  props: ['current', 'resizeType', 'selectedSpecs'],
  components: {
    VueSlider
  },
  data() {
    return {
      presets: null,
      selectedPreset: null,
      cpuValue: 1,
      ramValue: 512,
      storageValue: 4
    }
  },
  methods: {
    updateParentResizeSpecs(data) {
      this.$emit('specs-changed', data)
    },
    update() {
      const { current, resizeType, selectedSpecs } = this
      let matchingPreset

      if (this.presets && this.presets.length) {
        console.log('current , selectedSpecs', current , selectedSpecs)
        // if (current && !selectedSpecs) {
        if (current) {
          matchingPreset = this.presets.map(p => {
            if (p.ram === current.ram && p.cpu === current.cpu) {
              return p
            } else {
              return null
            }
          }).filter(Boolean)


          // Loop over presets and disable those that can't be used.
          this.presets.forEach(p => {
            p.enabled = true

            console.log('resizeType, p.ssd, current.ssd', resizeType, p.ssd, current.ssd)
            
            // SSD cannot be downsized.
            // if (p.ssd < current.ssd) {
            if (resizeType && resizeType.id === 2 && p.ssd < current.ssd) {
              p.enabled = false
            }
          })
        }

        if (selectedSpecs) {
          this.selectedPreset = selectedSpecs
        } else {
          if (matchingPreset && matchingPreset[0]) {
            this.selectedPreset = matchingPreset[0]
          } else {      
            this.selectedPreset = this.presets[0]
          }
        }

        console.log('this.selectedPreset',this. selectedPreset)
      }      
    }
  },
  mounted() {
    this.selectedPreset = ref(null)
    const { data: presets, error } = useSWRV(() => '/presets', fetcher)

    this.presets = presets && presets.value ? presets.value : presets

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
      this.update()
    },
    selectedPreset(value) {
      this.updateParentResizeSpecs(value)
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
