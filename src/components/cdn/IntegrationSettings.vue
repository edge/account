<template>
  <div class="flex flex-col space-y-4">
    <CdnDetails
      :initialDisplayName=liveDisplayName
      :initialOriginUrl=liveOriginUrl
      @update-details=onUpdateDetails
    >
      <template v-slot:buttons>
        <div class="flex space-x-2 justify-end mt-2">
          <button
            class="button button--outline button--small"
          >
            Cancel
          </button>
          <button
            @click=saveChanges
            :disabled="!canSaveChanges"
            class="button button--success button--small"
          >
            Save Changes
          </button>
        </div>
      </template>
    </CdnDetails>
    <IntegrationDomains :integration=integration />
    <CdnConfig
      :initialConfig=liveConfig
      @update-config=onUpdateConfig
    >
      <template v-slot:buttons>
        <div class="flex space-x-2 justify-end mt-2">
          <button
            class="button button--outline button--small"
          >
            Cancel
          </button>
          <button
            @click=saveChanges
            :disabled="!canSaveChanges"
            class="button button--success button--small"
          >
            Save Changes
          </button>
        </div>
      </template>
    </CdnConfig>
  </div>
</template>

<script>
import CdnConfig from '@/components/cdn/CdnConfig'
import CdnDetails from '@/components/cdn/CdnDetails'
import IntegrationDomains from '@/components/cdn/IntegrationDomains'

export default {
  name: 'IntegrationSettings',
  props: ['integration'],
  components: {
    CdnConfig,
    CdnDetails,
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
