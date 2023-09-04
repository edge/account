<template>
  <JsonEditor
    ref="instance-config-json-editor"
    :object="configObject"
    :validateFn="validateConfig"
    @update:object="onUpdateConfig"
  />
</template>

<script>
import JsonEditor from '@/components/JsonEditor.vue'
import { mapState } from 'vuex'

export default {
  name: 'InstanceConfigCustomAdvanced',
  props: ['instanceConfig', 'initialInstanceConfig'],
  components: {
    JsonEditor
  },
  data() {
    return {
      configObject: this.initialInstanceConfig || this.instanceConfig
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
      this.$refs['instance-config-json-editor'].setJson()
    },
    validateConfig(config) {
      // additional ttl validations
      if (config.cache && config.cache.ttl !== undefined && config.cache.ttl < this.config.cdn.minimumTTL) {
        throw new Error(`ttl must be no less than ${this.config.cdn.minimumTTL}`)
      }
    }
  }
}
</script>

<style scoped>
</style>
