<template>
  <Listbox v-model="selectedSystem">
    <div class="relative w-full mt-1">
      <ListboxButton
        class="listButton"
      >
        <span class="block truncate">{{ selectedSystem.name }}</span>
        <span
          class="listButton__icon"
        >
          <ChevronDownIcon class="w-5 h-5" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="listOptions"
        >
          <ListboxOption
            v-slot="{ active, selected }"
            v-for="system in systems"
            :key="system.name"
            :value="system"
            as="template"
          >
            <li
              :class="[active ? 'active' : '']"
              class="listOption"
            >
              <span
                :class="[
                  'block truncate',
                ]"
                >{{ system.name }}</span
              >
              <span
                v-if="selected"
                class="checkmark"
              >
                <CheckIcon class="w-5 h-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script>
  import { ChevronDownIcon, CheckIcon } from "@heroicons/vue/solid"
  import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption, } from "@headlessui/vue"
  import { ref } from 'vue'
  export default {
    name: "OperatingSystemOptions",
    components: {
      CheckIcon,
      ChevronDownIcon,
      Listbox,
      ListboxLabel,
      ListboxButton,
      ListboxOptions,
      ListboxOption,
    },
    setup() {
      const systems = [
        { name: '20.04' },
        { name: '18.04 (LTS) x64' }
      ]
      const selectedSystem = ref(systems[0])

      return {
        systems,
        selectedSystem,
      }
    }
  }
</script>
<style scoped>
  /* button */
  .listButton {
    @apply relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md cursor-default;
    @apply focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25;
  }
  .listButton__icon {
    @apply absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400;
  }

  /* options */
  .listOptions {
    @apply absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
  }
  .listOption {
    @apply relative py-2 pl-10 pr-4 text-gray-900 cursor-default select-none;
  }
  .listOption.active {
    @apply text-green bg-green bg-opacity-5;
  }

  /* checkmark */
  .checkmark {
    @apply absolute inset-y-0 left-0 flex items-center pl-3 text-green;
  }
</style>