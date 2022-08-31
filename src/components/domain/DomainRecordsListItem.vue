<template>
  <li class="recordList__item">
    <div class="recordList__fields-wrapper">
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
        <span class="recordList__header">{{ nameLabel.label }}</span>
        <div class="flex">
          <input v-if=isEditing
            autocomplete="off"
            class="w-full input input--floating"
            :placeholder="nameLabel.placeholder"
            required
            v-model="hostname"
          />
          <span v-else class="recordList__value">{{ record.name }}</span>
          <span
            class="border-gray-400 text-black"
            :class="isEditing ? 'border-b text-gray-400' : ''"
          >
            {{ record.name ? '.' : ''}}{{ domainName }}
          </span>
        </div>
        <div v-if="isEditing && hostnameError" class="errorMessage">
          <span class="errorMessage__text">{{ hostnameError }}</span>
        </div>
      </div>
      <!-- value -->
      <div class="recordList__field input-group value">
        <!-- records -->
        <span class="recordList__header">{{ valueLabel.label }}</span>
        <input v-if=isEditing
          autocomplete="off"
          class="w-full input input--floating"
          :placeholder="valueLabel.placeholder"
          required
          v-model="value"
        />
        <span v-else class="recordList__value">{{ record.value }}</span>
        <div v-if="isEditing && valueError" class="errorMessage">
          <span class="errorMessage__text">{{ valueError }}</span>
        </div>
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
        <div v-if="!template">
          <div v-if=isEditing class="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2 sm:items-center">
            <button
              @click=confirmEditRecord
              class="tableButton save w-max"
              :disabled="!canConfirmEdit"
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
      </div>
    </div>

    <!-- synced records warning -->
    <div v-if="displaySyncRecordsWarning" class="mt-2 bg-gray-300 rounded text-black p-2">
      <div class="float-left"><InformationCircleIcon class="w-4 mr-1 mt-0.5" /></div>
      <!-- eslint-disable-next-line max-len -->
      <span>The current TTL for {{ type }} {{ hostname }} is {{ syncRecordsTTL }} and changing it will update {{ syncRecordsCount }} other record{{ syncRecordsCount > 1 ? 's' : '' }}.</span>
    </div>
    <!-- http error -->
    <div v-if="httpError" class="mt-2 bg-gray-300 rounded p-2">
      <HttpError :error=httpError />
    </div>
  </li>
  <!-- eslint-disable-next-line vue/no-multiple-template-root-->
  <DeleteRecordConfirmation
    v-if=showDeleteConfirmationModal
    :record=record
    @modal-confirm=deleteRecord
    @modal-close=toggleDeleteConfirmationModal
  />
</template>

<script>
/* global process */

import * as regex from '@/utils/regex'
import * as utils from '@/account-utils'
import { ChevronDownIcon } from '@heroicons/vue/solid'
import DeleteRecordConfirmation from '@/components/confirmations/DeleteRecordConfirmation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import moment from 'moment'
import {
  CheckIcon,
  CogIcon,
  InformationCircleIcon,
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
    HttpError,
    InformationCircleIcon,
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
      hostnameError: '',
      httpError: null,
      isDeleting: false,
      isEditing: false,
      showDeleteConfirmationModal: false,
      syncRecordsCount: null,
      syncRecordsTTL: null,
      ttl: 3600,
      type: null,
      value: null,
      valueError: '',
      windowWidth: window.innerWidth
    }
  },
  props: ['record', 'template'],
  computed: {
    ...mapState(['config','session']),
    canConfirmEdit() {
      return this.hostname && !this.hostnameError && this.ttl && this.type && this.value && !this.valueError
    },
    created() {
      const created = moment(this.record.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    },
    displaySyncRecordsWarning() {
      return this.canConfirmEdit && this.syncRecordsCount && this.syncRecordsTTL !== this.ttl
    },
    domainName() {
      return this.record.zone
    },
    hasEdited() {
      return this.hostname !== this.record.name ||
        this.ttl !== this.record.ttl ||
        this.type !== this.record.type ||
        this.value !== this.record.value
    },
    nameLabel() {
      const type = this.isEditing ? this.type : this.record.type
      if (type === 'PTR') return {
        label: 'IPv4 Address',
        placeholder: 'Enter IP address'
      }
      else return {
        label: 'Hostname',
        placeholder: 'Enter @ or hostname'
      }
    },
    sm() {
      return this.windowWidth >= 640
    },
    types() {
      return this.config && this.config.dns.recordTypes
    },
    valueLabel() {
      const type = this.isEditing ? this.type : this.record.type
      if (type === 'A') return {
        label: 'IPv4 Address',
        placeholder: 'Enter IP address'
      }
      else if (type === 'AAAA') return {
        label: 'IPv6 Address',
        placeholder: 'Enter IP address'
      }
      else if (type === 'NS') return {
        label: 'Nameserver',
        placeholder: 'Enter nameserver'
      }
      else if (['ALIAS', 'CNAME', 'MX', 'PTR'].includes(type)) return {
        label: 'Target',
        placeholder: 'Enter target'
      }
      else return {
        label: 'Value',
        placeholder: 'Enter value'
      }
    }
  },
  methods: {
    cancelEditing() {
      this.resetEditForm()
      this.isEditing = false
    },
    async confirmEditRecord() {
      this.httpError = null
      if(!this.hasEdited) this.cancelEditing()
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
        this.$emit('updateRecords')
        this.cancelEditing()
      }
      catch (error) {
        this.httpError = error
      }
    },
    async deleteRecord() {
      this.httpError = null
      this.isDeleting = true
      this.toggleDeleteConfirmationModal()
      try {
        await utils.dns.deleteRecord(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.record.zone,
          this.record._key
        )
        this.$emit('updateRecords')
      }
      catch (error) {
        this.httpError = error
      }
      this.isDeleting = false
    },
    async getSyncRecords() {
      const { results, metadata} = await utils.dns.getRecords(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.domainName,
        {
          limit: 1,
          name: this.hostname || '',
          type: this.type
        }
      )
      // eslint-disable-next-line max-len
      if (this.record.name === this.hostname && this.record.type === this.type) this.syncRecordsCount = metadata.totalCount - 1
      else this.syncRecordsCount = metadata.totalCount

      this.syncRecordsTTL = results.length ? results[0].ttl : null
    },
    onWindowResize() {
      this.windowWidth = window.innerWidth
    },
    resetEditForm() {
      this.hostnameError = null
      this.valueError = null
      this.httpError = null
      this.hostname = ''
      this.ttl = 3600
      this.type = null
      this.value = ''
    },
    async startEditing() {
      this.httpError = null
      this.hostname = this.record.name
      this.ttl = this.record.ttl
      this.type = this.record.type
      this.value = this.record.value
      await this.getSyncRecords()
      this.isEditing = true
    },
    toggleDeleteConfirmationModal() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
    },
    validateHostname() {
      let error = ''
      if (this.type === 'PTR' && !regex.ipv4.test(this.hostname)) error = 'Please enter a valid IPv4 address'
      else if (this.hostname === '@') error = ''
      // eslint-disable-next-line max-len
      else if (this.hostname && !regex.recordName.test(this.hostname) && !this.hostname !== '@') error = 'Please enter a valid hostname'
      else if (!this.hostname) error = 'Please enter a hostname'
      else error = ''
      this.hostnameError = error
    },
    validateValue() {
      let error = ''
      if (this.type === 'A') {
        if (!regex.ipv4.test(this.value)) error = 'Please enter a valid IPv4 address'
      }
      else if (this.type === 'AAAA') {
        if (!regex.ipv6.test(this.value)) error = 'Please enter a valid IPv6 address'
      }
      else if (['ALIAS', 'CNAME', 'MX', 'NS', 'PTR'].includes(this.type)) {
        if (!regex.fqdn.test(this.value)) error = 'Please enter a valid FQDN'
      }
      else if (!this.value) error = 'Please enter a value'
      this.valueError = error
    }
  },
  emits: ['updateRecords'],
  mounted() {
    window.addEventListener('resize', this.onWindowResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.onWindowResize)
  },
  watch: {
    hostname() {
      this.httpError = null
      this.getSyncRecords()
      this.validateHostname()
    },
    ttl() {
      this.httpError = null
    },
    type() {
      this.httpError = null
      this.getSyncRecords()
      this.validateHostname()
      this.validateValue()
    },
    value() {
      this.httpError = null
      this.validateValue()
    }
  }
}
</script>
<style scoped>
/* list item */
.recordList__item {
  @apply flex flex-col bg-white text-gray-500 rounded-md w-full pl-5 py-3 pr-8;
}

.recordList__fields-wrapper {
  @apply grid grid-cols-2 gap-2;
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
  .recordList__fields-wrapper {
    @apply flex flex-row space-y-0 justify-between gap-x-4;
  }

  .type {
    @apply flex-shrink-0;
    flex-basis: 80px;
  }
  .name {
    @apply col-span-1;
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
  button:disabled .tableButton__icon {
    @apply text-gray-500;
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
  .recordList__fields-wrapper {
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
