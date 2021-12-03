<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">Network region</RadioGroupLabel>

    <div v-if="regions === undefined">loading...</div>
    <div>{{selected}}</div>

    <div class="box__grid" v-if="regions">
      <RadioGroupOption
        as="template"
        v-for="region in regions"
        :key="region.name"
        :value="region"
        v-slot="{ active, checked, disabled }"
        :disabled="!region.enabled"
        @click="() => selectServerProperty({ property: 'serverRegion', value: region.name })"
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
          <div
            class="checkmark"
            :class="[
              active
                ? 'active'
                : '',
              checked ? 'checked' : ''
            ]"
          >
            <CheckIcon class="checkmark__icon" />
          </div>
          <div class="optionDetails">
            <RadioGroupLabel as="h4" class="optionDetails__country">
              {{region.name}}
            </RadioGroupLabel>
            <RadioGroupDescription as="span" class="optionDetails__city">
              <span>{{region.city}}</span>
            </RadioGroupDescription>
          </div>
          <img :src=region.image width="40" class="rounded-sm" />
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

import { CheckIcon } from '@heroicons/vue/outline'
import { ref } from 'vue'
import useSWRV from 'swrv'
import { fetcher } from '../../utils/api'

import { mapMutations } from 'vuex'

export default {
  name: 'NetworkRegion',
  components: {
    CheckIcon,
    RadioGroup,
    RadioGroupLabel,
    RadioGroupDescription,
    RadioGroupOption,
  },
  methods: {
    ...mapMutations([
      'selectServerProperty'
    ])
  },
  setup() {
    const { data: regions, error } = useSWRV(() => '/regions', fetcher)

    const selected = ref({})

    if (regions && regions.value) {
      // console.log('regions', regions.value)
      selected.value = regions.value[0]
    }

    return {
      selected,
      regions
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
