<template>
  <CdnConfig
    ref="cdnConfig"
    :initialConfig=liveConfig
    @update-config=onUpdateConfig
  >
    <template v-slot:buttons>
      <div class="flex space-x-2 justify-end mt-4">
        <button
          @click=resetChanges
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
</template>

<script>
import CdnConfig from '@/components/cdn/CdnConfig'
import _ from 'lodash'

export default {
  name: 'IntegrationConfig',
  props: ['integration'],
  components: {
    CdnConfig
  },
  data() {
    return {
      workingConfig: null
    }
  },
  computed: {
    canSaveChanges() {
      return this.hasConfigChanges
    },
    hasConfigChanges() {
      if(this.workingConfig) {
        // top level keys
        const keys = ['maxAssetSize', 'requestTimeout', 'resetTimeout']
        keys.forEach(key => {
          if (this.liveConfig[key] !== this.workingConfig[key]) return true
        })
        // cache
        if (!_.isEqual(this.liveConfig.cache, this.workingConfig.cache)) return true
      }
      return false
    },
    liveConfig() {
      return { ...this.integration.data.config }
    }
  },
  methods: {
    onUpdateConfig(newConfig) {
      this.workingConfig = newConfig
    },
    resetChanges() {
      this.$refs.cdnConfig.resetConfig()
      this.workingConfig = { ...this.integration.data.config }
    },
    saveChanges() {
      console.log('saving')
    }
  },
  mounted() {
    this.workingConfig = { ...this.integration.data.config }
  }
}
</script>

<style scoped>

</style>
