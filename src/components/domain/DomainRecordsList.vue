<template>
  <div>
    <div v-if="!loaded" class="box mt-5 flex items-center">
      <span>Loading records</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <ul v-else-if="records.length" role="list" class="domainList">
      <DomainRecordsListItem
        v-for="record in records"
        :key="record._key"
        :record=record
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
      const records = await utils.dns.getRecords(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.domain._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.records = records.results
      this.metadata = records.metadata
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
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.domainList {
  @apply mt-5 lg:mt-5 space-y-2;
}
</style>
