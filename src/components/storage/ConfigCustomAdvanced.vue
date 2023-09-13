<template>
  <JsonEditor
    ref="integration-config-json-editor"
    :object="configObject"
    :validateFn="validateConfig"
    @update:object="onUpdateConfig"
  />
</template>

<script>
import JsonEditor from '@/components/JsonEditor.vue'
import { mapState } from 'vuex'

export default {
  name: 'StorageConfigCustomAdvanced',
  props: ['integrationConfig', 'initialIntegrationConfig'],
  components: {
    JsonEditor
  },
  data() {
    return {
      configObject: this.initialIntegrationConfig || this.integrationConfig
    }
  },
  computed: {
    ...mapState(['config'])
  },
  methods: {
    onUpdateConfig(newConfig) {
      this.$emit('update-config', newConfig)
    },
    resetConfig() {
      this.$refs['integration-config-json-editor'].setJson()
    },
    validateConfig(config) {
      /** @todo add additional config validations when determined */
    }
  }
}
</script>

<style scoped>
</style>
