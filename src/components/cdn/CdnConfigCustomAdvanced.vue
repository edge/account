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
      <div><div v-if="jsonError" class="flex flex-col text-red">
        <span>JSON error around line {{ jsonError.lineNumber }}:</span>
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
        </div></div>
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
  props: ['config'],
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
        // get where error occurs
        const splitError = error.toString().split(' ')
        const position = Number(splitError[splitError.findIndex(word => word === 'position') + 1])

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

        this.jsonError = {
          lineNumber,
          lineContent,
          prevLineContent,
          nextLineContent
        }
      }
    }
  },
  mounted() {
    const configDisplay = { ...this.config }
    delete configDisplay.origin
    const jsonCache = JSON.stringify(configDisplay, undefined, 2)
    this.json = jsonCache
    this.initialJson = jsonCache
  }
}
</script>

<style scoped>

</style>
