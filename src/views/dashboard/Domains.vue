<template>
  <div class="mainContent__inner">
    <h1>Edge Domains</h1>

    <!-- add new domain input -->
    <div class="box">
      <div class="flex flex-col w-full lg:space-x-8 lg:items-end lg:flex-row">
        <!-- input -->
        <div class="flex-1 input-group">
          <label class="label">Domain Name</label>
          <input
            autocomplete="off"
            class="w-full input input--floating"
            placeholder="Add a domain name"
            required
            v-model="newDomainName"
          />
        </div>

        <!-- buttons -->
        <div class="flex mt-5 space-x-2 lg:mt-0">
          <button
            @click.prevent="addDomain"
            :disabled="!canAddDomain"
            class="button button--success"
          >
            <div v-if="addingDomain" class="flex items-center">
              <span>Adding</span>
              <div><LoadingSpinner class="ml-1 w-4" /></div>
            </div>
            <span v-else>Add Domain</span>
          </button>
        </div>

      </div>
    </div>

    <DomainsList />
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import DomainsList from '@/components/domain/DomainsList'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'Domains',
  title() {
    return 'Edge Account Portal » Domains'
  },
  components: {
    DomainsList,
    LoadingSpinner
  },
  data() {
    return {
      addingDomain: false,
      newDomainName: ''
    }
  },
  computed: {
    ...mapState(['session']),
    canAddDomain() {
      /** @todo add proper verfification */
      return this.newDomainName
    }
  },
  methods: {
    async addDomain() {
      try {
        this.addingDomain = true
        await utils.dns.addZone(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.newDomainName
        )
      }
      catch (error) {
        console.error(error)
      }
      setTimeout(() => {
        this.addingDomain = false
      }, 800)
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}
</style>
