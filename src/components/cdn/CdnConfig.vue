<template>
  <div class="box">
    <h4>Configuration</h4>
    <div>
      <RadioGroup v-model="mode">
        <!-- default config -->
        <RadioGroupOption v-slot="{ checked }" value="default" class="cursor-pointer">
          <div class="flex items-center space-x-2">
            <div class="checkmark"
              :class="[
                active ? 'active' : '',
                checked ? 'checked' : ''
              ]"
            ><CheckIcon class="checkmark__icon" /></div>
            <span class="text-lg">Default settings</span>
          </div>
          <div class="flex flex-col space-y-1 text-gray-500 pl-7">
            <span>Caching enabled for all asset types</span>
            <span>Cache TTL 3600</span>
          </div>
        </RadioGroupOption>
        <!-- custom config -->
        <RadioGroupOption v-slot="{ checked }" value="custom" class="cursor-pointer mt-2">
          <div class="flex items-center space-x-2">
            <div class="checkmark"
              :class="[
                active ? 'active' : '',
                checked ? 'checked' : ''
              ]"
            ><CheckIcon class="checkmark__icon" /></div>
            <span class="text-lg">Custom configuration</span>
          </div>
        </RadioGroupOption>
        <CdnConfigCustom v-if="mode === 'custom'" />
      </RadioGroup>
    </div>
  </div>
</template>

<script>
import CdnConfigCustom from '@/components/cdn/CdnConfigCustom.vue'
import {
  RadioGroup,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'CdnConfig',
  components: {
    CdnConfigCustom,
    RadioGroup,
    RadioGroupOption
  },
  data() {
    return {
      mode: 'default'
    }
  }
}
</script>

<style scoped>
/* checkmark */
.checkmark {
  @apply flex items-center justify-center text-white flex-shrink-0 rounded-full w-4 h-4 bg-gray-100 border border-gray-300;
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
