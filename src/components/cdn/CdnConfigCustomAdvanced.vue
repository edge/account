<template>
  <JsonEditor
    ref="cdn-config-json-editor"
    :object="configObject"
    :validateFn="validateConfig"
    @update:object="onUpdateConfig"
  />
</template>

<script>
import JsonEditor from '@/components/JsonEditor.vue'
import { mapState } from 'vuex'
import { validate as validateConfigCache } from '@edge/cache-config'

export default {
  name: 'CdnConfigCustomAdvanced',
  props: ['globalConfig', 'initialGlobalConfig', 'initialPaths', 'paths'],
  components: {
    JsonEditor
  },
  data() {
    return {
      configObject: {},
      initialConfigObject: {}
    }
  },
  computed: {
    ...mapState(['config'])
  },
  methods: {
    checkDuplicatePaths(configRaw) {
      // extract just the paths part of json
      const pathsIndex = configRaw.indexOf('"paths"')
      if (pathsIndex < 1) return
      let pathsString = configRaw.substring(pathsIndex)
      let openingBracketCount = 1
      let closingBracketCount = 0
      let openingBracketIndex = pathsString.indexOf('{')
      let i = openingBracketIndex + 1
      while (closingBracketCount < openingBracketCount) {
        if (pathsString[i] === '{') openingBracketCount ++
        if (pathsString[i] === '}') closingBracketCount ++
        i++
      }
      pathsString = pathsString.substring(openingBracketIndex + 1, i - 1)

      // extract the path name from each path
      const paths = []
      // each path will be enclosed in double quotation marks, so get index of first and second quotation mark
      let initialQuotationIndex = pathsString.indexOf('"')
      let closingQuotationIndex = pathsString.indexOf('"', initialQuotationIndex + 1)
      while (initialQuotationIndex > -1) {
        // add path to paths array (including quotation marks)
        paths.push(pathsString.substring(initialQuotationIndex, closingQuotationIndex + 1))
        // find end of the current path object and remove from substring
        openingBracketCount = 1
        closingBracketCount = 0
        openingBracketIndex = pathsString.indexOf('{')
        i = openingBracketIndex + 1
        while (closingBracketCount < openingBracketCount) {
          if (pathsString[i] === '{') openingBracketCount ++
          if (pathsString[i] === '}') closingBracketCount ++
          i++
        }
        pathsString = pathsString.substring(i)
        // reset indexs of the first and second quorations marks to find next path
        initialQuotationIndex = pathsString.indexOf('"')
        closingQuotationIndex = pathsString.indexOf('"', initialQuotationIndex + 1)
      }
      // check for duplicate paths and throw error if any
      const duplicates = paths.filter((item, index) => paths.indexOf(item) !== index)
      if (duplicates.length) throw new Error(`duplicate path ${duplicates[0]}`)
    },
    onUpdateConfig(newConfig) {
      this.$emit('update-config', newConfig)
    },
    async resetConfig() {
      this.configObject = { ...this.initialConfigObject }
      await this.$nextTick()
      this.$refs['cdn-config-json-editor'].setJson()
    },
    validateConfig(config, configRaw) {
      // additional ttl validations
      if (config.cache && config.cache.ttl !== undefined && config.cache.ttl < this.config.cdn.minimumTTL) {
        throw new Error(`ttl must be no less than ${this.config.cdn.minimumTTL}`)
      }
      validateConfigCache(config.cache)
      this.checkDuplicatePaths(configRaw)
    },
    setConfigObject() {
      const jsonGlobalConfig = { ...this.globalConfig }
      if (this.paths) {
        const jsonPaths = {}
        this.paths.forEach(path => {
          jsonPaths[path.path] = {}
          if (path.enabled !== undefined) jsonPaths[path.path].enabled = path.enabled
          if (path.ttl) jsonPaths[path.path].ttl = path.ttl
        })
        jsonGlobalConfig.cache.paths = jsonPaths
      }
      this.configObject = jsonGlobalConfig
    }
  },
  created() {
    this.setConfigObject()
    this.initialConfigObject = { ...this.configObject }
  },
  watch: {
    globalConfig() {
      this.setConfigObject()
    },
    paths() {
      this.setConfigObject()
    }
  }
}
</script>

<style scoped>

</style>
