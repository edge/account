<template>
  <div class="flex flex-col space-y-2">
    <textarea
      v-model="json"
      @keydown=updateConfig
      class="w-full border border-gray rounded p-4 monospace"
      cols="30" rows="15"
    >
    </textarea>
    <div class="flex justify-between items-start">
      <!-- error -->
      <div>
        <div v-if="jsonError" class="text-red flex flex-col">
          <div>
            <div v-if="jsonError.lineNumber">
              <button @click="toggleShowErrorDetail" class="flex items-center space-x-2">
                <span>JSON Syntax Error around line {{ jsonError.lineNumber }}</span>
                <ChevronDownIcon v-if=showErrorDetail class="w-3.5" />
                <ChevronUpIcon v-else class="w-3.5" />
              </button>
            </div>
            <span v-else>{{ jsonError.error }}</span>
          </div>
          <div v-if="jsonError.lineNumber && showErrorDetail" class="flex flex-col">
            <div>
              <div v-if="jsonError.prevLineContent">
                <span class="w-6 inline-block">{{ jsonError.lineNumber - 1 }}: </span>
                <span class="monospace">{{ jsonError.prevLineContent }}</span>
              </div>
              <div>
                <span class="w-6 inline-block">{{ jsonError.lineNumber }}: </span>
                <span class="monospace">{{ jsonError.lineContent }}</span>
              </div>
              <div v-if="jsonError.nextLineContent">
                <span class="w-6 inline-block">{{ jsonError.lineNumber + 1 }}: </span>
                <span class="monospace">{{ jsonError.nextLineContent }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/outline'

export default {
  name: 'CdnConfigCustomAdvanced',
  props: ['globalConfig', 'initialGlobalConfig', 'initialPaths', 'paths'],
  components: {
    ChevronDownIcon,
    ChevronUpIcon
  },
  data() {
    return {
      configTimeout: null,
      initialJson: '',
      json: '',
      jsonError: null,
      showErrorDetail: false
    }
  },
  computed: {
    hasChanges() {
      return this.json !== this.initialJson
    }
  },
  methods: {
    resetConfig() {
      this.setJson(this.initialPaths, this.initialGlobalConfig)
    },
    setJson(paths, globalConfig) {
      const jsonGlobalConfig = {
        ...globalConfig
      }
      if (paths) {
        const jsonPaths = {}
        paths.forEach(path => {
          jsonPaths[path.path] = {}
          if (path.enabled !== undefined) jsonPaths[path.path].enabled = path.enabled
          if (path.ttl) jsonPaths[path.path].ttl = path.ttl
        })
        jsonGlobalConfig.cache.paths = jsonPaths
      }
      const jsonCache = JSON.stringify(jsonGlobalConfig, undefined, 2)
      this.json = jsonCache
    },
    toggleShowErrorDetail() {
      this.showErrorDetail = !this.showErrorDetail
    },
    updateConfig() {
      // debounce update config and errors
      if (this.configTimeout) clearTimeout(this.configTimeout)
      this.configTimeout = setTimeout(() => {
        try {
          const config = JSON.parse(this.json)
          this.jsonError = null
          this.showErrorDetail = false
          this.$emit('update-config', config)
        }
        catch (error) {
          // get where error occurs
          const splitError = error.toString().split(' ')
          const position = Number(splitError[splitError.findIndex(word => word === 'position') + 1])

          let jsonError = {
            error: error.toString()
          }
          if (position) {
            // get lineNumber
            const subStr = this.json.substring(0, position)
            const lineNumber = subStr.split('\n').length
            // get content of lines around where error occurs
            let lineContent = this.json.split('\n')[lineNumber - 1]
            if (lineContent) lineContent = lineContent.trim()
            let prevLineContent = this.json.split('\n')[lineNumber - 2]
            if (prevLineContent) prevLineContent = prevLineContent.trim()
            let nextLineContent = this.json.split('\n')[lineNumber]
            if (nextLineContent) nextLineContent = nextLineContent.trim()

            jsonError = {
              ...jsonError,
              lineNumber,
              lineContent,
              prevLineContent,
              nextLineContent
            }
          }
          this.jsonError = jsonError
        }
      }, 400)
    }
  },
  mounted() {
    this.setJson(this.paths, this.globalConfig)
  },
  watch: {
    json() {
      this.updateConfig()
    }
  }
}
</script>

<style scoped>

</style>
