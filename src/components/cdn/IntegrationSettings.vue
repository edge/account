<template>
  <div class="flex flex-col space-y-4">
    <IntegrationDetails :integration=integration />
    <IntegrationDomains :integration=integration />
    <IntegrationConfig :integration=integration />
  </div>
</template>

<script>
import IntegrationConfig from '@/components/cdn/IntegrationConfig'
import IntegrationDetails from '@/components/cdn/IntegrationDetails'
import IntegrationDomains from '@/components/cdn/IntegrationDomains'

export default {
  name: 'IntegrationSettings',
  props: ['integration'],
  components: {
    IntegrationConfig,
    IntegrationDetails,
    IntegrationDomains
  },
  data() {
    return {
      workingDisplayName: '',
      workingOriginUrl: '',
      workingConfig: {}
    }
  },
  computed: {
    canSaveChanges() {
      return this.liveDisplayName !== this.workingDisplayName ||
        this.liveOriginUrl !== this.workingOriginUrl ||
        this.liveConfig !== this.workingConfig
    },
    liveDisplayName() {
      return this.integration.name
    },
    liveOriginUrl() {
      return this.integration.data.config.origin
    },
    liveConfig() {
      return { ...this.integration.data.config }
    }
  },
  methods: {
    onUpdateConfig(newConfig) {
      this.workingConfig = newConfig
    },
    onUpdateDetails(newDisplayName, newOriginUrl) {
      this.workingDisplayName = newDisplayName
      this.workingOriginUrl = newOriginUrl
    },
    saveChanges() {
      console.log('saving')
    }
  },
  mounted() {
    this.workingDisplayName = this.integration.name
    this.workingOriginUrl = this.integration.data.config.origin
    this.workingDeployConfig = this.integration.data.config
  }
}
</script>

<style scoped>

</style>
