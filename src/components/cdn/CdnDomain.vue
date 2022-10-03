<template>
  <div class="py-2" :class="isEditing ? 'editing' : ''">
    <div class="domain">
      <!-- domain name -->
      <div class="flex items-center flex-1 truncate w-full">
        <div class="input-group w-full name" v-if=isEditing>
          <input
            v-model="v$.newDomainName.$model"
            class="input input--floating"
            placeholder="e.g. cdn.yoursite.com"
            type="text"
            @keypress.enter=confirmEdit
          />
        </div>
        <span v-else class="text-md truncate">{{ domain.name }}</span>
        <span v-if="isPrimary && sm" class="pl-2 text-gray">(Primary)</span>
      </div>
      <!-- options button -->
      <div class="options" :class="isEditing ? 'editing' : ''">
        <!-- confirm and cancel editing buttons -->
        <div v-if="isEditing" class="editingButtons flex space-x-1 justify-center">
          <button
            @click=confirmEdit
            :disabled="!canConfirmEdit"
            class="domainButton save"
          >
            <div><CheckIcon class="domainButton__icon save" /></div>
            <span class="domainButton__text">Save</span>
          </button>
          <button
            @click=cancelEdit
            class="domainButton cancel"
          >
            <div><XIcon class="domainButton__icon cancel" /></div>
            <span class="domainButton__text">Cancel</span>
          </button>
        </div>
        <!-- edit and delete buttoins -->
        <Menu v-else as='div' class="relative w-full flex justify-center">
          <MenuButton class="flex items-cente block">
            <DotsHorizontalIcon class="w-4" />
          </MenuButton>
          <MenuItems class="options__dropdown">
            <MenuItem as='button'
              v-if="!isPrimary"
              @click=makePrimary
              class="domainButton primary w-max"
            >
              <div>
                <SortAscendingIcon class="domainButton__icon" />
              </div>
              Make Primary
            </MenuItem>
            <MenuItem as='button'
              @click=startEdit
              class="domainButton edit w-max"
            >
              <div>
                <PencilIcon class="domainButton__icon" />
              </div>
              Edit Domain
            </MenuItem>
            <MenuItem as='button'
              @click=deleteDomain
              class="domainButton delete w-max text-red"
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
    <ValidationError v-if=newDomainName :errors="v$.newDomainName.$errors" />
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
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
      return this.windowWidth >= 450
    }
  },
  methods: {
    async cancelEdit() {
      await this.v$.$reset()
      this.isEditing = false
    },
    async confirmEdit() {
      if (!this.canConfirmEdit) return
      await this.v$.$reset()
      this.$emit('edit-domain', this.domain.name, this.newDomainName.toLowerCase())
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
.domain {
  @apply flex items-center justify-between space-x-2
}

.input-group.name .input--floating {
  @apply text-md leading-none;
}
.options {
  @apply w-10;
}
.options__dropdown {
  @apply flex flex-col space-x-0 space-y-2 pl-2 pr-3 py-2;
  @apply absolute right-8 top-8 z-10 w-max overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-green ring-opacity-5 focus:outline-none text-sm;
}
.domainButton {
  @apply flex items-center hover:underline;
}
button:disabled, button:disabled .domainButton__icon {
  @apply text-gray-400 hover:no-underline;
}
.domainButton__icon {
  @apply w-4 mr-1;
}
.domainButton__icon.save {
  @apply text-green;
}
.domainButton__icon.cancel {
  @apply text-red;
}
.domainButton__text {
  @apply hidden;
}

@media (min-width: 450px) {
  .options {
    @apply w-20;
  }
}


@media (max-width: 450px) {
  .editing .domain {
    @apply flex-col space-x-0 space-y-2;
  }
  .editing .options {
    @apply w-full
  }
  .editing .domainButton {
    @apply button button--extraSmall w-1/2 leading-none;
  }
  .editing .domainButton.save {
    @apply button--success
  }
  .editing .domainButton.cancel {
    @apply button--error
  }
  .editing .domainButton__icon {
    @apply w-3.5 mr-1;
  }
  .editing .domainButton__icon.save {
    @apply text-white;
  }
  .editing .domainButton__icon.cancel {
    @apply text-white;
  }
  .editing .domainButton__text {
    @apply block;
  }
}
@media (max-width: 300px) {
  .editingButtons {
    @apply flex-col space-x-0 space-y-2
  }
  .editing .domainButton {
    @apply w-full
  }
}
</style>
