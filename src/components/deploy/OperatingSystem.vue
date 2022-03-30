<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">OperatingSystem</RadioGroupLabel>

    <div v-if="operatingSystems === undefined">loading...</div>

    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="os in operatingSystems"
        :key="os.name"
        :value="os"
        v-slot="{ active, checked, disabled }"
        :disabled="!os.enabled"
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
              <h4>{{`${os.name.charAt(0).toUpperCase()}${os.name.substring(1)}`}}</h4>
            </RadioGroupLabel>
            <div class="w-full mt-2">
              <OperatingSystemOptions :versions=os.versions @os-changed="emitSelectedOsVersion" />
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

export default {
  name: 'OperatingSystem',
  components: {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupDescription,
    RadioGroupOption,
    OperatingSystemOptions
  },
  data() {
    return {
      os: null,
      operatingSystems: [],
      selected: null
    }
  },
  methods: {
    emitSelectedOsVersion(data) {
      this.$emit('os-changed', data)
    }
  },
  mounted() {
    const { data: operatingSystems, error } = useSWRV(() => '/os', fetcher)

    this.selected = ref(null)
    this.operatingSystems = operatingSystems

    setTimeout(() => {
      this.selected = operatingSystems && operatingSystems.value && operatingSystems.value[0]
    }, 1000)
  },
  watch: {
    selected(value) {
      if (value) {
        const { versions } = value
        this.$emit('os-changed', versions[0].id)
      }
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
