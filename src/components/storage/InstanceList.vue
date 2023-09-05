<template>
  <div>
    <!-- loading -->
    <div v-if="!loaded" class="box flex items-center">
      <span>Loading</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <!-- cdn integrations list -->
    <ul v-else-if="instances.length" class="space-y-2">
      <div class="float-right mb-2">
        <ListSortingMenu
          :fields="sortFields"
          :query="sortQuery"
          @update-sort="updateSortQuery"
        />
      </div>
      <InstanceListItem
        v-for="instance in instances"
        :key="instance._key"
        :instance="instance"
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
import InstanceListItem from '@/components/storage/InstanceListItem'
import ListSortingMenu from '@/components/ListSortingMenu'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

const testInstances = [
  {
    _key: '1234abcd',
    name: 'Test instance 1',
    created: 1693726676000,
    updated: 1693728676000,
    active: true
  },
  {
    _key: 'abcd1234',
    name: 'Test instance 2',
    created: 1693658276000,
    updated: 1693658576000,
    active: true
  }
]

const sortFields = [
  { label: 'Name', param: 'name'},
  { label: 'Created', param: 'created'},
  { label: 'Domain', param: 'data.domain' },
  { label: 'Status', param: 'active'}
]

export default {
  name: 'InstanceList',
  components: {
    InstanceListItem,
    ListSortingMenu,
    LoadingSpinner,
    Pagination
  },
  data() {
    return {
      instances: [],
      iInstances: null,
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
    async updateInstances() {
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = [this.sortQuery, '-created', 'updated']

      // const { results, metadata } = await api.storage.getInstances(
      //   process.env.VUE_APP_ACCOUNT_API_URL,
      //   this.session._key,
      //   params
      // )

      const results = testInstances
      const metadata = { totalCount: testInstances.length }

      this.instances = results
      this.metadata = metadata
      this.$emit('update-instance-count', metadata.totalCount)
      this.loaded = true
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
    }
  },
  async mounted() {
    await this.updateInstances()
    this.iIntegrations = setInterval(() => {
      this.updateInstances()
    }, 10000)
  },
  unmounted() {
    clearInterval(this.iIntegrations)
  },
  watch: {
    pageHistory() {
      this.updateInstances()
    },
    sortQuery() {
      this.updateInstances()
    }
  }
}
</script>
<style scoped>
</style>
