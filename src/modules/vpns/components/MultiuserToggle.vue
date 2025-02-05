<script setup>
import CheckIcon from '../../../components/icons/CheckIcon.vue'
import { RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { defineModel, defineProps } from 'vue'

defineProps({
  disabled: Boolean,
  singleUserDisabled: Boolean,
  multiuserDisabled: Boolean
})

const model = defineModel()
</script>

<template>
  <!-- Single/multi-user -->
  <RadioGroup v-model="model">
    <div class="box__grid mb-8">
      <RadioGroupOption as="template" :value="false" :disabled="disabled || singleUserDisabled" v-slot="{ active, checked, disabled }">
        <div :class="{ radioOption: true, active, checked, disabled }">
          <div :class="{ checkmark: true, active, checked }">
            <CheckIcon class="checkmark__icon" />
          </div>
          <div class="optionDetails">
            <RadioGroupLabel as="h4" class="optionDetails__name">
              Single-user VPN
            </RadioGroupLabel>
            <RadioGroupDescription as="span" class="optionDetails__description">
              <span>Ideal for individual use.</span>
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>

      <RadioGroupOption as="template" :value="true" :disabled="disabled || multiuserDisabled" v-slot="{ active, checked, disabled }">
        <div :class="{ radioOption: true, active, checked, disabled }">
          <div :class="{ checkmark: true, active, checked }">
            <CheckIcon class="checkmark__icon" />
          </div>
          <div class="optionDetails">
            <RadioGroupLabel as="h4" class="optionDetails__name">
              Multi-user VPN
            </RadioGroupLabel>
            <RadioGroupDescription as="span" class="optionDetails__description">
              <span>Multi-user VPN includes up to five users. You can pay for additional users.</span>
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>


<style scoped>
.box__grid {
  @apply mt-6 w-full grid grid-cols-1 gap-4;
  @apply sm:grid-cols-2 lg:grid-cols-2;
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

/* radio option details */
.optionDetails {
  @apply flex flex-col flex-1 text-sm;
}
.optionDetails__city {
  @apply text-sm text-gray-500;
}

/* checkmark */
.checkmark {
  @apply flex items-center justify-center text-white flex-shrink-0 rounded-full w-5 h-5 bg-gray-100 border border-gray-300;
}
.checkmark.active {
  @apply border-green border-opacity-40 bg-opacity-20;
}
.checkmark.checked {
  @apply border-green bg-green;
}
.checkmark .checkmark__icon {
  @apply opacity-0 w-3 h-3;
}
.checkmark.active .checkmark__icon {
  @apply opacity-40;
}
.checkmark.checked .checkmark__icon {
  @apply opacity-100;
}
</style>
