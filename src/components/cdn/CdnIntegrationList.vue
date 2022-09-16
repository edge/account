<template>
  <div>
    <!-- loading -->
    <div v-if="!loaded" class="box mt-2 flex items-center">
      <span>Loading</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <!-- cdn integrations list -->
    <ul v-else-if="integrations.length" class="cdnList">
      <CdnIntegrationListItem
        v-for="integration in integrations"
        :key="integration._key"
        :integration=integration
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
import CdnIntegrationListItem from '@/components/cdn/CdnIntegrationListItem'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'

export default {
  name: 'CdnList',
  components: {
    CdnIntegrationListItem,
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
    async updateIntegrations() {
      const { results, metadata } = await utils.cdn.getIntegrations(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.currentPage
        }
      )
      this.integrations = results
      this.metadata = metadata
      this.$emit('update-integration-count', metadata.totalCount)
      this.loaded = true
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
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.cdnList {
  @apply mt-5 lg:mt-5 space-y-2;
}
</style>
