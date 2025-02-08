<script setup>
import GPUSelect from '../components/GPUSelect.vue'
import { reactive } from 'vue'
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

const formState = reactive({
  gpu: ''
})

const v$ = useVuelidate({
  gpu: [required]
}, formState)
</script>

<template>
  <div class="mainContent__inner">
    <h1>Deploy a new Edge GPU</h1>

    <div class="box">
      <GPUSelect v-model="v$.gpu.$model" />
    </div>
  </div>
</template>
