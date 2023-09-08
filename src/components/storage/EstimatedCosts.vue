<template>
  <div class="box">
    <h4>Estimated Costs</h4>
    <p class="pb-4">Use the calculator below to estimate costs based on expected usage. Actual costs will be dependent on usage.</p>
    <div class="w-full grid grid-cols-1 gap-x-4 gap-y-6 xl:grid-cols-2">
      <div class="flex-1 flex flex-col">
        <div class="slider__box" :class="disableControls ? 'disabled' : ''">
          <span class="slider__title">Storage (GB per day)</span>
          <vue-slider
            :disabled=disableControls
            v-model=storageValue
            :vData="storageMarks"
            ref="requestsSlider"
            :dotSize="20"
            width="100%"
            :contained="true"
            :min="1"
            :max="1000"
            adsorb
            tooltip="always"
            :tooltip-formatter=formatSliderStorage
            tooltipPlacement="top"
            :tooltip-style="styles.tooltip"
            :process-style="styles.process"
            :dot-style="styles.dots"
            :label-style="styles.labels"
            :step-active-style="styles.activeStep"
          />
        </div>
        <div class="slider_costs">
          <!-- @TODO use value from config -->
          <span><span class="text-md">${{ 0.025 }}</span> per GB storage</span>
          <span><span class="text-md">${{ dailyStorageCost.toFixed(4) }}</span> per day</span>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-baseline justify-between w-full mt-8 space-y-4 border-t border-gray-300 xl:space-y-0 xl:flex-row pt-7">
      <div class="flex flex-col items-baseline">
        <span class="text-green">Estimated Daily Usage</span>
        <div class="usage_and_cost">
          <span class="text-lg flex-shrink-0">{{ storageValueDisplay }} Storage</span>
        </div>
      </div>
      <div class="flex flex-col items-baseline">
        <span class="text-green">Estimated Cost</span>
        <div class="usage_and_cost">
          <span><span class="text-lg flex-shrink-0">${{ dailyTotalCost.toFixed(4) }}</span> per day</span>
          <span class="dot" />
          <span><span class="text-lg flex-shrink-0">${{ monthlyTotalCost.toFixed(2) }}</span> per 30 days</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-slider-component/theme/antd.css'
import VueSlider from 'vue-slider-component'
import { mapState } from 'vuex'

export default {
  name: 'EstimatedCosts',
  components: {
    VueSlider
  },
  props: ['disableControls'],
  data() {
    return {
      styles: {
        activeStep: { background: '#fff', opacity: '1', border: 'none', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' },
        dots: { background: '#4ecd5f', boxShadow: '0 0 2px 1px #eee', border: 'none' },
        labels: { color: '#999', fontSize: '12px' },
        process: { background: '#4ecd5f' },
        tooltip: { background: '#4ecd5f', borderColor: '#4ecd5f' }
      },
      storageMarks: [
        { value: '5', label: '5' },
        { value: '10', label: '10' },
        { value: '20', label: '20' },
        { value: '50', label: '50' },
        { value: '100', label: '100' },
        { value: '200', label: '200' },
        { value: '500', label: '500' },
        { value: '1000', label: '1000' }
      ],
      storageValue: 5
    }
  },
  computed: {
    ...mapState(['config']),
    dailyTotalCost() {
      return this.dailyStorageCost
    },
    dailyStorageCost() {
      /** @TODO use value from config */
      return this.storageValue * 0.025
    },
    monthlyTotalCost() {
      return this.dailyTotalCost * 30
    },
    storageValueDisplay() {
      return this.storageValue >= 1000 ? `${this.storageValue / 1000} TB` : `${this.storageValue} GB`
    }
  },
  methods: {
    formatSliderStorage(storage) {
      if (storage < 1000) return `${storage} GB`
      else return `${(storage / 1000)} TB`
    }
  }
}
</script>

<style scoped>
.slider__box {
  @apply relative flex space-x-3 items-start justify-center pr-5 pl-2 pt-14 pb-8 border border-gray-300 rounded-md;
}
.slider__box.disabled {
  @apply cursor-not-allowed opacity-50;
}

.slider__title {
  @apply absolute top-0 inline-block px-3 text-gray-500 transform -translate-y-1/2 bg-white;
}

.usage_and_cost {
  @apply flex items-center space-x-2;
}
.slider_costs {
  @apply mt-1 w-full flex justify-between
}
.dot {
  @apply w-1 h-1 bg-gray-400 rounded-full
}

@media (max-width: 420px) {
  .usage_and_cost {
    @apply flex-col items-start space-x-0 space-y-2 mt-2;
  }
  .dot {
    @apply hidden;
  }
}

@media (max-width: 350px) {
  .slider_costs {
    @apply flex-col;
  }
}
</style>
