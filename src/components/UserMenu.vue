<template>
  <Menu as='div' class="menu">
    <MenuButton class="menu__button">
      <span class="w-full truncate">3333 3810 7877 31616</span>
      <ChevronDownIcon class="w-5 h-5 text-gray-400" />
    </MenuButton>
    <MenuItems class="menu__items">
      <div class="p-1">
        <MenuItem v-slot="{ active }">
          <button
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Menu item
          </button>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Menu item
          </button>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Menu item
          </button>
        </MenuItem>
      </div>
    </MenuItems>
  </Menu>
</template>

<script>
  import {ChevronDownIcon} from "@heroicons/vue/solid"
  import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue"
  export default {
    name: "UserMenu",
    components: {
      ChevronDownIcon,
      Menu,
      MenuButton,
      MenuItems,
      MenuItem,
    }
  }
</script>
<style scoped>
  .menu {
    @apply relative;
    /* @apply absolute top-8 right-8; */
  }
  .menu__button {
    @apply flex items-center p-3 space-x-1 bg-white border border-gray-300 rounded-md;
    @apply focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25;
  }
  .menu__items {
    @apply absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5;
    @apply focus:outline-none;
  }
  .menu__item {
    @apply group flex rounded items-center w-full px-2 py-2.5 text-sm text-gray-600;
  }
  .menu__item.active {
   @apply bg-gray-100; 
  }
</style>