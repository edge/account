<template>
  <div class="mainContent__inner">
    <div class="flex justify-between">
      <h1>Edge CDN</h1>
      <router-link
        v-if=displayIntegrationList
        :to="{ name: 'CdnDeploy' }"
        class="button button--success button--small h-full"
      >
        Deploy CDN
      </router-link>
    </div>
    <CdnIntegrationList
      v-if=displayIntegrationList
      @update-integration-count=onUpdateIntegrationCount
    />
    <div v-else class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <span>No content delivery deployments yet</span>
        <router-link
          :to="{ name: 'CdnDeploy' }"
          class="button button--success button--small"
        >
          Deploy CDN
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import CdnIntegrationList from '@/components/cdn/CdnIntegrationList'

export default {
  name: 'ContentDelivery',
  title() {
    return 'Edge Account Portal » CDN'
  },
  components: {
    CdnIntegrationList
  },
  data() {
    return {
      integrationCount: null,
      loaded: false
    }
  },
  computed: {
    displayIntegrationList() {
      return this.integrationCount || !this.loaded
    }
  },
  methods: {
    onUpdateIntegrationCount(count) {
      this.integrationCount = count
      this.loaded = true
    }
  }
}
</script>

<style scoped>
</style>
