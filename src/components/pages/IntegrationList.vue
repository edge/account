<template>
  <div>
    <!-- loading -->
    <div v-if="!loaded" class="box flex items-center">
      <span>Loading</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <!-- cdn integrations list -->
    <ul v-else-if="integrations.length" class="space-y-2">
      <div class="float-right mb-2">
        <ListSortingMenu
          :fields="sortFields"
          :query="sortQuery"
          @update-sort="updateSortQuery"
        />
      </div>
      <IntegrationListItem
        v-for="integration in integrations"
        :key="integration._key"
        :integration="integration"
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

import * as api from '@/account-utils/'
import IntegrationListItem from '@/components/pages/IntegrationListItem'
import ListSortingMenu from '@/components/ListSortingMenu'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

const sortFields = [
  { label: 'Name', param: 'name'},
  { label: 'Created', param: 'created'},
  { label: 'Status', param: 'active'}
]

export default {
  name: 'IntegrationList',
  components: {
    IntegrationListItem,
    ListSortingMenu,
    LoadingSpinner,
    Pagination
  },
  data() {
    return {
      integrations: [],
      iIntegrations: null,
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
    async updateIntegrations() {
      const params = { limit: this.limit, page: this.currentPage, service: 'pages' }
      if (this.sortQuery) params.sort = [this.sortQuery, '-created', 'updated']

      const { results, metadata } = await api.integration.getIntegrations(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        params
      )

      this.integrations = results
      this.metadata = metadata
      this.$emit('update-integration-count', metadata.totalCount)
      this.loaded = true
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
    }
  },
  async mounted() {
    await this.updateIntegrations()
    this.iIntegrations = setInterval(() => {
      this.updateIntegrations()
    }, 10000)
  },
  unmounted() {
    clearInterval(this.iIntegrations)
  },
  watch: {
    pageHistory() {
      this.updateIntegrations()
    },
    sortQuery() {
      this.updateIntegrations()
    }
  }
}
</script>

