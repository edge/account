<template>
  <div class="mt-5 mb-8">
    <!-- loading -->
    <div v-if="!loaded" class="box mt-2 flex items-center">
      <span>Loading records</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <!-- records list -->
    <ul v-if="records.length" class="recordList">
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

import * as utils from '@/account-utils/'
import DomainRecordsListItem from '@/components/domain/DomainRecordsListItem'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

export default {
  name: 'DomainRecordsList',
  components: {
    DomainRecordsListItem,
    LoadingSpinner,
    Pagination
  },
  data() {
    return {
      records: [],
      iRecords: null,
      limit: 10,
      loaded: false,
      metadata: { totalCount: 0 },
      pageHistory: [1]
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
      const { results, metadata } = await utils.dns.getRecords(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.domain._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.records = results
      this.metadata = metadata
      this.loaded = true
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
    }
  }
}
</script>
<style scoped>
.recordList {
  @apply mt-2 space-y-2;
}
</style>
