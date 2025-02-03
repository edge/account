<script setup>
import Slider from '../../../layout/Slider.vue'
import { defineModel, defineProps } from 'vue'

defineProps({
  disabled: Boolean
})

const model = defineModel()

const rawMarks = [
  ['fast', 'Fast'],
  ['faster', 'Faster'],
  ['fastest', 'Fastest']
]

const marks = rawMarks.reduce((ms, m, i) => {
  ms[i] = m[0]
  return ms
}, {})

function formatter(i) {
  return rawMarks[i][1]
}

function setSpeed(i) {
  model.value = rawMarks[i][0]
}
</script>

<template>
  <Slider
    :disabled="disabled"
    :formatter="formatter"
    :marks="marks"
    :max="2"
    :min="0"
    title="Speed"
    tooltip="always"
    @change="setSpeed"
  />
</template>
