<template>
  <div class="mt-4 mb-8">
    <!-- loading -->
    <div v-if="!loaded" class="box mt-2 flex items-center">
      <span>Loading records</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <!-- records list -->
    <ul v-if="records.length" class="recordList">
      <div class="float-right mb-2">
        <ListSortingMenu
          :fields="sortFields"
          :query="sortQuery"
          @update-sort="updateSortQuery"
        />
      </div>
      <DomainRecordsListItem
        v-for="record in records"
        :key="record._key"
        :record=record
        @updateRecords=updateRecords
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
import DomainRecordsListItem from '@/components/domain/DomainRecordsListItem'
import ListSortingMenu from '@/components/ListSortingMenu'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

const sortFields = [
  { label: 'Type', param: 'type'},
  { label: 'Hostname', param: 'name'},
  { label: 'Value', param: 'value'},
  { label: 'TTL', param: 'ttl'}
]

export default {
  name: 'DomainRecordsList',
  components: {
    DomainRecordsListItem,
    ListSortingMenu,
    LoadingSpinner,
    Pagination
  },
  data() {
    return {
      records: [],
      iRecords: null,
      limit: 100,
      loaded: false,
      metadata: { totalCount: 0 },
      pageHistory: [1],
      sortFields: sortFields,
      sortQuery: ''
    }
  },
  props: ['domain'],
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
    async updateRecords() {
      const params = { limit: this.limit, page: this.currentPage }
      if (this.sortQuery) params.sort = [this.sortQuery, 'type', 'name', 'value']

      const { results, metadata } = await api.dns.getRecords(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.domain._key,
        params
      )
      this.records = results
      this.metadata = metadata
      this.loaded = true
    },
    updateSortQuery (newQuery) {
      this.sortQuery = newQuery
    }
  },
  async mounted() {
    await this.updateRecords()
    this.iRecords = setInterval(() => {
      this.updateRecords()
    }, 10000)
  },
  unmounted() {
    clearInterval(this.iRecords)
  },
  watch: {
    pageHistory() {
      this.updateRecords()
    },
    sortQuery() {
      this.updateRecords()
    }
  }
}
</script>
<style scoped>
.recordList {
  @apply mt-2 space-y-2;
}
</style>
