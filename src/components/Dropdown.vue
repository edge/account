<script setup>
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/solid'
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'

const model = defineModel()

defineProps({
  label: undefined,
  // Must be an object of { [key]: "value" }
  options: undefined
})
</script>

<template>
  <Listbox class="listBox" as="div" v-model="model">
    <ListboxLabel v-if="label" class="label">{{ label }}</ListboxLabel>
    <slot name="button">
      <ListboxButton class="listButton">
        <span class="block truncate">{{ (options && options[model]) || model || 'Select' }}</span>
        <span class="listButton__icon">
          <ChevronDownIcon class="w-5 h-5" aria-hidden="true" />
        </span>
      </ListboxButton>
    </slot>
    <transition
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ListboxOptions class="listOptions">
        <slot>
          <ListboxOption
            v-for="(option, key) in options"
            :key="key"
            :value="key"
            v-slot="{ active, selected }"
            as="template"
          >
            <li :class="{active, listOption: true}">
              <span class="block truncate">{{ option }}</span>
              <span v-if="selected" class="checkmark" >
                <CheckIcon class="w-5 h-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </slot>
      </ListboxOptions>
    </transition>
  </Listbox>
</template>

<style scoped>
/* listbox button */
.listButton {
  @apply relative w-full py-2 pl-3 pr-10 text-left bg-white border-b border-gray-400 cursor-pointer;
  @apply focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25;
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
