<template>
  <div>
    <div class="record-form" :class="type === 'MX' ? 'mx' : ''">
      <!-- type dropdown -->
      <div class="input-group type">
        <label class="label">Type</label>
        <Listbox v-model="type" >
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
      </div>
      <!-- hostname -->
      <div class="flex-1 input-group hostname">
        <label class="label">{{ nameLabel.label }}</label>
        <div class="flex">
          <input
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            class="w-full input input--floating"
            :placeholder="nameLabel.placeholder"
            required
            v-model="hostname"
            @keypress="createOnEnter"
          />
          <span class="domainName">.{{ domainName }}</span>
        </div>
        <div v-if="hostnameError" class="errorMessage">
          <span class="errorMessage__text">{{ hostnameError }}</span>
        </div>
      </div>
      <!-- value (and priority for MX) -->
      <div class="flex space-x-2" :class="type === 'MX' ? 'mx-wrapper' : 'flex-1 input-group value'">
        <!-- priority (MX only) -->
        <div v-if="type === 'MX'" class="input-group priority">
          <label class="label">Priority</label>
          <input
            type="number"
            autocomplete="off"
            class="w-full input input--floating"
            placeholder="Enter priority"
            required
            v-model="priority"
            @keypress="createOnEnter"
          />
          <div v-if="priorityError" class="errorMessage">
            <span class="errorMessage__text">{{ priorityError }}</span>
          </div>
        </div>
        <!-- value -->
        <div class="flex-1 input-group value">
          <label class="label">{{ valueLabel.label }}</label>
          <input
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            class="w-full input input--floating"
            :placeholder="valueLabel.placeholder"
            required
            v-model="value"
            @keypress="createOnEnter"
          />
          <div v-if="valueError" class="errorMessage">
            <span class="errorMessage__text">{{ valueError }}</span>
          </div>
        </div>
      </div>
      <!-- ttl -->
      <div class="input-group ttl">
        <label class="label">TTL</label>
        <input
          type="number"
          autocomplete="off"
          class="w-full input input--floating"
          placeholder="Enter TTL"
          required
          v-model="ttl"
          @keypress="createOnEnter"
        />
        <div v-if="ttlError" class="errorMessage">
          <span class="errorMessage__text">{{ ttlError }}</span>
        </div>
      </div>

      <!-- submit button -->
      <div class="col-span-2 flex justify-end button__wrapper w-full lg:w-max">
        <button
          @click.prevent="createRecord"
          :disabled="!canCreateRecord"
          class="button button--success button--small w-full lg:w-max sm:max-w-xs lg:mt-2.5"
        >
          <div v-if="creatingRecord" class="flex items-center">
            <span>Creating</span>
            <div><LoadingSpinner class="ml-1 w-4" /></div>
          </div>
          <span v-else>Create Record</span>
        </button>
      </div>
    </div>
    <!-- synced records warning -->
    <div v-if=displaySyncRecordsWarning class="w-full mt-2 bg-gray-300 rounded text-black p-2">
      <div class="float-left"><InformationCircleIcon class="w-4 mr-1 mt-0.5" /></div>
      <!-- eslint-disable-next-line max-len -->
      <span>The current TTL for {{ type }} {{ hostname }} is {{ syncRecordsTTL }} and changing it will update {{ syncRecordsCount }} other record{{ syncRecordsCount > 1 ? 's' : '' }}.</span>
    </div>
    <div v-if=httpError class="mt-1">
      <HttpError :error=httpError />
    </div>
  </div>
</template>

<script>
/* global process */

import * as regex from '@/utils/regex'
import * as utils from '@/account-utils'
import { ChevronDownIcon } from '@heroicons/vue/solid'
import HttpError from '@/components/HttpError'
import { InformationCircleIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'NewRecordForm',
  components: {
    ChevronDownIcon,
    HttpError,
    InformationCircleIcon,
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    LoadingSpinner
  },
  data() {
    return {
      creatingRecord: false,
      hostname: '',
      hostnameError: '',
      hostnameTimeout: null,
      httpError: null,
      priority: '',
      priorityError: '',
      ttl: 3600,
      ttlError: '',
      syncRecordsCount: null,
      syncRecordsTTL: null,
      type: 'A',
      value: '',
      valueError: '',
      valueTimeout: ''
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend']),
    ...mapState(['balance', 'config', 'session']),
    canCreateRecord() {
      if (this.type === 'MX' && this.priorityError) return false
      // eslint-disable-next-line max-len
      return !this.balanceSuspend && this.hostname && !this.hostnameError && this.ttl && this.type && this.value && !this.valueError
    },
    displaySyncRecordsWarning() {
      return this.canCreateRecord && this.syncRecordsCount && this.syncRecordsTTL !== this.ttl
    },
    domainName() {
      return this.$route.params.key
    },
    nameLabel() {
      if (this.type === 'PTR') return {
        label: 'IPv4 Address',
        placeholder: 'Enter IP address'
      }
      else return {
        label: 'Hostname',
        placeholder: 'Enter @ or hostname'
      }
    },
    types() {
      return this.config && this.config.dns.recordTypes
    },
    valueLabel() {
      if (this.type === 'A') return {
        label: 'IPv4 Address',
        placeholder: 'Enter IP address'
      }
      else if (this.type === 'AAAA') return {
        label: 'IPv6 Address',
        placeholder: 'Enter IP address'
      }
      else if (this.type === 'NS') return {
        label: 'Nameserver',
        placeholder: 'Enter nameserver'
      }
      else if (['ALIAS', 'CNAME', 'MX', 'PTR'].includes(this.type)) return {
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
    createOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.createRecord()
    },
    async createRecord() {
      try {
        this.creatingRecord = true
        // add priority to MX values
        let value = this.type === 'MX' ? `${this.priority} ${this.value}` : this.value
        // append . to MX, CNAME and ALIAS values if not done by user
        if (['ALIAS', 'CNAME', 'NS', 'MX'].includes(this.type)) {
          if (this.value.slice(-1) !== '.') value += '.'
        }
        // add double quotes to TXT values if not done by user
        if (this.type === 'TXT') {
          if (this.value[0] !== '"' && this.value.slice(-1) !== '"') value = `"${value}"`
        }
        await utils.dns.createRecord(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.domainName,
          {
            name: this.hostname.toLowerCase(),
            ttl: this.ttl,
            type: this.type,
            value: value.toLowerCase()
          }
        )
        this.$emit('createRecord')
        setTimeout(async () => {
          await this.resetForm()
          this.resetValidations()
          this.creatingRecord = false
        }, 500)
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.creatingRecord = false
        }, 500)
      }

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
      this.syncRecordsCount = metadata.totalCount
      this.syncRecordsTTL = results.length ? results[0].ttl : null
    },
    resetForm() {
      this.hostname = ''
      this.priority = ''
      this.value = ''
    },
    resetValidations() {
      this.hostnameError = ''
      this.priorityError = ''
      this.ttlError = ''
      this.valueError = ''
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
    validatePriority() {
      let error = ''
      if (this.priority === '') error = 'Priority required'
      else if (this.priority < 1) error = 'Minimum value is 1'
      else if (!Number.isInteger(this.priority)) error = 'Must be integer'
      else error = ''
      this.priorityError = error
    },
    validateTtl() {
      let error = ''
      if (this.ttl === '') error = 'TTL required'
      else if (this.ttl < 60) error = 'Minimum value is 60'
      else if (!Number.isInteger(this.ttl)) error = 'Must be integer'
      else error = ''
      this.ttlError = error
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
  watch: {
    hostname() {
      this.httpError = null
      this.getSyncRecords()
      if (!this.creatingRecord) {
        if (this.hostnameTimeout) clearTimeout(this.hostnameTimeout)
        this.hostnameTimeout = setTimeout(this.validateHostname, 400)
      }
    },
    priority() {
      this.httpError = null
      this.validatePriority()
    },
    ttl() {
      this.httpError = null
      this.validateTtl()
    },
    type() {
      this.httpError = null
      this.getSyncRecords()
      this.resetValidations()
      if (this.hostname) this.validateHostname()
      if (this.value) this.validateValue()
      if (this.priority) this.validatePriority()
      if (this.ttl) this.validateTtl()
    },
    value() {
      this.httpError = null
      if (!this.creatingRecord) {
        if (this.valueTimeout) clearTimeout(this.valueTimeout)
        this.valueTimeout = setTimeout(this.validateValue, 400)
      }
    }
  }
}
</script>
<style scoped>
.record-form {
  @apply grid gap-4 w-full;
  grid-template-columns: auto 1fr;
  @apply lg:flex lg:items-start lg:flex-row;
}
.record-form.mx {
  @apply lg:grid xl:flex;
}
.domainName {
  @apply text-gray-400 border-b border-gray-400 lg:hidden xl:inline-block;
}
.input-group.type {
  width: 80px;
}
.input-group.ttl {
  @apply col-start-1 row-start-2;
  width: 80px;
}
.mx-wrapper {
  @apply flex-1;
}
.input-group.priority {
  width: 85px;
}
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

.record-form .button__wrapper {
  justify-self: end;
}


@media (max-width: 400px) {
  .input-group.hostname, .input-group.value, .mx-wrapper {
    @apply col-span-2;
  }
  .mx-wrapper {
    @apply space-x-0 space-y-2 flex-col;
  }
  .input-group.priority {
    @apply w-full;
  }
  .input-group.ttl {
    @apply w-full row-start-1 col-start-2;
  }
}
@media (max-width: 300px) {
  .domainName {
    @apply hidden;
  }
}
</style>
