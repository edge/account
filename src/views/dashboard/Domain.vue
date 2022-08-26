<template>
  <div class="mainContent__inner" v-if=domain>
    <h1>{{domain._key}}</h1>

    <!-- add new dns record -->
    <div class="box">
      <h4 class="mb-2">Add a new record</h4>
      <div class="record-form">
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
              class="w-full input input--floating"
              :placeholder="nameLabel.placeholder"
              required
              v-model="hostname"
            />
            <span class="text-gray-300 border-b border-gray-400">.{{ domainName }}</span>
          </div>
          <div v-if="hostname && hostnameError" class="errorMessage">
            <span class="errorMessage__text">{{ hostnameError }}</span>
          </div>
        </div>
        <!-- value -->
        <div class="flex-1 input-group value">
          <label class="label">{{ valueLabel.label }}</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            :placeholder="valueLabel.placeholder"
            required
            v-model="value"
          />
          <div v-if="value && valueError" class="errorMessage">
            <span class="errorMessage__text">{{ valueError }}</span>
          </div>
        </div>
        <!-- ttl -->
        <div class="input-group ttl">
          <label class="label">TTL (seconds)</label>
          <input
            type="number"
            autocomplete="off"
            class="w-full input input--floating"
            placeholder="Enter TTL"
            required
            v-model="ttl"
          />
        </div>

        <!-- submit button -->
        <button
          @click.prevent="createRecord"
          :disabled="!canCreateRecord"
          class="button button--success col-span-2"
        >
          <div v-if="creatingRecord" class="flex items-center">
            <span>Creating</span>
            <div><LoadingSpinner class="ml-1 w-4" /></div>
          </div>
          <span v-else>Create Record</span>
        </button>

      </div>
      <!-- synced records warning -->
      <div v-if=displaySyncRecordsWarning class="w-full mt-2 bg-gray-300 rounded text-black p-2">
        <div class="float-left"><InformationCircleIcon class="w-4 mr-1 mt-0.5" /></div>
        <!-- eslint-disable-next-line max-len -->
        <span>The current TTL for {{ type }} {{ hostname }} is {{ syncRecordsTTL }} and changing it will update {{ syncRecordsCount }} other record{{ syncRecordsCount > 1 ? 's' : '' }}.</span>
      </div>
    </div>

    <DomainRecordsList :domain=domain />
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import { ChevronDownIcon } from '@heroicons/vue/solid'
import DomainRecordsList from '@/components/domain/DomainRecordsList'
import { InformationCircleIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'

// FQDN regex
const domainRegexp = /((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}/i
// record name alphanumeric (and - or .) regex
const nameRegexp = /^[a-z0-9-.]*$/
// IPv4 regex
const IPv4SegmentFormat = '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])'
const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`
const IPv4AddressRegExp = new RegExp(`^${IPv4AddressFormat}$`)
// IPv6 rex=gex
const IPv6SegmentFormat = '(?:[0-9a-fA-F]{1,4})'
const IPv6AddressRegExp = new RegExp('^(' +
  `(?:${IPv6SegmentFormat}:){7}(?:${IPv6SegmentFormat}|:)|` +
  `(?:${IPv6SegmentFormat}:){6}(?:${IPv4AddressFormat}|:${IPv6SegmentFormat}|:)|` +
  `(?:${IPv6SegmentFormat}:){5}(?::${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,2}|:)|` +
  `(?:${IPv6SegmentFormat}:){4}(?:(:${IPv6SegmentFormat}){0,1}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,3}|:)|` +
  `(?:${IPv6SegmentFormat}:){3}(?:(:${IPv6SegmentFormat}){0,2}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,4}|:)|` +
  `(?:${IPv6SegmentFormat}:){2}(?:(:${IPv6SegmentFormat}){0,3}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,5}|:)|` +
  `(?:${IPv6SegmentFormat}:){1}(?:(:${IPv6SegmentFormat}){0,4}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,6}|:)|` +
  `(?::((?::${IPv6SegmentFormat}){0,5}:${IPv4AddressFormat}|(?::${IPv6SegmentFormat}){1,7}|:))` +
  ')(%[0-9a-zA-Z-.:]{1,})?$')

export default {
  name: 'Domain',
  title() {
    return 'Edge Account Portal » Domain'
  },
  components: {
    ChevronDownIcon,
    DomainRecordsList,
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
      domain: null,
      hostname: null,
      hostnameError: '',
      iDomain: null,
      loading: false,
      ttl: null,
      syncRecordsCount: null,
      syncRecordsTTL: null,
      type: 'A',
      value: null,
      valueError: ''
    }
  },
  computed: {
    ...mapState(['config', 'session']),
    canCreateRecord() {
      /** @todo add proper validation */
      return !this.hostnameError && this.ttl && this.type && !this.valueError
    },
    displaySyncRecordsWarning() {
      return this.canCreateRecord && this.syncRecordsCount && this.syncRecordsTTL !== this.ttl
    },
    domainName() {
      return this.$route.params.key
    },
    // isHostnameValid() {
    //   if (this.type === 'PTR') return IPv4AddressRegExp.test(this.hostname)
    //   else return !this.hostname || nameRegexp.test(this.hostname)
    // },
    // isValueValid() {
    //   if (this.type === 'A') return IPv4AddressRegExp.test(this.value)
    //   else if (this.type === 'AAAA') return IPv6AddressRegExp.test(this.value)
    //   else if (['ALIAS', 'CNAME', 'MX', 'NS', 'PTR'].includes(this.type)) return domainRegexp.test(this.value)
    //   else return this.type
    // },
    nameLabel() {
      if (this.type === 'PTR') return {
        label: 'IPv4 Address',
        placeholder: 'Enter IP address'
      }
      else return {
        label: 'Hostname',
        placeholder: 'Enter hostname'
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
    async createRecord() {
      try {
        this.creatingRecord = true
        await utils.dns.createRecord(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.domainName,
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
      setTimeout(() => {
        this.creatingRecord = false
      }, 800)
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
    async updateDomain() {
      this.domain = await utils.dns.getZone(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.domainName
      )
    },
    validateHostname() {
      let error = ''
      if (this.type === 'PTR') {
        if (!IPv4AddressRegExp.test(this.hostname)) this.hostnameError = 'Must be valid IPv4 address'
      }
      // eslint-disable-next-line max-len
      else if (this.hostname && !nameRegexp.test(this.hostname)) error = 'Must contain only alphanumeric characters, dot (.) or dash (-)'
      else error = ''
      this.hostnameError = error
    },
    validateValue() {
      let error = ''
      if (this.type === 'A') {
        if (!IPv4AddressRegExp.test(this.value)) error = 'Must be valid IPv4 address'
      }
      else if (this.type === 'AAAA') {
        if (!IPv6AddressRegExp.test(this.value)) error = 'Must be valid IPv6 address'
      }
      else if (['ALIAS', 'CNAME', 'MX', 'NS', 'PTR'].includes(this.type)) {
        if (!domainRegexp.test(this.value)) error = 'Must be valid FQDN'
      }
      else if (!this.value) error = 'Value required'
      this.valueError = error
    }
  },
  mounted() {
    this.loading = true
    this.updateDomain()
    this.iDomain = setInterval(() => {
      this.updateDomain()
    }, 5 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iDomain)
    this.iDomain = null
  },
  watch: {
    hostname() {
      this.getSyncRecords()
      this.validateHostname()
    },
    type() {
      this.getSyncRecords()
      this.validateHostname()
      this.validateValue()
    },
    value() {
      this.validateValue()
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}
.record-form {
  @apply grid gap-4 w-full;
  grid-template-columns: auto 1fr;
  @apply lg:flex lg:items-start lg:flex-row;
}
.input-group.type {
  width: 80px;
}
.input-group.ttl {
  @apply col-start-1 row-start-2;
  width: 100px;
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

@media (max-width: 400px) {
  .input-group.hostname, .input-group.value {
    @apply col-span-2;
  }
  .input-group.ttl {
    @apply w-full row-start-1 col-start-2;
  }
}
</style>
