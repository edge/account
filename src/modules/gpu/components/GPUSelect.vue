<script setup>
import { defineModel } from 'vue'
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'

const model = defineModel()

const gpus = [
  {
    _key: 'a100',
    cudoId: 'nvidia-a100-pcie',
    vendorName: 'nvidia',
    modelName: 'A100 PCI-E',
    memoryGib: 80
  },
  {
    _key: 'h100',
    cudoId: 'nvidia-h100-nvl-pcie',
    vendorName: 'nvidia',
    modelName: 'H100 NVL PCI-E',
    memoryGib: 96
  }
]
</script>

<template>
  <RadioGroup v-model="model">
    <RadioGroupLabel class="sr-only">GPU Model</RadioGroupLabel>

    <div class="box__grid">
      <RadioGroupOption
        v-for="gpu in gpus"
        v-slot="{ active, checked, disabled }"
        as="template"
        :disabled="disabled"
        :key="gpu._key"
        :value="gpu._key"
      >
        <div
          :class="{ active, checked, disabled }"
          class="radioOption"
        >
          <div class="flex flex-col items-center w-full">
            <RadioGroupLabel
              as="div"
              class="optionTitle"
              :class="{ active, checked, disabled }"
            >
              <h4 class="capitalize">{{ gpu.modelName }}</h4>
            </RadioGroupLabel>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<style scoped>
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-1 lg:grid-cols-3;
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
  }

  /* option title */
  .optionTitle {
    @apply text-center w-full;
  }
  .optionTitle.active {

  }
  .optionTitle.checked {

  }

  /* option specs */
  .optionSpecs {
    @apply flex flex-col items-center w-full mt-4 text-sm text-gray-500;
  }
</style>
