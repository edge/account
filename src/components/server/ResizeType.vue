<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">Network region</RadioGroupLabel>
    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="spec in resizeTypes"
        :key="spec.title"
        :value="spec"
        v-slot="{ active, checked, disabled }"
        :disabled="!spec.enabled"
      >
        <div
          :class="[
            active
              ? 'active'
              : '',
            checked ? 'checked' : '',
            disabled ? 'disabled' : ''
          ]"
          class="radioOption"
        >
          <div class="flex flex-col w-full text-sm">
            <RadioGroupLabel
              as="div"
              class="optionTitle"
              :class="[
                active
                  ? 'active'
                  : '',
                checked ? 'checked' : '',
                disabled ? 'disabled' : ''
              ]"
            >
              <h4>{{ spec.title }}</h4>
            </RadioGroupLabel>
            <RadioGroupDescription
              as="div"
              class="optionSpecs"
            >
              <span class="">{{ spec.description }}</span>
              <!-- <span class="mt-2">{{ spec.cpu }} vCPU</span>
              <span>{{ spec.ram }}</span>
              <span>{{ spec.ssd }} SSD</span>
              <span>{{ spec.mbps }}</span> -->
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>
    </div>
    <span v-if="selected.id === 2" class="block mt-4 text-red">
      <span class="font-medium">Note:</span> Because your server's filesystem will be expanded, this resize is not reversible.
    </span>
  </RadioGroup>
</template>

<script>
import {
  RadioGroup,
  RadioGroupLabel,
  RadioGroupDescription,
  RadioGroupOption,
} from '@headlessui/vue'

import { ref, watch } from 'vue'
import useSWRV from 'swrv'
import { fetcher } from '../../utils/api'
import { mapMutations } from 'vuex'

export default {
  name: 'ResizeType',
  components: {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupDescription,
    RadioGroupOption,
  },
  methods: {
    ...mapMutations([
      'selectServerProperty'
    ]),
    setServerProperty: 'selectServerProperty'
  },
  setup() {

    const resizeTypes = [
      {
        id: 1,
        title: 'CPU and  RAM only',
        description: 'This will only increase or decrease the CPU and RAM of your server, not disk size. This can be reversed.',
        enabled: true
      },
      {
        id: 2,
        title: 'Disk, CPU and RAM',
        description: 'This will increase the disk size, CPU and RAM of your server. This is a permanent change and cannot be reversed.',
        enabled: true
      }
    ]

    const selected = ref(resizeTypes[0])

    watch(selected, newVal => {
      console.log('selected changed', newVal)
      // setServerProperty({ property: 'presetId', value: newVal.id })
    })
    

    return {
      selected,
      resizeTypes
    }
  }
}
</script>

<style scoped>
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2;
  }

  /* radio option */
  .radioOption {
    @apply relative flex space-x-3 items-start p-6 border border-gray-300 rounded-md cursor-pointer;
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
  .optionTitle h4 {
    @apply text-base font-medium;
  }
  .optionTitle.active {
    @apply border-green border-opacity-20;
  }
  .optionTitle.checked {
    @apply border-green border-opacity-40;
  }

  /* option specs */
  .optionSpecs {
    @apply flex flex-col lg:pr-5 xl:pr-10 items-center w-full mt-2 text-sm text-gray-500;
  }
</style>
