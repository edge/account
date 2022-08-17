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
            class="button button--success">
            Add Domain
          </button>
        </div>

      </div>
    </div>

    <!-- domains list -->
    <div v-if="!loaded" class="box mt-5 flex items-center">
      <span>Loading domains</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <ul v-else-if="domains.length" role="list" class="domainList">
      <DomainListItem
        v-for="domain in domains"
        :key="domain._key"
        :domain=domain
      />
      <Pagination
        :currentPage=currentPage
        :limit=limit
        :totalCount="metadata.totalCount"
        @change-page=changePage
      />
    </ul>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import DomainListItem from '@/components/domain/DomainListItem'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

export default {
  name: 'Domains',
  title() {
    return 'Edge Account Portal » Domains'
  },
  components: {
    DomainListItem,
    LoadingSpinner,
    Pagination
  },
  data() {
    return {
      domains: [],
      iDomains: null,
      limit: 10,
      loaded: false,
      metadata: { totalCount: 0 },
      newDomainName: '',
      pageHistory: [1]
    }
  },
  computed: {
    ...mapState(['account', 'session']),
    canAddDomain() {
      return this.newDomainName
    },
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    }
  },
  methods: {
    async addDomain() {
      try {
        await utils.domains.createDomain(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.newDomainName
        )
      }
      catch (error) {
        console.error(error)
      }
    },
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    async updateDomains() {
      const domains = await utils.domains.getDomains(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.domains = domains.results
      this.metadata = domains.metadata
      this.loaded = true
    }
  },
  async mounted() {
    await this.updateDomains()
    this.iDomains = setInterval(() => {
      this.updateDomains()
    }, 10000)
  },
  unmounted() {
    clearInterval(this.iDomains)
  },
  watch: {
    pageHistory() {
      this.updateDomains()
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.domainList {
  @apply mt-5 lg:mt-5 space-y-2;
}
</style>
