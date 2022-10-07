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
import { mapState } from 'vuex'
import { validate as validateConfigCache } from '@edge/cache-config'
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
    ...mapState(['config']),
    hasChanges() {
      return this.json !== this.initialJson
    }
  },
  methods: {
    checkDuplicatePaths() {
      // extract just the paths part of json
      let pathsString = this.json.substring(this.json.indexOf('"paths"'))
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
      let initialQuotation = pathsString.indexOf('"')
      let closingQuotation = pathsString.indexOf('"', initialQuotation + 1)
      while (initialQuotation > 0) {
        // add path to paths array (including quotation marks)
        paths.push(pathsString.substring(initialQuotation, closingQuotation + 1))
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
        initialQuotation = pathsString.indexOf('"')
        closingQuotation = pathsString.indexOf('"', initialQuotation + 1)
      }
      // check for duplicate paths and throw error if any
      const duplicates = paths.filter((item, index) => paths.indexOf(item) !== index)
      if (duplicates.length) throw new Error(`duplicate path ${duplicates[0]}`)
    },
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
          try {
            // additional ttl validations
            if (config.cache.ttl !== undefined && config.cache.ttl < this.config.cdn.minimumTTL) {
              throw new Error(`ttl must be no less than ${this.config.cdn.minimumTTL}`)
            }
            if (config.cache.paths !== undefined) {
              for (const path in config.cache.paths) {
                const ttl = config.cache.paths[path]?.ttl
                if (ttl !== undefined && ttl < this.config.cdn.minimumTTL) {
                  throw new Error(`ttl must be no less than ${this.config.cdn.minimumTTL} in path "${path}"`)
                }
              }
            }
            validateConfigCache(config.cache)
            this.checkDuplicatePaths()
            this.$emit('update-config', config)
          }
          catch (error) {
            this.jsonError = {
              error: error
            }
          }
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
