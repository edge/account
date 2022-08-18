<template>
  <div class="mainContent__inner" v-if=domain>
    <h1>{{domain._key}}</h1>

    <!-- add new dns record -->
    <div class="box">
      <h4 class="mb-2">Add a new record</h4>
      <div class="flex flex-col w-full lg:space-x-8 lg:items-end lg:flex-row">
        <!-- input -->
        <div class="flex-1 input-group">
          <label class="label">Hostname</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            placeholder="Enter @ or hostname"
            required
            v-model="hostname"
          />
        </div>
        <div class="flex-1 input-group">
          <label class="label">Value</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            placeholder=""
            required
            v-model="value"
          />
        </div>
        <div class="flex-1 input-group">
          <label class="label">TTL (seconds)</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            placeholder=""
            required
            v-model="ttl"
          />
        </div>

        <!-- buttons -->
        <div class="flex mt-5 space-x-2 lg:mt-0">
          <button
            @click.prevent="createRecord"
            :disabled="!canCreateRecord"
            class="button button--success"
          >
            <div v-if="creatingRecord" class="flex items-center">
              <span>Creating</span>
              <div><LoadingSpinner class="ml-1 w-4" /></div>
            </div>
            <span v-else>Create Record</span>
          </button>
        </div>

      </div>
    </div>

    <DomainRecordsList :domain=domain />
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import DomainRecordsList from '@/components/domain/DomainRecordsList'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'Domain',
  title() {
    return 'Edge Account Portal » Domain'
  },
  components: {
    DomainRecordsList,
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
      type: null,
      value: null
    }
  },
  computed: {
    ...mapState(['session']),
    canCreateRecord() {
      /** @todo add proper verfification */
      return true
    },
    domainName() {
      return this.$route.params.key
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
</style>
