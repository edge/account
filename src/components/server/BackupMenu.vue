<template>
  <div class="w-full">
    <Menu as='div' class="relative w-full">
      <MenuButton class="flex items-center hidden sm:block">
        <CogIcon class="w-6" />
      </MenuButton>
      <MenuItems class="menu__items" :static="!sm">
        <MenuItem as="button"
          @click.prevent="restoreBackup"
          class="tableButton restore w-max text-green sm:hover:underline"
          :disabled="disableActions || balanceSuspend"
        >
          <div>
            <LoadingSpinner v-if=isRestoring class="tableButton__icon" />
            <RefreshIcon v-else class="tableButton__icon" />
          </div>
          <span v-if=isRestoring>Restoring</span>
          <span v-else>Restore</span>
        </MenuItem>
        <MenuItem as="button"
          @click.prevent="deleteBackup"
          class="tableButton delete w-max text-red sm:hover:underline"
          :disabled="disableActions"
        >
          <div>
            <LoadingSpinner v-if=isDeleting class="tableButton__icon" />
            <TrashIcon v-else class="tableButton__icon"/>
          </div>
          <span v-if=isDeleting>Deleting</span>
          <span v-else>Delete</span>
        </MenuItem>
      </MenuItems>
    </Menu>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { CogIcon, RefreshIcon, TrashIcon } from '@heroicons/vue/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

export default {
  name: 'UserMenu',
  components: {
    CogIcon,
    LoadingSpinner,
    Menu,
    MenuButton,
    MenuItems,
    MenuItem,
    RefreshIcon,
    TrashIcon
  },
  props: ['balanceSuspend', 'disableActions', 'isDeleting', 'isRestoring'],
  data() {
    return {
      windowWidth: window.innerWidth
    }
  },
  computed: {
    sm() {
      return this.windowWidth >= 640
    }
  },
  methods: {
    async deleteBackup() {
      this.$emit('delete-backup', this.backup)
    },
    onWindowResize() {
      this.windowWidth = window.innerWidth
    },
    async restoreBackup() {
      this.$emit('restore-backup', this.backup)
    }
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.onWindowResize)
  }
}
</script>
<style scoped>
.menu__items {
  @apply flex w-full space-x-2 justify-between
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

@screen sm {
  .menu__items {
    @apply flex flex-col space-x-0 space-y-2 pl-2 pr-3 py-2;
    @apply absolute right-0 top-8 z-10 w-max overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
  }

  .tableButton {
    @apply flex items-center w-full;
  }
  button:disabled, button:disabled .tableButton__icon {
    @apply text-gray-400 hover:no-underline;
  }
  .tableButton__icon {
    @apply w-4 mr-1;
  }
}

@media (max-width: 640px) {
  .tableButton {
    @apply button button--extraSmall w-1/2 leading-none;
  }
  .tableButton.restore {
    @apply button--success;
  }
  .tableButton.delete {
    @apply button--error;
  }
  .tableButton__icon {
    @apply w-3.5 mr-1;
  }
}

@media (max-width: 400px) {
  /* .recordList__fields-wrapper {
    @apply flex flex-col
  }
  .options {
    @apply col-span-1;
  } */
  .menu__items {
    @apply flex-col space-x-0 space-y-2;
  }
  .tableButton {
    @apply w-full;
  }
}

</style>
