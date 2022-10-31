<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Edge Content Delivery</h1>
      <router-link
        v-if=integrationCount
        :to="{ name: 'CdnDeploy' }"
        class="button button--success button--small h-full mb-5 sm:mb-0"
      >
        Deploy CDN
      </router-link>
    </div>
    <CdnIntegrationList
      v-show=integrationCount
      @update-integration-count=onUpdateIntegrationCount
    />
    <div v-if="!loaded" class="flex items-center">
      <span>Loading CDN deployments</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else-if="!integrationCount" class="box">
      <div class="flex flex-col space-y-4 items-center justify-center py-4">
        <!-- eslint-disable-next-line max-len -->
        <p>You don't have any content delivery deployments yet. Once you create your first deployment it will be available here.</p>
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
import LoadingSpinner from '@/components/icons/LoadingSpinner'

export default {
  name: 'CdnIntegrations',
  title() {
    return 'Edge Account Portal » Content Delivery'
  },
  components: {
    CdnIntegrationList,
    LoadingSpinner
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
