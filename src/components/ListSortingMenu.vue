<template>
  <Menu as='div' class="sort-menu">
    <MenuButton class="sort-menu__button">
      <SwitchVerticalIcon class="w-6 h-6 text-gray hover:text-green cursor-pointer float-right" />
    </MenuButton>
    <MenuItems class="sort-menu__items">
      <div class="px-1 py-2.5">
        <MenuItem v-for="(field, index) in fields" :key="field"
          v-slot="{ active }"
          class="sort-menu__item"
        >
          <div :class="active && 'active'" class="flex justify-between">
            <span>{{ field }}</span>
            <!-- <ArrowNarrowDownIcon v-if="index === 1" class="w-4 h-4" /> -->
          </div>
        </MenuItem>
      </div>
    </MenuItems>
  </Menu>
</template>

<script>
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon, SwitchVerticalIcon } from '@heroicons/vue/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

export default {
  name: 'ListSortingMenu',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
    SwitchVerticalIcon,
    Menu,
    MenuButton,
    MenuItems,
    MenuItem
  },
  props: ['fields']
}
</script>

<style scoped>
.sort-menu {
  @apply relative w-max;
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
  @apply group flex rounded items-center w-full px-2 py-2.5 text-sm text-gray-600;
}
.sort-menu__item.active {
  @apply bg-gray-100;
}
</style>
