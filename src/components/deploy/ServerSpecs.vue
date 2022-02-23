<template>
  <RadioGroup v-model="selectedPreset">
    <RadioGroupLabel class="sr-only">Size</RadioGroupLabel>
    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="spec in presets"
        :key="spec.price"
        :value="spec"
        v-slot="{ active, checked, disabled }"
        :disabled="!spec.enabled"
      >
        <div
          :class="[
            active
              ? 'active'
              : '',
            checked ? 'checked' : '',
            disabled ? 'disabled' : ''
          ]"
          class="radioOption group"
        >
          <div class="flex flex-col items-center w-full text-sm">
            <div class="whyDisabled" :class="!disabled ? 'hidden' : ''">
              <div class="whyDisabled__inner">
                This size is not available because amet quam porta ridiculus
                <div class="whyDisabled__notch" />
              </div>
            </div>
            <RadioGroupLabel
              as="div"
              class="optionTitle"
              :class="[
                active
                  ? 'active'
                  : '',
                checked ? 'checked' : '',
                disabled ? 'disabled' : ''
              ]"
            >
              <h4 class="text-2xl">
                <sup><span class="inline-block text-sm leading-none">$</span></sup>{{ spec.price }}<span class="text-sm text-gray-600">/mo</span>
              </h4>
            </RadioGroupLabel>
            <RadioGroupDescription
              as="div"
              class="optionSpecs"
            >
              <!-- <span class="font-medium text-gray-900">{{ spec.name }}</span> -->
              <span class="mt-2">{{ spec.cpu }} vCPU</span>
              <span>{{ spec.ramFormatted }}</span>
              <span>{{ spec.ssdFormatted }} SSD</span>
              <!-- <span>{{ spec.mbps }}</span> -->
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script>
import {
  RadioGroup,
  RadioGroupLabel,
  RadioGroupDescription,
  RadioGroupOption,
} from '@headlessui/vue'

import { ref, onUpdated } from 'vue'
import useSWRV from 'swrv'
import { fetcher } from '../../utils/api'

export default {
  name: 'ServerSpecs',
  props: ['current', 'resizeType', 'selectedSpecs'],
  components: {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupDescription,
    RadioGroupOption,
  },
  data() {
    return {
      presets: null,
      selectedPreset: null
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
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4;
  }

  /* radio option */
  .radioOption {
    @apply relative flex space-x-3 items-start p-5 border border-gray-300 rounded-md cursor-pointer;
    @apply hover:bg-gray-100 hover:bg-opacity-50;
    @apply focus:outline-none;
  }
  .radioOption.active {
    @apply border-green border-opacity-40;
  }
  .radioOption.checked {
    @apply bg-gray-100 border-green bg-opacity-75;
    @apply ring-4 ring-green ring-opacity-10;
  }
  .radioOption.disabled {
    @apply cursor-not-allowed opacity-50;
    @apply hover:opacity-100 transition;
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
