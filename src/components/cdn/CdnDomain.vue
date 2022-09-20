<template>
  <div class="py-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center flex-1">
        <div class="input-group w-full name" v-if=isEditing>
          <input
            v-model="v$.newDomainName.$model"
            class="input input--floating"
            placeholder="e.g. cdn.yoursite.com"
            type="text"
            @keypress="confirmEditOnEnter"
          />
        </div>
        <span v-else class="text-md">{{ domain.name }}</span>
        <span v-if="isPrimary" class="pl-2 text-gray">(Primary)</span>
      </div>
      <!-- options button -->
        <div class="w-20 options">
          <!-- confirm and cancel editing buttons -->
          <div v-if="isEditing" class="flex space-x-1 justify-center">
            <button
              @click=confirmEdit
              :disabled="!canConfirmEdit"
              class="domainButton save"
            >
              <div><CheckIcon class="domainButton__icon sm:text-green sm:w-5" /></div>
              <span class="sm:hidden">Save</span>
            </button>
            <button
              @click=cancelEdit
              class="domainButton cancel"
            >
              <div><XIcon class="domainButton__icon sm:text-red sm:w-5" /></div>
              <span class="sm:hidden">Cancel</span>
            </button>
          </div>
          <!-- edit and delete buttoins -->
          <Menu v-else as='div' class="relative w-full flex justify-center">
            <MenuButton class="flex items-center hidden sm:block">
              <DotsHorizontalIcon class="w-4" />
            </MenuButton>
            <MenuItems :static="!sm" class="options__dropdown">
              <MenuItem as='button'
                v-if="!isPrimary"
                @click=makePrimary
                class="domainButton primary w-max sm:hover:underline"
              >
                <div>
                  <SortAscendingIcon class="domainButton__icon" />
                </div>
                Make Primary
              </MenuItem>
              <MenuItem as='button'
                @click=startEdit
                class="domainButton edit w-max sm:hover:underline"
              >
                <div>
                  <PencilIcon class="domainButton__icon" />
                </div>
                Edit Domain
              </MenuItem>
              <MenuItem as='button'
                @click=deleteDomain
                class="domainButton delete w-max text-red sm:hover:underline"
              >
                <div>
                  <TrashIcon class="domainButton__icon" />
                </div>
                Delete
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
    </div>
    <ValidationError :errors="v$.newDomainName.$errors" />
  </div>
</template>

<script>
import * as validation from '../../utils/validation'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import {
  CheckIcon,
  DotsHorizontalIcon,
  PencilIcon,
  SortAscendingIcon,
  TrashIcon,
  XIcon
} from '@heroicons/vue/outline'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'

export default {
  name: 'CdnDomain',
  components: {
    CheckIcon,
    DotsHorizontalIcon,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    PencilIcon,
    SortAscendingIcon,
    TrashIcon,
    ValidationError,
    XIcon
  },
  props: ['domain'],
  data() {
    return {
      isEditing: false,
      newDomainName: '',
      windowWidth: window.innerWidth
    }
  },
  validations() {
    return {
      newDomainName: [
        validation.domain
      ]
    }
  },
  computed: {
    canConfirmEdit() {
      return !this.v$.newDomainName.$invalid
    },
    isPrimary() {
      return this.domain.primary
    },
    sm() {
      return this.windowWidth >= 640
    }
  },
  methods: {
    async cancelEdit() {
      await this.v$.$reset()
      this.isEditing = false
    },
    async confirmEdit() {
      await this.v$.$reset()
      this.$emit('edit-domain', this.domain.name, this.newDomainName.toLowerCase())
    },
    confirmEditOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.confirmEdit()
    },
    deleteDomain() {
      this.$emit('delete-domain', this.domain.name)
    },
    makePrimary() {
      this.$emit('make-domain-primary', this.domain.name)
    },
    onWindowResize() {
      this.windowWidth = window.innerWidth
    },
    startEdit() {
      this.isEditing = true
      this.newDomainName = this.domain.name
    }
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.onWindowResize)
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>

<style scoped>
.input-group.name .input--floating {
  @apply text-md leading-none;
}

.options {
  @apply col-span-3;
}
.options__dropdown {
  @apply flex w-full space-x-2 justify-between
}
@screen sm {
  .options {
    @apply row-start-1 col-start-5 col-span-1;
  }
  .options__dropdown {
    @apply flex flex-col space-x-0 space-y-2 pl-2 pr-3 py-2;
    @apply absolute right-8 top-8 z-10 w-max overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
  }
  .domainButton {
    @apply flex items-center;
  }
  button:disabled, button:disabled .domainButton__icon {
    @apply text-gray-400 hover:no-underline;
  }
  .domainButton__icon {
    @apply w-4 mr-1;
  }
}
</style>
