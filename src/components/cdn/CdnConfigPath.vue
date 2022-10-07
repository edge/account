<template>
  <div class="py-4 lg:py-2">
    <div class="path__item">
      <!-- asset path -->
      <div class="input-group flex-1 path" :class="isGlobal ? '' : 'self-end'">
        <label class="text-xs lg:hidden">Asset path</label>
        <!-- editing -->
        <input v-if="isEditing && !isGlobal"
          v-model="v$.newPath.$model"
          class="input input--floating"
          placeholder="e.g. /photos/*.jpg"
          type="text"
          @keypress.enter=confirmEdit
        />
        <!-- not editing -->
        <span v-else class="text-md">{{ path.path }}</span>
      </div>
      <!-- cache enabled -->
      <div class="input-group flex-1 flex-shrink-0 cache self-end">
        <label class="text-xs lg:hidden">Cache enabled</label>
        <!-- editing -->
        <Listbox v-if=isEditing v-model="newEnabled">
          <div class="relative w-full mt-1">
            <ListboxButton class="listButton input--floating">
              <span class="block truncate">{{ newCacheEnabledDisplay }}</span>
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
                <ListboxOption v-slot="{ active, selected }" v-if="!isGlobal" :value="undefined" as="template">
                  <li :class="[active ? 'active' : '']" class="listOption">
                    <span :class="['block truncate']">Auto</span>
                    <span v-if="selected" class="checkmark" >
                      <CheckIcon class="w-5 h-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
                <ListboxOption v-slot="{ active, selected }" :value="true" as="template">
                  <li :class="[active ? 'active' : '']" class="listOption">
                    <span :class="['block truncate']">True</span>
                    <span v-if="selected" class="checkmark" >
                      <CheckIcon class="w-5 h-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
                <ListboxOption v-slot="{ active, selected }" :value="false" as="template">
                  <li :class="[active ? 'active' : '']" class="listOption">
                    <span :class="['block truncate']">False</span>
                    <span v-if="selected" class="checkmark" >
                      <CheckIcon class="w-5 h-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
        <!-- not editing -->
        <span v-else class="text-md"
          :class="cacheEnabledDisplay === 'Auto' ? 'text-gray-500' : ''"
        >
          {{ cacheEnabledDisplay }}
        </span>
      </div>
      <!-- ttl -->
      <div class="input-group flex-1  flex-shrink-0 ttl self-end">
        <label class="text-xs lg:hidden">Cache TTL</label>
        <!-- editing -->
        <input
          v-if=isEditing
          type="number"
          autocomplete="off"
          class="w-full input input--floating"
          :placeholder="isGlobal ? 'Enter TTL' : 'Auto'"
          v-model="v$.newTtl.$model"
          @keypress.enter=confirmEdit
        />
        <!-- not editing -->
        <span v-else
          class="text-md"
          :class="path.ttl ? '' : 'text-gray-500'"
        >
          {{ path.ttl || 'Auto' }}
        </span>
      </div>
      <!-- options button -->
      <div class="w-20 options">
        <!-- confirm and cancel editing buttons -->
        <div v-if="isEditing" class="editingButtons flex space-x-1 justify-center">
          <button
            @click=confirmEdit
            :disabled="!canConfirmEdit"
            class="pathButton save"
          >
            <div><CheckIcon class="pathButton__icon lg:text-green lg:w-5" /></div>
            <span class="lg:hidden">Save</span>
          </button>
          <button
            @click=cancelEdit
            class="pathButton cancel"
          >
            <div><XIcon class="pathButton__icon lg:text-red lg:w-5" /></div>
            <span class="lg:hidden">Cancel</span>
          </button>
        </div>
        <!-- edit and delete buttoins -->
        <Menu v-else as='div' class="relative w-full flex justify-center">
          <MenuButton class="flex items-center hidden lg:block">
            <DotsHorizontalIcon class="w-4" />
          </MenuButton>
          <MenuItems :static="!lg" class="options__dropdown">
            <MenuItem as='button'
              @click=startEdit
              :disabled=disableControls
              class="pathButton edit w-max lg:hover:underline"
            >
              <div>
                <PencilIcon class="pathButton__icon" />
              </div>
              Edit
            </MenuItem>
            <MenuItem as='button'
              v-if="!isGlobal"
              @click=deletePath
              :disabled=disableControls
              class="pathButton delete w-max text-red lg:hover:underline"
            >
              <div>
                <TrashIcon class="pathButton__icon" />
              </div>
              Delete
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
    <ValidationError v-if="!isGlobal" :errors="v$.newPath.$errors" />
    <ValidationError :errors="v$.newTtl.$errors" />
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
import ValidationError from '@/components/ValidationError.vue'
import { helpers } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import {
  CheckIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XIcon
} from '@heroicons/vue/outline'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'CdnConfigPath',
  props: ['disableControls', 'path', 'paths'],
  components: {
    CheckIcon,
    ChevronDownIcon,
    DotsHorizontalIcon,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    PencilIcon,
    TrashIcon,
    ValidationError,
    XIcon
  },
  validations() {
    return {
      newPath: {
        path: validation.integrationPath,
        duplicate: helpers.withMessage(
          'Path already exists',
          v => !this.isDuplicatePath(v)
        )
      },
      newTtl : {
        ttl: helpers.withMessage(
          `Minimum TTL is ${this.config.cdn.minimumTTL}`,
          v => validation.isValidTtl(v, this.config.cdn.minimumTTL, this.isGlobal)
        )
      }
    }
  },
  data() {
    return {
      isEditing: false,
      newEnabled: null,
      newPath: '',
      newTtl: null,
      windowWidth: window.innerWidth
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['config', 'session']),
    cacheEnabledDisplay() {
      if (this.path.enabled === undefined) {
        if (this.isGlobal) return 'True'
        else return 'Auto'
      }
      else return this.path.enabled ? 'True' : 'False'
    },
    canConfirmEdit() {
      return (this.isGlobal || !this.v$.newPath.$invalid) &&
        !this.v$.newTtl.$invalid &&
        !this.isDuplicatePath(this.newPath)
    },
    isGlobal() {
      return this.path.path === '(global)'
    },
    newCacheEnabledDisplay() {
      if (this.newEnabled === undefined) {
        if (this.isGlobal) return 'True'
        else return 'Auto'
      }
      else return this.newEnabled ? 'True' : 'False'
    },
    lg() {
      return this.windowWidth >= 1024
    }
  },
  methods: {
    async cancelEdit() {
      this.isEditing = false
      await this.v$.$reset()
    },
    async confirmEdit() {
      if (!this.canConfirmEdit) return
      if (this.isGlobal) {
        this.$emit('edit-global-config', this.newEnabled, this.newTtl)
      }
      else {
        const newPath = {
          path: this.newPath
        }
        if (this.newEnabled !== undefined) newPath.enabled = this.newEnabled
        if (this.newTtl) newPath.ttl = this.newTtl
        this.$emit('edit-path', this.path.path, newPath)
      }
      this.isEditing = false
      await this.v$.$reset()
    },
    deletePath() {
      this.$emit('delete-path', this.path.path)
    },
    isDuplicatePath(newPathName) {
      return this.paths.some(path => this.path.path !== path.path && path.path === newPathName)
    },
    onWindowResize() {
      this.windowWidth = window.innerWidth
    },
    startEdit() {
      this.isEditing = true
      this.newTtl = this.path.ttl
      this.newEnabled = this.path.enabled
      this.newPath = this.path.path
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
.path__item {
  @apply grid grid-cols-2 gap-x-4 gap-y-2;
  grid-template-rows: repeat(3, max-content);
}
.input-group.path {
  @apply col-span-2;
}
.input-group.cache {
}
.input-group.ttl {
}
.options {
  @apply row-start-3 col-span-2 w-full;
}

@screen lg {
  .path__item {
    @apply flex items-center;
  }
  .input-group.path {
    flex-basis: 350px;
  }
  .input-group.cache {
    flex-basis: 100px;
  }
  .input-group.ttl {
    flex-basis: 100px;
  }
  .options {
    @apply w-20;
  }
}

.input-group.ttl input::placeholder {
  @apply text-gray-500
}
.input-group.path .input--floating,
.input-group.cache .input--floating,
.input-group.ttl .input--floating {
  @apply text-md
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

.options__dropdown {
  @apply flex w-full space-x-2 justify-between
}
.pathButton__icon {
  @apply w-4 mr-1;
}

@screen lg {
  .options__dropdown {
    @apply flex flex-col space-x-0 space-y-2 pl-2 pr-3 py-2;
    @apply absolute right-8 top-8 z-10 w-max overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
  }
  .pathButton {
    @apply flex items-center;
  }
  button:disabled, button:disabled .pathButton__icon {
    @apply text-gray-400 hover:no-underline;
  }
}

@media (max-width: 1024px) {
  .pathButton {
    @apply button button--extraSmall w-1/2 leading-none;
  }
  .pathButton.edit, .pathButton.save {
    @apply button--success
  }
  .pathButton.delete, .pathButton.cancel {
    @apply button--error
  }
  .pathButton__icon {
    @apply w-3.5 mr-1;
  }
}

@media (max-width: 300px) {
  .options__dropdown, .editingButtons {
    @apply flex-col space-x-0 space-y-2
  }
  .pathButton {
    @apply w-full;
  }
}
</style>
