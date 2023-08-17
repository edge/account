<template>
  <Popover as='div' class="sort-menu">
    <PopoverButton>
      <div class="sort-menu__button">
        <SwitchVerticalIcon class="w-6 h-6 text-gray hover:text-green cursor-pointer float-right" />
      </div>
    </PopoverButton>
    <PopoverPanel class="sort-menu__items">
      <div class="px-1 py-2.5">
        <div
          v-for="(field) in fields" :key="field"
          @click="updateSort(field)"
          class="sort-menu__item"
        >
          <span>{{ field.label }}</span>
          <ArrowNarrowDownIcon v-if="isDesc(field)" class="w-4 h-4" />
          <ArrowNarrowUpIcon v-if="isAsc(field)" class="w-4 h-4" />
        </div>
      </div>
    </PopoverPanel>
  </Popover>
</template>

<script>
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon, SwitchVerticalIcon } from '@heroicons/vue/solid'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

export default {
  name: 'ListSortingMenu',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
    SwitchVerticalIcon,
    Popover,
    PopoverButton,
    PopoverPanel
  },
  props: ['fields', 'query'],
  methods: {
    isAsc(field) {
      return field.param === this.query
    },
    isDesc(field) {
      return `-${field.param}` === this.query
    },
    updateSort(field) {
      let newQuery = ''
      if (this.isAsc(field)) newQuery = undefined
      else if (this.isDesc(field)) newQuery = field.param
      else newQuery = `-${field.param}`
      this.$emit('update-sort', newQuery)
    }
  }
}
</script>

<style scoped>
.sort-menu {
  @apply relative w-max z-10;
  /* @apply absolute top-8 right-8; */
}
.sort-menu__button {
  @apply flex items-center p-2 bg-white rounded-md;
  @apply focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25;
}
.sort-menu__items {
  @apply absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5;
  @apply focus:outline-none;
}
.sort-menu__item {
  @apply group cursor-pointer flex rounded justify-between items-center w-full px-2 py-2.5 text-sm text-gray-600 hover:bg-gray-100;
}
/* .sort-menu__item:hover {
  @apply bg-gray-100;
} */
</style>
