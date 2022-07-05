<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only">Network region</RadioGroupLabel>

    <!-- <div v-if="loading">Loading...</div> -->

    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="region in regions"
        :key="region.name"
        :value="region"
        v-slot="{ active, checked, disabled }"
        :disabled="region.status !== 'active' || isRegionAtCapacity(region)"
      >
        <div
          :class="[
            active ? 'active' : '',
            checked ? 'checked' : '',
            disabled ? 'disabled' : ''
          ]"
          class="radioOption"
        >
          <div
            class="checkmark"
            :class="[
              active ? 'active' : '',
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
          <img :src='flagSrc' width="40" class="rounded-sm" />
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import { CheckIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'NetworkRegion',
  components: {
    CheckIcon,
    RadioGroup,
    RadioGroupLabel,
    RadioGroupDescription,
    RadioGroupOption
  },
  data() {
    return {
      loaded: false,
      regions: [],
      selected: null
    }
  },
  computed: {
    ...mapState(['session']),
    flagSrc() {
      return 'https://hatscripts.github.io/circle-flags/flags/gb.svg'
      // return `https://hatscripts.github.io/circle-flags/flags/${region.flag}.svg`
    }
  },
  methods: {
    isRegionAtCapacity(region) {
      const capacity = region.capacity
      const usage = region.usage
      for (const spec in capacity) {
        if (usage[spec] >= capacity[spec]) return true
      }
      return false
    },
    async updateRegions() {
      const regions = await utils.region.getRegions(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key
      )
      this.regions = regions.results
      // pre-select first active region
      this.selected = regions.results.find(region => region.status === 'active')
    }
  },
  mounted() {
    this.updateRegions()
  },
  watch: {
    selected(region) {
      this.$emit('region-changed', region)
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
