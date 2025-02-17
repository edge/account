<script setup>
import GPUSelect from '../components/GPUSelect.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import Password from '../../../components/server/deploy/Password.vue'
import Slider from '../../../layout/Slider.vue'
import ValidationError from '../../../components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'
import { maxValue, minLength, minValue, required } from '@vuelidate/validators'

const formState = reactive({
  gpu: '',
  disk: 10,
  gpus: 1,
  ram: 2,
  vcpus: 1,
  name: '',
  password: ''
})

const v$ = useVuelidate({
  gpu: [required],
  disk: [minValue(10), maxValue(200)],
  gpus: [minValue(1), maxValue(8)],
  ram: [minValue(2), maxValue(32)],
  vcpus: [minValue(1), maxValue(32)],
  name: [required, minLength(3)],
  password: [required, minLength(8)]
}, formState)

const busy = ref(false)
const canDeploy = computed(() => v$.value.$anyDirty && !v$.value.$invalid)

function setPassword(value) {
  v$.value.password.$model = value
}

async function submit() {
  const data = {
    gpu: v$.value.gpu.$model,
    disk: v$.value.disk.$model,
    gpus: v$.value.gpus.$model,
    ram: v$.value.ram.$model,
    vcpus: v$.value.vcpus.$model,
    name: v$.value.name.$model,
    password: v$.value.password.$model
  }
  console.log(data)
}
</script>

<template>
  <div class="mainContent__inner">
    <h1>Deploy a new Edge GPU</h1>

    <form class="flex flex-col col-span-12 pb-20 space-y-4" @submit.prevent="submit">
      <div class="box">
        <h4>Select GPU</h4>
        <GPUSelect v-model="v$.gpu.$model" />
        <ValidationError :errors="v$.gpu.$errors" />
      </div>

      <div class="box">
        <h4>Specs</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Slider
              v-model="v$.gpus.$model"
              :disabled="busy"
              :marks="[1,2,4,8]"
              :max="8"
              :min="1"
              title="GPUs"
              tooltip="always"
            />
            <ValidationError :errors="v$.gpus.$errors" />
          </div>

          <div>
            <Slider
              v-model="v$.vcpus.$model"
              :disabled="busy"
              :marks="[1,2,4,8,12,16,24,32]"
              :max="32"
              :min="1"
              title="vCPUs"
              tooltip="always"
            />
            <ValidationError :errors="v$.vcpus.$errors" />
          </div>

          <div>
            <Slider
              v-model="v$.ram.$model"
              :disabled="busy"
              :formatter="size => `${size} GiB`"
              :marks="[2,4,8,12,16,24,32]"
              :max="32"
              :min="2"
              title="RAM (GiB)"
              tooltip="always"
            />
            <ValidationError :errors="v$.ram.$errors" />
          </div>

          <div>
            <Slider
              v-model="v$.disk.$model"
              :disabled="busy"
              :formatter="size => `${size} GiB`"
              :marks="[10,20,50,100,200]"
              :max="200"
              :min="10"
              title="Disk (GiB)"
              tooltip="always"
            />
            <ValidationError :errors="v$.disk.$errors" />
          </div>
        </div>
      </div>

      <div class="box">
        <!-- Name -->
        <div class="flex flex-col pb-2 space-y-6">
          <div class="input-group">
            <label class="label">Name</label>
            <input
              v-model="v$.name.$model"
              :disabled="busy"
              :class="busy ? 'disabled' : ''"
              class="input input--floating"
              placeholder="Name of your server e.g. My Edge GPU"
              required
              type="text"
            />
            <ValidationError :errors="v$.name.$errors" />
          </div>
        </div>
      </div>

      <div class="box">
        <Password :disableControls="busy" @password-changed="setPassword" />
        <ValidationError :errors="v$.password.$errors" />
      </div>

      <div class="flex flex-col w-full space-y-2">
        <button
          :disabled="!canDeploy"
          class="button button--success self-end w-full md:max-w-xs"
          type="submit"
        >
          <span v-if="busy" class="flex">
            <span>Deploying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </span>
          <span v-else>Deploy</span>
        </button>
      </div>
    </form>
  </div>
</template>
