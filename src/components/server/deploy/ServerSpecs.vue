<template>
  <div>
    <div class="specs__grid">
      <div class="flex flex-col">
        <div class="slider__box" :class="disableControls ? 'disabled' : ''">
          <span class="slider__title">vCPU</span>
          <vue-slider
            :disabled=disableControls
            v-model=cpusValue
            :dotSize="20"
            width="100%"
            :contained="true"
            :min="cpuOptions.min"
            :max="cpuOptions.max"
            :marks="cpuOptions.marks"
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
        <span v-if="hasExceededCapacity('cpus') && !disableControls" class="spec__warning">
          vCPU is limited as the region you have selected is close to capacity.
          <button @click.prevent="resetToMaxSpec('cpus')" class="underline">Set to max available.</button>
        </span>
      </div>
      <div class="flex flex-col">
        <div class="slider__box" :class="disableControls ? 'disabled' : ''">
          <span class="slider__title">RAM (GiB)</span>
          <vue-slider
            :disabled=disableControls
            v-model=ramValue
            :vData="ramOptions.data"
            ref="ramSlider"
            :marks="true"
            :dotSize="20"
            adsorb
            width="100%"
            :contained="true"
            tooltip="always"
            :tooltip-formatter=formatSliderRAM
            tooltipPlacement="top"
            :tooltip-style="styles.tooltip"
            :process-style="styles.process"
            :dot-style="styles.dots"
            :label-style="styles.labels"
            :step-active-style="styles.activeStep"
          />
        </div>
        <span v-if="hasExceededCapacity('ram') && !disableControls" class="spec__warning">
          RAM is limited as the region you have selected is close to capacity.
          <button @click.prevent="resetToMaxSpec('ram')" class="underline">Set to max available.</button>
        </span>
      </div>
      <div class="flex flex-col">
        <div class="slider__box" :class="disableControls ? 'disabled' : ''">
          <span class="slider__title">Disk (GiB)</span>
          <vue-slider
            :disabled=disableControls
            v-model=diskValue
            ref="ssdSlider"
            :dotSize="20"
            width="100%"
            :contained="true"
            :vData="diskOptions.data"
            :marks="true"
            adsorb
            tooltip="always"
            :tooltip-formatter="'{value} GiB'"
            tooltipPlacement="top"
            :tooltip-style="styles.tooltip"
            :process-style="styles.process"
            :dot-style="styles.dots"
            :label-style="styles.labels"
            :step-active-style="styles.activeStep"
          />
        </div>
        <span v-if="hasExceededCapacity('disk') && !disableControls" class="spec__warning">
          Disk size is limited as the region you have selected is close to capacity.
          <button @click.prevent="resetToMaxSpec('disk')" class="underline">Set to max available.</button>
        </span>
        <!-- disk size change warning -->
        <span v-show="diskValueIncreased || diskValueDecreased" class="spec__warning">
          <!-- eslint-disable-next-line max-len -->
          <span v-if=diskValueIncreased>Your server's filesystem will be expanded. This disk resize is not reversible.</span>
          <span v-else>Disk size cannot be decreased.
            <button class="underline" @click="resetToMinimumDisk">Reset</button>
          </span>
        </span>
      </div>
      <div class="flex flex-col">
        <div class="slider__box" :class="disableControls ? 'disabled' : ''">
          <span class="slider__title">Bandwidth (Mbps)</span>
          <vue-slider
            :disabled=disableControls
            v-model=bandwidthValue
            ref="badwidthSlider"
            :dotSize="20"
            width="100%"
            :contained="true"
            :min="bandwidthOptions.min"
            :max="bandwidthOptions.max"
            :marks="bandwidthOptions.marks"
            adsorb
            tooltip="always"
            :tooltip-formatter="'{value} Mbps'"
            tooltipPlacement="top"
            :tooltip-style="styles.tooltip"
            :process-style="styles.process"
            :dot-style="styles.dots"
            :label-style="styles.labels"
            :step-active-style="styles.activeStep"
          />
        </div>
      </div>
    </div>

    <!-- selected results shown on resize screen -->
    <!-- uses two rows to show current vs new specs and cost -->
    <div v-if="current" class="mt-5">
      <!-- eslint-disable-next-line max-len -->
      <div class="flex flex-col space-y-4 items-baseline justify-between w-full p-5 mt-8 border-t border-gray-300 xl:flex-row">
        <div class="flex flex-col items-baseline">
          <span class="text-green">Current Server</span>
          <div class="specs_and_cost flex">
            <span class="text-lg flex-shrink-0">{{ current.spec.cpus }} vCPU</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(current.spec.ram) }} RAM</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(current.spec.disk) }} Disk</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ current.spec.bandwidth || 10 }} Mbps</span>
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
      <div class="flex flex-col space-y-4 items-baseline justify-between w-full p-5 rounded-md bg-gray-50 xl:flex-row">
        <div class="flex flex-col items-baseline">
          <span class="text-green">After Resize</span>
          <div class="specs_and_cost flex">
            <span class="text-lg flex-shrink-0">{{ cpusValue }} vCPU</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(spec.ram) }} RAM</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ formatMiB(spec.disk) }} Disk</span>
            <span class="dot" />
            <span class="text-lg flex-shrink-0">{{ spec.bandwidth }} Mbps</span>
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
    <div v-else class="flex flex-col items-baseline justify-between w-full mt-8 space-y-5 border-t border-gray-300 xl:space-y-0 xl:flex-row pt-7">
      <div class="flex flex-col items-baseline">
        <span class="text-green">Your server</span>
        <div class="specs_and_cost flex">
          <span class="text-lg flex-shrink-0">{{ cpusValue }} vCPU</span>
          <span class="dot" />
          <span class="text-lg flex-shrink-0">{{ formatMiB(spec.ram) }} RAM</span>
          <span class="dot" />
          <span class="text-lg flex-shrink-0">{{ formatMiB(spec.disk) }} Disk</span>
          <span class="dot" />
          <span class="text-lg flex-shrink-0">{{ spec.bandwidth }} Mbps</span>
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
import * as format from '@/utils/format'
import VueSlider from 'vue-slider-component'
import { mapState } from 'vuex'

export default {
  name: 'ServerSpecs',
  props: [
    'disableControls',
    'hourlyCost',
    'currentHourlyCost',
    'current',
    'isRegionDisabled',
    'region',
    'selectedSpecs'
  ],
  components: {
    VueSlider
  },
  data() {
    return {
      bandwidthValue: null,
      cpusValue: null,
      ramValue: null,
      diskValue: null,
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
    ...mapState(['config']),
    bandwidthOptions() {
      const min = this.config.server.limit.bandwidth.min
      const max = this.config.server.limit.bandwidth.max
      const marks = { }
      for (let i = min; i <= max; i += 10) marks[i] = i
      return { min, max, marks }
    },
    cpuOptions() {
      const min = this.config.server.limit.cpu.min
      const max = this.config.server.limit.cpu.max
      const marks = { '1': '1' }
      for (let i = 4; i <= max; i += 4) marks[i] = i
      return { min, max, marks }
    },
    currentHourlyCostFormatted() {
      return format.usd(this.currentHourlyCost, 4)
    },
    currentDailyCostFormatted() {
      return format.usd(this.currentHourlyCost * 24, 2)
    },
    dailyCostFormatted() {
      return format.usd(this.hourlyCost * 24, 2)
    },
    diskOptions() {
      const min = this.config.server.limit.disk.min / 1024
      const max = this.config.server.limit.disk.max / 1024
      const data = [{ value: '10', label: '10GiB'}]
      for (let i = 16; i <= max; i = i * 2) {
        const label = i < 1 ? `${i}MiB` : `${i}GiB`
        data.push({ value: i.toString(), label})
      }
      return { min, max, data }
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
      return format.usd(this.hourlyCost, 4)
    },
    ramOptions() {
      const min = this.config.server.limit.ram.min / 1024
      const max = this.config.server.limit.ram.max / 1024
      const data = []
      for (let i = min; i <= max; i = i * 2) {
        const label = i < 1 ? `${i}MiB` : `${i}GiB`
        data.push({ value: i.toString(), label})
      }
      return { min, max, data }
    },
    spec() {
      return {
        bandwidth: this.bandwidthValue,
        cpus: this.cpusValue,
        disk: this.diskValue * 1024,
        ram: this.ramValue * 1024
      }
    }
  },
  methods: {
    areAllSpecsValid() {
      return !['cpus', 'disk', 'ram'].some(spec => this.hasExceededCapacity(spec))
    },
    formatCost(cost, decimalPlaces) {
      const mult = 10**decimalPlaces
      return (Math.round(cost * mult) / mult).toFixed(decimalPlaces)
    },
    formatMiB(MiB) {
      return format.mib(MiB)
    },
    formatSliderRAM(sliderRAM) {
      if (sliderRAM < 1) return `${sliderRAM * 1024} MiB`
      else return `${sliderRAM} GiB`
    },
    getMaxAvailableInput(spec) {
      let max = this.region.capacity[spec] - (this.region.usage && this.region.usage[spec] || 0)
      if (this.current) max += this.current.spec[spec]
      if (spec === 'disk' || spec === 'ram') return max / 1024
      return max
    },
    hasExceededCapacity(spec) {
      return this[`${spec}Value`] > this.getMaxAvailableInput(spec)
    },
    resetToMinimumDisk() {
      if (!this.current) return
      if (this.diskValue * 1024 < this.current.spec.disk) {
        this.diskValue = (this.current.spec.disk / 1024).toString()
      }
    },
    resetToMaxSpec(spec) {
      const max = this.getMaxAvailableInput(spec)
      if (spec === 'cpus') this.cpusValue = max
      if (spec === 'disk') {
        const values = this.diskOptions.data.map(option => option.value).reverse()
        this.diskValue = values.find(value => value <= max)
      }
      if (spec === 'ram') {
        const values = this.ramOptions.data.map(option => option.value).reverse()
        this.ramValue = values.find(value => value <= max)
      }
    }
  },
  mounted() {
    this.bandwidthValue = this.current ? this.current.spec.bandwidth || 10 : 10
    this.cpusValue = this.current ? this.current.spec.cpus : 1
    this.ramValue = this.current ? (this.current.spec.ram / 1024).toString() : 0.5
    this.diskValue = this.current ? (this.current.spec.disk / 1024).toString() : 10
  },
  watch: {
    spec() {
      this.$emit('specs-changed', this.spec, this.areAllSpecsValid())
    }
  }
}
</script>

<style scoped>
.specs__grid {
  @apply mt-10 w-full grid grid-cols-1 gap-x-4 gap-y-10;
  @apply sm:grid-cols-1 lg:grid-cols-2;
}

.specs_and_cost {
  @apply flex items-center space-x-2.5;
}
.dot {
  @apply w-1 h-1 bg-gray-400 rounded-full
}

/* radio option */
.slider__box {
  @apply relative flex space-x-3 items-start justify-center pr-5 pl-2 pt-14 pb-8 border border-gray-300 rounded-md;
}
.slider__box.disabled {
  @apply cursor-not-allowed opacity-50;
}

.slider__title {
  @apply absolute top-0 inline-block px-3 text-gray-500 transform -translate-y-1/2 bg-white;
}

.spec__warning {
  @apply bg-gray-200 mt-2 p-2 rounded text-red;
}

@media (max-width: 420px) {
  .specs_and_cost {
    @apply flex-col items-start space-x-0 space-y-2 mt-2;
  }
  .dot {
    @apply hidden;
  }
}
</style>
