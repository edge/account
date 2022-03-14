<template>
  <Menu v-if="!activeTask" as='div' class="menu">
    <MenuButton class="menu__button">
      <span class="w-full truncate">More</span>
      <ChevronDownIcon class="w-6 h-6" />
    </MenuButton>
    <MenuItems class="menu__items">
      <div class="p-1">
        <MenuItem v-slot="{ active }">
          <button
            @click.prevent="restoreBackup"
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Restore
          </button>
        </MenuItem>
        <!-- <MenuItem v-slot="{ active }">
          <button
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Edit
          </button>
        </MenuItem> -->
        <MenuItem v-slot="{ active }">
          <button
          @click.prevent="deleteBackup"
            :class="[
              'menu__item menu__item--delete',
              active ? 'active' : ''
            ]"
          >
            Delete
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
    },
    props: ['activeTask', 'backup'],
    methods: {
      async deleteBackup() {
        this.$emit('delete-backup', this.backup)
      },
      async restoreBackup() {
        this.$emit('restore-backup', this.backup)
      }
    }
  }
</script>
<style scoped>
  .menu {
    @apply relative;
    /* @apply absolute top-8 right-8; */
  }
  .menu__button {
    @apply flex items-center text-green;
    @apply focus:outline-none;
  }
  .menu__items {
    @apply absolute transform right-0 w-32 mt-1 z-10 origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5;
    @apply focus:outline-none;
  }
  .menu__item {
    @apply group flex rounded items-center w-full px-2 py-1.5 text-sm justify-center text-gray-600;
  }
  .menu__item.active {
   @apply bg-gray-100; 
  }
  .menu__item--delete {
    @apply text-red-500;
  }
</style>