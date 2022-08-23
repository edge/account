<template>
  <div>
    <!-- loading -->
    <div v-if="!loaded" class="box mt-2 flex items-center">
      <span>Loading domains</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <!-- domains list -->
    <ul v-else-if="domains.length" class="domainList">
      <DomainsListItem
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
    <!-- no domains -->
    <div v-else class="box mt-2">
      <span>No domains</span>
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils/'
import DomainsListItem from '@/components/domain/DomainsListItem'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

export default {
  name: 'DomainsList',
  components: {
    DomainsListItem,
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
      pageHistory: [1]
    }
  },
  computed: {
    ...mapState(['session']),
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    }
  },
  methods: {
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    async updateDomains() {
      const domains = await utils.dns.getZones(
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
