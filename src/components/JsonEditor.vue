<template>
  <div class="flex flex-col space-y-2">
    <!-- editor -->
    <textarea
      v-model="json"
      class="w-full border border-gray rounded p-4 monospace"
      cols="30" rows="15"
    >
    </textarea>

    <!-- errors -->
    <div class="flex justify-between items-start">
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
  name: 'JsonEditor',
  components: {
    ChevronDownIcon,
    ChevronUpIcon
  },
  props: [
    'validateFn',
    'object'
  ],
  data() {
    return {
      jsonError: null,
      json: '',
      jsonTimeout: null,
      showErrorDetail: false
    }
  },
  methods: {
    setJson() {
      this.json = JSON.stringify(this.object, undefined, 2)
    },
    toggleShowErrorDetail() {
      this.showErrorDetail = !this.showErrorDetail
    },
    updateJson() {
      // debounce update config and errors
      if (this.jsonTimeout) clearTimeout(this.jsonTimeout)

      this.jsonTimeout = setTimeout(() => {
        try {
          const jsonParsed = JSON.parse(this.json)

          // if JSON parsed successfully, reset errors
          this.jsonError = null
          this.showErrorDetail = false

          try {
            if (this.validateFn) this.validateFn(jsonParsed, this.json)
            this.$emit('update:object', jsonParsed)
          }
          // catch additional validation errors
          catch (error) {
            this.jsonError = { error }
          }
        }
        // catch for JSON syntax errors
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
    this.setJson()
  },
  watch: {
    json() {
      this.updateJson()
    }
  }
}
</script>

<style scoped>
</style>
