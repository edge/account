<script setup>
import 'vue-slider-component/theme/antd.css'
import VueSlider from 'vue-slider-component'
import { defineEmits, defineModel, defineProps } from 'vue'

defineProps({
  disabled: Boolean,
  formatter: Function,
  marks: Object,
  max: Number,
  min: Number,
  title: String,
  tooltip: String
})

const emit = defineEmits(['change'])

const model = defineModel()
</script>

<template>
  <div class="slider__container" :class="{ disabled }">
    <span v-if="title" class="slider__title">{{ title }}</span>
    <vue-slider
      v-model="model"
      adsorb
      tooltipPlacement="top"
      width="100%"
      :contained="true"
      :disabled="disabled"
      :dot-style="{ background: '#4ecd5f', boxShadow: '0 0 2px 1px #eee', border: 'none' }"
      :dotSize="20"
      :label-style="{ color: '#999', fontSize: '12px' }"
      :marks="marks"
      :max="max"
      :min="min"
      :process-style="{ background: '#4ecd5f' }"
      :step-active-style="{ background: '#fff', opacity: '1', border: 'none', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }"
      :tooltip="tooltip || 'hover'"
      :tooltip-formatter="formatter"
      :tooltip-style="{ background: '#4ecd5f', borderColor: '#4ecd5f' }"
      @change="val => emit('change', val)"
    />
  </div>
</template>

<style>
.slider__container {
  @apply relative flex space-x-3 items-start justify-center pr-5 pl-2 pt-14 pb-8 border border-gray-300 rounded-md;
}

.slider__container.disabled {
  @apply cursor-not-allowed opacity-50;
}

.slider__title {
  @apply absolute top-0 inline-block px-3 text-gray-500 transform -translate-y-1/2 bg-white;
}

</style>
