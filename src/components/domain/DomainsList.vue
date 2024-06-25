<template>
  <div>
    <!-- loading -->
    <div v-if="!loaded" class="box mt-4 flex items-center">
      <span>Loading domains</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <!-- domains list -->
    <ul v-else-if="domains.length" class="domainList">
      <div class="float-right mb-2">
        <ListSortingMenu
          :fields="sortFields"
          :query="sortQuery"
          @update-sort="updateSortQuery"
        />
      </div>
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
    <div v-else class="box mt-4">
      <span>You don't have any domains yet. Once you add your first domain it will be available here.</span>
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '@edge/account-utils'
import DomainsListItem from '@/components/domain/DomainsListItem'
import ListSortingMenu from '@/components/ListSortingMenu'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

const sortFields = [
  { label: 'Name', param: '_key'},
  { label: 'Created', param: 'created'},
  { label: 'Status', param: 'active'}
]

export default {
  name: 'DomainsList',
  components: {
    DomainsListItem,
    ListSortingMenu,
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
      pageHistory: [1],
      sortFields: sortFields,
      sortQuery: ''
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
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = [this.sortQuery, '-created', 'updated']

      const { results, metadata } = await utils.getDnsZones(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, params)
      this.domains = results
      this.metadata = metadata
      this.loaded = true
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
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
    },
    sortQuery() {
      this.updateDomains()
    }
  }
}
</script>
<style scoped>
.domainList {
  @apply mt-4 lg:mt-4 space-y-2;
}
</style>
