<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">Network region</RadioGroupLabel>
    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="spec in presets"
        :key="spec.price"
        :value="spec"
        v-slot="{ active, checked, disabled }"
        :disabled="!spec.enabled"
        @click="() => selectServerProperty({ property: 'presetId', value: spec.id })"
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
          <div class="flex flex-col items-center w-full text-sm">
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
              <h4 class="text-2xl">
                <sup><span class="inline-block text-sm leading-none">$</span></sup>{{ spec.price }}<span class="text-sm text-gray-600">/mo</span>
              </h4>
            </RadioGroupLabel>
            <RadioGroupDescription
              as="div"
              class="optionSpecs"
            >
              <span>{{ spec.name }}</span>
              <span>{{ spec.cpu }} vCPU</span>
              <span>{{ spec.ram }}</span>
              <span>{{ spec.ssd }} SSD</span>
              <span>{{ spec.mbps }}</span>
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>
    </div>
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
  name: 'ServerSpecs',
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
    const { data: presets, error } = useSWRV(() => '/presets', fetcher)

    const selected = ref(null)

    // Give the presets data a chance to load, then select the first
    // avaliable preset.
    setTimeout(() => {
      selected.value = presets.value[0]
    }, 1000)

    watch(selected, newVal => {
      console.log('selected changed', newVal)
      // setServerProperty({ property: 'presetId', value: newVal.id })
    })

    return {
      selected,
      presets
    }
  }
}
</script>

<style scoped>
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4;
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
  }
  .radioOption.disabled {
    @apply cursor-not-allowed opacity-50;
  }

  /* option title */
  .optionTitle {
    @apply text-center w-full pb-3 border-b border-gray-300;
  }
  .optionTitle.active {
    @apply border-green border-opacity-20;
  }
  .optionTitle.checked {
    @apply border-green border-opacity-40;
  }

  /* option specs */
  .optionSpecs {
    @apply flex flex-col items-center w-full mt-4 text-sm text-gray-500;
  }
</style>
