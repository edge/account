<template>
  <RadioGroup v-model="selectedResizeType">
    <RadioGroupLabel class="sr-only">Resize type</RadioGroupLabel>
    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="resizeType in resizeTypes"
        :key="resizeType.title"
        :value="resizeType"
        v-slot="{ active, checked, disabled }"
        :disabled="!resizeType.enabled"
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
              <h4>{{ resizeType.title }}</h4>
            </RadioGroupLabel>
            <RadioGroupDescription
              as="div"
              class="optionSpecs"
            >
              <span class="">{{ resizeType.description }}</span>
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>
    </div>
    <span v-show="selectedResizeType && selectedResizeType.id === 2" class="block mt-4 text-red">
      <span class="font-medium">Note:</span> Because your server's filesystem will be expanded, this resize is not reversible.
    </span>
  </RadioGroup>
</template>

<script>
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'ResizeType',
  props: ['resizeTypes'],
  components: {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupDescription,
    RadioGroupOption
  },
  data() {
    return {
      selectedResizeType: null
    }
  },
  mounted() {
    this.selectedResizeType = this.resizeTypes[0]
  },
  watch: {
    selectedResizeType: function(data) {
      this.$emit('resize-type-changed', data)
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
