<script setup>
import GPUSelect from '../components/GPUSelect.vue'
import Slider from '../../../layout/Slider.vue'
import { reactive } from 'vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

const formState = reactive({
  gpu: '',
  disk: 10,
  gpus: 1,
  ram: 2,
  vcpus: 1
})

const v$ = useVuelidate({
  gpu: [required],
  disk: [],
  gpus: [],
  ram: [],
  vcpus: []
}, formState)
</script>

<template>
  <div class="mainContent__inner">
    <h1>Deploy a new Edge GPU</h1>

    <div class="box">
      <GPUSelect v-model="v$.gpu.$model" />

      <div class="grid grid-cols-2 gap-4">
        <Slider
          v-model="v$.gpus.$model"
          :marks="[1,2,4,8]"
          :max="8"
          :min="1"
          title="GPUs"
          tooltip="always"
        />

        <Slider
          v-model="v$.vcpus.$model"
          :marks="[1,2,4,8,12,16,24,32]"
          :max="32"
          :min="1"
          title="vCPUs"
          tooltip="always"
        />

        <Slider
          v-model="v$.ram.$model"
          :formatter="size => `${size} GiB`"
          :marks="[2,4,8,12,16,24,32]"
          :max="32"
          :min="2"
          title="RAM (GiB)"
          tooltip="always"
        />

        <Slider
          v-model="v$.disk.$model"
          :formatter="size => `${size} GiB`"
          :marks="[10,20,50,100,200]"
          :max="200"
          :min="10"
          title="Disk (GiB)"
          tooltip="always"
        />
      </div>
    </div>
  </div>
</template>
