<template>
  <div class="flex space-x-6">
    <!-- asset path -->
    <div class="input-group flex-1 path">
      <label class="label">Asset path</label>
      <input
        v-model="name"
        class="input input--floating"
        :disabled="isDisabledTBD"
        :class="isDisabledTBD ? 'disabled' : ''"
        placeholder="e.g. /photos/*.jpg"
        type="text"
        required
      />
    </div>
    <!-- cache enabled -->
    <div class="input-group flex-1 cache">
      <ListboxLabel class="label">Cache enabled</ListboxLabel>
      <Listbox v-model="cacheEnabled">
        <div class="relative w-full mt-1">
          <ListboxButton class="listButton input--floating">
            <span class="block truncate">{{ cacheEnabled ? 'Yes' : 'No' }}</span>
            <span class="listButton__icon">
              <ChevronDownIcon class="w-5 h-5" aria-hidden="true" />
            </span>
          </ListboxButton>
          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions class="listOptions">
              <ListboxOption v-slot="{ active, selected }" :value="true" as="template">
                <li :class="[active ? 'active' : '']" class="listOption">
                  <span :class="['block truncate']">Yes</span>
                  <span v-if="selected" class="checkmark" >
                    <CheckIcon class="w-5 h-5" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>
              <ListboxOption v-slot="{ active, selected }" :value="false" as="template">
                <li :class="[active ? 'active' : '']" class="listOption">
                  <span :class="['block truncate']">No</span>
                  <span v-if="selected" class="checkmark" >
                    <CheckIcon class="w-5 h-5" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </div>
    <!-- ttl -->
    <div class="input-group flex-1 ttl">
      <label class="label">Cache TTL</label>
      <input
        type="number"
        autocomplete="off"
        class="w-full input input--floating"
        placeholder="Enter TTL"
        required
        v-model="ttl"
        @keypress="createOnEnter"
      />
      <!-- <div v-if="ttlError" class="errorMessage">
        <span class="errorMessage__text">{{ ttlError }}</span>
      </div> -->
    </div>
    <!-- add button -->
    <button
      @click.prevent="addDomain"
      :disabled="!canAddDomain"
      class="button button--success button--small h-full mt-4"
    >
      <div v-if="addingDomain" class="flex items-center">
        <span>Adding</span>
        <div><LoadingSpinner class="ml-1 w-4" /></div>
      </div>
      <span v-else>Add</span>
    </button>
  </div>
</template>

<script>
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/solid'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'

export default {
  name: 'CdnConfigCustomSimple',
  components: {
    CheckIcon,
    ChevronDownIcon,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions
  },
  data() {
    return {
      cacheEnabled: true,
      ttl: 3600
    }
  }
}
</script>

<style scoped>
.input-group.path {
  flex-basis: 350px;
}
.input-group.cache {
  flex-basis: 100px;
}
.input-group.ttl {
  flex-basis: 100px;
}

/* remove input defualt focus and arrows */
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

/* listbox button */
.listButton {
  @apply relative w-full text-left;
}
.listButton__icon {
  @apply absolute inset-y-0 right-0 flex items-center pointer-events-none text-gray-400;
}
/* listbox options */
.listOptions {
  @apply absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
}
.listOption {
  @apply relative cursor-pointer py-2 pl-10 pr-4 text-gray-900 cursor-default select-none;
}
.listOption.active {
  @apply text-green bg-green bg-opacity-5;
}
/* listbox checkmark */
.checkmark {
  @apply absolute inset-y-0 left-0 flex items-center pl-3 text-green;
}
</style>
