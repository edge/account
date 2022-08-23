<template>
  <li class="recordList__item">
    <div class="recordList__field input-group type">
      <span class="recordList__header">Type</span>
      <!-- type -->
      <Listbox v-if=isEditing v-model="type" >
        <div class="relative w-full mt-1">
          <ListboxButton class="listButton">
            <span class="block truncate">{{ type }}</span>
            <span class="listButton__icon">
              <ChevronDownIcon class="w-5" aria-hidden="true" />
            </span>
          </ListboxButton>
          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions class="listOptions">
              <ListboxOption
                v-slot="{ active, selected }"
                v-for="type in types"
                :key="type"
                :value="type"
                as="template"
              >
                <li :class="[
                active ? 'active' : '',
                selected ? 'selected' : ''
              ]" class="listOption">
                  <span :class="['block truncate']">{{ type }}</span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
      <span v-else class="recordList__value">{{ record.type }}</span>
    </div>
    <!-- hostname -->
    <div class="recordList__field input-group name overflow-hidden">
      <span class="recordList__header">Hostname</span>
      <input v-if=isEditing
        autocomplete="off"
        class="w-full input input--floating"
        placeholder="Enter @ or hostname"
        required
        v-model="hostname"
      />
      <span v-else class="recordList__value">{{ record.name }}</span>
    </div>
    <!-- value -->
    <div class="recordList__field input-group value">
      <!-- records -->
      <span class="recordList__header">Value</span>
      <input v-if=isEditing
        autocomplete="off"
        class="w-full input input--floating"
        placeholder="Enter value"
        required
        v-model="value"
      />
      <span v-else class="recordList__value">{{ record.value }}</span>
    </div>
    <!-- ttl -->
    <div class="recordList__field input-group ttl">
      <span class="recordList__header">TTL</span>
      <input v-if=isEditing
        type="number"
        autocomplete="off"
        class="w-full input input--floating"
        placeholder="Enter TTL"
        required
        v-model="ttl"
      />
      <span v-else class="recordList__value">{{ record.ttl }}</span>
    </div>
    <!-- options -->
    <div class="recordList__field options justify-center">
      <div v-if=isEditing class="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2 sm:items-center">
        <button
          @click=toggleEditConfirmationModal
          class="tableButton save w-max"
        >
          <div><CheckIcon class="tableButton__icon sm:text-green sm:w-5" /></div>
          <span class="sm:hidden">Save</span>
        </button>
        <button
          @click=cancelEditing
          class="tableButton cancel w-max"
        >
          <div><XIcon class="tableButton__icon sm:text-red sm:w-5" /></div>
          <span class="sm:hidden">Cancel</span>
        </button>
      </div>
      <Popover v-else as='div' class="relative w-full">
        <PopoverButton class="flex items-center hidden sm:block">
          <CogIcon class="w-6" />
        </PopoverButton>
        <PopoverPanel :static="!sm" class="options__dropdown">
          <PopoverButton as='button'
            @click=startEditing
            class="tableButton edit w-max sm:hover:underline"
          >
            <div><PencilIcon class="tableButton__icon" /></div>
            Edit
          </PopoverButton>
          <PopoverButton as='button'
            @click=toggleDeleteConfirmationModal
            class="tableButton delete w-max text-red sm:hover:underline"
          >
            <div>
              <LoadingSpinner v-if=isDeleting class="tableButton__icon" />
              <TrashIcon v-else class="tableButton__icon" />
            </div>
            Delete
          </PopoverButton>
        </PopoverPanel>
      </Popover>
    </div>
  </li>
  <!-- eslint-disable-next-line vue/no-multiple-template-root-->
  <DeleteRecordConfirmation
    v-if=showDeleteConfirmationModal
    :record=record
    @modal-confirm=deleteRecord
    @modal-close=toggleDeleteConfirmationModal
  />
  <!-- eslint-disable-next-line vue/no-multiple-template-root-->
  <EditRecordConfirmation
    v-if=showEditConfirmationModal
    :record=record
    @modal-confirm=editRecord
    @modal-close=toggleEditConfirmationModal
  />
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import { ChevronDownIcon } from '@heroicons/vue/solid'
import DeleteRecordConfirmation from '@/components/confirmations/DeleteRecordConfirmation'
import EditRecordConfirmation from '@/components/confirmations/EditRecordConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import moment from 'moment'
import {
  CheckIcon,
  CogIcon,
  ExclamationIcon,
  PencilIcon,
  TrashIcon,
  XIcon
} from '@heroicons/vue/outline'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue'

export default {
  name: 'DomainRecordsListItem',
  components: {
    CheckIcon,
    ChevronDownIcon,
    CogIcon,
    DeleteRecordConfirmation,
    EditRecordConfirmation,
    ExclamationIcon,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    LoadingSpinner,
    PencilIcon,
    Popover,
    PopoverButton,
    PopoverPanel,
    TrashIcon,
    XIcon
  },
  data() {
    return {
      hostname: null,
      isDeleting: false,
      isEditing: false,
      showDeleteConfirmationModal: false,
      showEditConfirmationModal: false,
      showOptions: false,
      ttl: null,
      type: null,
      value: null,
      windowWidth: window.innerWidth
    }
  },
  props: ['record'],
  computed: {
    ...mapState(['config','session']),
    created() {
      const created = moment(this.record.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    },
    sm() {
      return this.windowWidth >= 640
    },
    types() {
      return this.config && this.config.dns.recordTypes
    }
  },
  methods: {
    toggleShowOptions() {
      this.showOptions = !this.showOptions
    },
    cancelEditing() {
      this.isEditing = false
    },
    async deleteRecord() {
      this.isDeleting = true
      this.toggleDeleteConfirmationModal()
      try {
        await utils.dns.deleteRecord(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.record.zone,
          this.record._key
        )
      }
      catch (error) {
        /** @todo handle error */
        console.error(error)
      }
      setTimeout(() => {
        this.isDeleting = false
      }, 800)
    },
    async editRecord() {
      this.toggleEditConfirmationModal()
      try {
        await utils.dns.editRecord(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.record.zone,
          this.record._key,
          {
            name: this.hostname,
            ttl: this.ttl,
            type: this.type,
            value: this.value
          }
        )
      }
      catch (error) {
        /** @todo handle error */
        console.error(error)
      }
      this.cancelEditing()
      // setTimeout(() => {
      //   this.isDeleting = false
      // }, 800)
    },
    onWindowResize() {
      this.windowWidth = window.innerWidth
    },
    startEditing() {
      this.hostname = this.record.name
      this.ttl = this.record.ttl
      this.type = this.record.type
      this.value = this.record.value
      this.isEditing = true
    },
    toggleDeleteConfirmationModal() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
    },
    toggleEditConfirmationModal() {
      this.showEditConfirmationModal = !this.showEditConfirmationModal
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
/* list item */
.recordList__item {
  @apply grid grid-cols-2 gap-2 bg-white text-gray-500 rounded-md w-full pl-5 py-3 pr-8;
}

/* list item content */
.recordList__field {
  @apply flex flex-col;
}
.recordList__header {
  @apply text-sm mr-2;
}
.recordList__value {
  @apply text-sm text-black truncate;
}
.type {
  @apply row-start-2;
}
.ttl {
  @apply col-start-2;
}
.options {
  @apply col-span-2;
}
.options__dropdown {
  @apply flex w-full space-x-2 justify-between
}

/* input styles */
.input-group .input--floating {
  @apply text-sm
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

/* button */
.listButton {
  @apply relative w-full text-sm text-left text-gray-600 bg-white border-b border-gray-400 cursor-default;
  @apply focus:outline-none focus:shadow-none focus:text-green focus:border-green;
  padding-bottom: 1px;
}
.listButton__icon {
  @apply absolute inset-y-0 right-0 flex items-center pointer-events-none text-gray-400;
}
/* options */
.listOptions {
  @apply absolute z-10 w-full mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
}
.listOption {
  @apply relative cursor-pointer p-2 pl-1 text-gray-900 cursor-default select-none;
}
.listOption.active, .listOption.selected {
  @apply text-green bg-green bg-opacity-5;
}

@screen sm {
  .recordList__item {
    @apply flex flex-row space-y-0 justify-between gap-x-4;
  }

  .type {
    @apply flex-shrink-0;
    flex-basis: 80px;
  }
  .name {
    @apply col-span-1 row-span-2 justify-center;
    flex-basis: 320px;
  }
  .value {
    flex-basis: 320px;
  }
  .ttl {
    @apply col-start-4 row-start-1 flex-shrink-0;
    flex-basis: 100px;
  }
  .options {
    @apply flex-shrink-0;
    flex-basis: 25px;
  }

  .options__dropdown {
    @apply flex flex-col space-x-0 space-y-2 pl-2 pr-4 py-2;
    @apply absolute right-0 top-8 z-10 w-max overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
  }
  .tableButton {
    @apply flex items-center;
  }
  .tableButton__icon {
    @apply w-4 mr-1;
  }
}

@media (max-width: 640px) {
  .tableButton {
    @apply button button--extraSmall w-1/2 leading-none;
  }
  .tableButton.edit, .tableButton.save {
    @apply button--success;
  }
  .tableButton.delete, .tableButton.cancel {
    @apply button--error;
  }
  .tableButton__icon {
    @apply w-3.5 mr-1;
  }
}

@media (max-width: 400px) {
  .recordList__item {
    @apply flex flex-col
  }
  .options {
    @apply col-span-1;
  }
  .options__dropdown {
    @apply flex-col space-x-0 space-y-2;
  }
  .tableButton {
    @apply w-full;
  }
}
</style>
