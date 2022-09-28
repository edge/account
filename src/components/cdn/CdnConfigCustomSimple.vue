<template>
  <div class="flex flex-col">
    <!-- path form -->
    <div class="path__form">
      <!-- asset path -->
      <div class="input-group flex-1 path">
        <label class="label">Asset path</label>
        <input
          v-model="v$.newPath.$model"
          class="input input--floating"
          placeholder="e.g. /photos/*.jpg"
          type="text"
          @keypress.enter=addPath
        />
        <ValidationError :errors="v$.newPath.$errors" />
      </div>
      <!-- cache enabled -->
      <div class="input-group flex-1 cache flex-shrink-0">
        <Listbox v-model="newPathEnabled">
          <ListboxLabel class="label">Cache enabled</ListboxLabel>
          <div class="relative w-full mt-1">
            <ListboxButton class="listButton input--floating">
              <span class="block truncate">{{ cacheEnabledDisplay }}</span>
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
                <ListboxOption v-slot="{ active, selected }" :value="undefined" as="template">
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
      </div>
      <!-- ttl -->
      <div class="input-group flex-1 ttl  flex-shrink-0">
        <label class="label">Cache TTL</label>
        <input
          type="number"
          autocomplete="off"
          class="w-full input input--floating"
          placeholder="Auto"
          v-model="v$.newPathTtl.$model"
          @keypress.enter=addPath
        />
        <ValidationError :errors="v$.newPathTtl.$errors" />
      </div>
      <!-- add button -->
      <button
        @click=addPath
        :disabled="!canAddPath"
        class="button button--success button--small"
      >
        <div v-if="addingPath" class="flex items-center">
          <span>Adding</span>
          <div><LoadingSpinner class="ml-1 w-4" /></div>
        </div>
        <span v-else>Add</span>
      </button>
    </div>
    <!-- path list -->
    <div class="flex flex-col mt-1 divide-y">
      <CdnConfigPath
        :path=globalPath
        @edit-global-config=onEditGlobalConfig
      />
      <CdnConfigPath v-for="path in paths"
        :key=path.path
        :path=path
        @delete-path=onDeletePath
        @edit-path=onEditPath
      />
    </div>
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
import CdnConfigPath from '@/components/cdn/CdnConfigPath.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/solid'
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'

export default {
  name: 'CdnConfigCustomSimple',
  components: {
    CdnConfigPath,
    CheckIcon,
    ChevronDownIcon,
    Listbox,
    ListboxButton,
    ListboxLabel,
    ListboxOption,
    ListboxOptions,
    LoadingSpinner,
    ValidationError
  },
  props: ['globalConfig', 'paths'],
  data() {
    return {
      addingPath: false,
      newPath: '',
      newPathEnabled: undefined,
      newPathTtl: undefined
    }
  },
  validations() {
    return {
      newPath: [
        validation.integrationPath
      ],
      newPathTtl : [
        validation.integrationTtl
      ]
    }
  },
  computed: {
    cacheEnabledDisplay() {
      if (this.newPathEnabled === undefined) return 'Auto'
      else return this.newPathEnabled ? 'True' : 'False'
    },
    canAddPath() {
      return !this.v$.newPath.$invalid &&
        !this.v$.newPathTtl.$invalid
    },
    globalPath() {
      return {
        path: '(global)',
        enabled: this.globalConfig.cache.enabled,
        ttl: this.globalConfig.cache.ttl
      }
    }
  },
  methods: {
    async addPath() {
      if (!this.canAddPath) return
      const path = {
        path: this.newPath
      }
      if(this.newPathEnabled !== undefined) path.enabled = this.newPathEnabled
      if(this.newPathTtl) path.ttl = this.newPathTtl
      this.$emit('add-path', path)
      this.newPath = ''
      this.newPathTtl = null
      this.newPathEnabled = undefined
      await this.v$.$reset()
    },
    onDeletePath(path) {
      this.$emit('delete-path', path)
    },
    onEditGlobalConfig(enabled, ttl) {
      this.$emit('edit-global-config', enabled, ttl)
    },
    onEditPath(oldPathName, newPath) {
      this.$emit('edit-path', oldPathName, newPath)
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>

<style scoped>
.path__form {
  @apply grid grid-cols-2 gap-x-4 gap-y-2 border-b pb-2;
  grid-template-rows: repeat(3, max-content);
}
.input-group.path {
  @apply col-span-2;
}
.input-group.cache {
}
.input-group.ttl {
}
.path__form .button {
  @apply w-full h-full col-span-2 mt-0;
}

.input-group.ttl input::placeholder {
  @apply text-gray-500
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


@screen lg {
  .path__form {
    @apply flex pb-0 border-b-0;
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
  .path__form .button {
    @apply w-20 h-full mt-4;
  }
}
</style>
