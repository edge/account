<script setup>
import Slider from '../../../layout/Slider.vue'
import { defineModel, defineProps, effect, ref } from 'vue'

defineProps({
  disabled: Boolean
})

const model = defineModel()
const ready = ref(false)

const rawMarks = [
  ['fast', 'Fast'],
  ['faster', 'Faster'],
  ['fastest', 'Fastest']
]

const marks = rawMarks.reduce((ms, m, i) => {
  ms[i] = m[1]
  return ms
}, {})

function formatter(i) {
  return rawMarks[i][1]
}

function setSpeed(i) {
  model.value = rawMarks[i][0]
}

effect(() => {
  if (!ready.value) {
    /** WIP */
    ready.value = true
  }
})
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
