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
          <label class="label">Hostname</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            placeholder="Enter @ or hostname"
            required
            v-model="hostname"
          />
        </div>
        <!-- value -->
        <div class="flex-1 input-group value">
          <label class="label">Value</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            placeholder="Enter value"
            required
            v-model="value"
          />
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
    </div>

    <DomainRecordsList :domain=domain />
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import { ChevronDownIcon } from '@heroicons/vue/solid'
import DomainRecordsList from '@/components/domain/DomainRecordsList'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'

export default {
  name: 'Domain',
  title() {
    return 'Edge Account Portal » Domain'
  },
  components: {
    ChevronDownIcon,
    DomainRecordsList,
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
      iDomain: null,
      loading: false,
      ttl: null,
      type: 'A',
      value: null
    }
  },
  computed: {
    ...mapState(['config', 'session']),
    canCreateRecord() {
      /** @todo add proper validation */
      return this.hostname && this.ttl && this.type && this.value
    },
    domainName() {
      return this.$route.params.key
    },
    types() {
      return this.config && this.config.dns.recordTypes
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
    async updateDomain() {
      this.domain = await utils.dns.getZone(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.domainName
      )
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
