<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Edge Pages</h1>
      <router-link
        v-if="integrationsCount"
        :to="{ name: 'Pages Deploy' }"
        class="button button--success button--small h-full mb-5 sm:mb-0"
      >
        Deploy Page
      </router-link>
    </div>
    <IntegrationList
      v-show="integrationsCount"
      @update-integration-count="onUpdateIntegrationsCount"
    />
    <div v-if="!loaded" class="flex items-center">
      <span>Loading pages</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else-if="!integrationsCount" class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <p>You don't have any pages yet. Once you create your first page it will be available here.</p>
        <router-link
          :to="{ name: 'Pages Deploy' }"
          class="button button--success button--small"
        >
          Deploy Page
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import IntegrationList from '@/components/pages/IntegrationList'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

export default {
  name: 'Storage',
  title() {
    return 'Edge Account Portal » Storage'
  },
  components: {
    IntegrationList,
    LoadingSpinner
  },
  data() {
    return {
      integrations: [],
      integrationsCount: null,
      loaded: false
    }
  },
  computed: {
    ...mapState(['services'])
  },
  methods: {
    onUpdateIntegrationsCount(count) {
      this.integrationsCount = count
      this.loaded = true
    }
  },
  mounted() {
    const service = this.services.find(s => s._key === 'storage')
    if (!service || (!service.public && !service.beta)) this.$router.push({ name: 'Not Found' })
  }
}
</script>

<style scoped>
</style>
