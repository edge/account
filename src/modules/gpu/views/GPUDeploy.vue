<script setup>
/* global process */

import GPUSelect from '../components/GPUSelect.vue'
import LoadingSpinner from '../../../components/icons/LoadingSpinner.vue'
import Password from '../../../components/server/deploy/Password.vue'
import Slider from '../../../layout/Slider.vue'
import ValidationError from '../../../components/ValidationError.vue'
import { serverNameChars } from '../../../utils/validation'
import superagent from 'superagent'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'
import { maxValue, minLength, minValue, required } from '@vuelidate/validators'

const router = useRouter()
const store = useStore()

const formState = reactive({
  name: '',
  hostname: '',
  gpuModel: '',
  gpuCount: 1,
  cpuCount: 1,
  memoryGiB: 2,
  diskGiB: 10,
  password: ''
})

const v$ = useVuelidate({
  name: [required, minLength(3)],
  hostname: [required, minLength(3), serverNameChars],
  gpuModel: [required],
  gpuCount: [minValue(1), maxValue(8)],
  cpuCount: [minValue(1), maxValue(32)],
  memoryGiB: [minValue(2), maxValue(32)],
  diskGiB: [minValue(10), maxValue(200)],
  password: [required, minLength(8)]
}, formState)

const busy = ref(false)
const canDeploy = computed(() => v$.value.$anyDirty && !v$.value.$invalid)
const error = ref()

function setPassword(value) {
  v$.value.password.$model = value
}

async function submit() {
  if (!store.state.session || !store.state.session._key) return

  const data = {
    name: v$.value.name.$model,
    hostname: v$.value.hostname.$model,
    gpuModel: v$.value.gpuModel.$model,
    gpuCount: v$.value.gpuCount.$model,
    cpuCount: v$.value.cpuCount.$model,
    memoryGiB: v$.value.memoryGiB.$model,
    diskGiB: v$.value.diskGiB.$model,
    password: v$.value.password.$model
  }

  try {
    busy.value = true
    error.value = undefined

    const res = await superagent.post(`${process.env.VUE_APP_ACCOUNT_API_URL}/v2/v1/vms`)
      .set('Authorization', `Bearer ${store.state.session._key}`)
      .send(data)

    router.push({ name: 'GPU', params: { id: res.body.id } })
  }
  catch (err) {
    error.value = err
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mainContent__inner">
    <h1>Deploy a new Edge GPU</h1>

    <form class="flex flex-col col-span-12 pb-20 space-y-4" @submit.prevent="submit">
      <div class="box">
        <h4>Select GPU</h4>
        <GPUSelect v-model="v$.gpuModel.$model" />
        <ValidationError :errors="v$.gpuModel.$errors" />
      </div>

      <div class="box">
        <h4>Specs</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Slider
              v-model="v$.gpuCount.$model"
              :disabled="busy"
              :marks="[1,2,4,8]"
              :max="8"
              :min="1"
              title="GPUs"
              tooltip="always"
            />
            <ValidationError :errors="v$.gpuCount.$errors" />
          </div>

          <div>
            <Slider
              v-model="v$.cpuCount.$model"
              :disabled="busy"
              :marks="[1,2,4,8,12,16,24,32]"
              :max="32"
              :min="1"
              title="vCPUs"
              tooltip="always"
            />
            <ValidationError :errors="v$.cpuCount.$errors" />
          </div>

          <div>
            <Slider
              v-model="v$.memoryGiB.$model"
              :disabled="busy"
              :formatter="size => `${size} GiB`"
              :marks="[2,4,8,12,16,24,32]"
              :max="32"
              :min="2"
              title="RAM (GiB)"
              tooltip="always"
            />
            <ValidationError :errors="v$.memoryGiB.$errors" />
          </div>

          <div>
            <Slider
              v-model="v$.diskGiB.$model"
              :disabled="busy"
              :formatter="size => `${size} GiB`"
              :marks="[10,20,50,100,200]"
              :max="200"
              :min="10"
              title="Disk (GiB)"
              tooltip="always"
            />
            <ValidationError :errors="v$.diskGiB.$errors" />
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

          <!-- Hostname -->
          <div class="input-group">
            <label class="label">Hostname</label>
            <input
              v-model="v$.hostname.$model"
              :disabled="busy"
              :class="busy ? 'disabled' : ''"
              class="input input--floating"
              placeholder="Hostname of your server e.g. my-gpu.example.com"
              required
              type="text"
            />
            <ValidationError :errors="v$.hostname.$errors" />
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
