<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">Network region</RadioGroupLabel>
    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="os in operatingSystems"
        :key="os.name"
        :value="os"
        v-slot="{ active, checked, disabled }"
        :disabled="!os.enabled"
        @click="() => selectServerProperty({ property: 'os', value: os.name })"
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
          <div class="flex flex-col items-center w-full">
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
              <h4>{{os.name}}</h4>
            </RadioGroupLabel>
            <div class="w-full mt-2">
              <OperatingSystemOptions :versions=os.versions />
            </div>
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
import OperatingSystemOptions from "@/components/deploy/OperatingSystemOptions"

import { ref } from 'vue'
import useSWRV from 'swrv'
import { fetcher } from '../../utils/api'

import { mapMutations } from 'vuex'

export default {
  name: 'OperatingSystem',
  components: {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupDescription,
    RadioGroupOption,
    OperatingSystemOptions
  },
  methods: {
    ...mapMutations([
      'selectServerProperty'
    ])
  },
  setup() {
    const { data: operatingSystems, error } = useSWRV(() => '/os', fetcher)

    const selected = ref({})

    if (operatingSystems && operatingSystems.value) {
      selected.value = operatingSystems.value[0]
    }

    return {
      selected,
      operatingSystems
    }
  }
}
</script>

<style scoped>
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3;
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
