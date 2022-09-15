<template>
  <div class="flex flex-col space-y-2">
    <textarea
      v-model="json"
      class="w-full border border-gray rounded p-4 monospace"
      cols="30" rows="15"
    >
    </textarea>
    <div class="flex justify-between items-start">
      <!-- error -->
      <div>
        <div v-if="jsonError" class="text-red flex flex-col">
          <div>
            <span v-if="jsonError.lineNumber">JSON Syntax Error around line {{ jsonError.lineNumber }}:</span>
            <span v-else>{{ jsonError.error }}</span>
          </div>
          <div v-if="jsonError.lineNumber" class="flex flex-col">
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
      <button @click="updateConfig"
        :disabled="!hasChanges"
        class="button button--success button--small w-max"
      >
        Save changes
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CdnConfigCustomAdvanced',
  props: ['globalConfig', 'paths'],
  data() {
    return {
      initialJson: '',
      json: '',
      jsonError: null
    }
  },
  computed: {
    hasChanges() {
      return this.json !== this.initialJson
    }
  },
  methods: {
    updateConfig() {
      // const json = document.getElementById('json-input').value
      try {
        const config = JSON.parse(this.json)
        this.jsonError = null
        this.$emit('update-config', config)
        this.initialJson = this.json
      }
      catch (error) {
        console.error(error)
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
    }
  },
  mounted() {
    const paths = {}
    this.paths.forEach(path => {
      paths[path.path] = {}
      if (path.enabled !== undefined) paths[path.path].enabled = path.enabled
      if (path.ttl) paths[path.path].ttl = path.ttl
    })
    const config = {
      cache: {
        ...this.globalConfig,
        paths
      }
    }
    const jsonCache = JSON.stringify(config, undefined, 2)
    this.json = jsonCache
    this.initialJson = jsonCache
  }
}
</script>

<style scoped>

</style>
