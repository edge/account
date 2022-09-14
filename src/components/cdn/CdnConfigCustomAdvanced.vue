<template>
  <div>
    <textarea
      class="w-full border border-gray rounded p-4 monospace"
      id="json-input" cols="30" rows="15"
      @change=updateConfig
    >
    </textarea>
    <div v-if="jsonError">
      <span class="text-red">JSON invalid</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CdnConfigCustomAdvanced',
  props: ['config'],
  data() {
    return {
      jsonError: false
    }
  },
  methods: {
    updateConfig(e) {
      const json = e.target.value
      try {
        const config = JSON.parse(json)
        this.jsonError = false
        this.$emit('update-config', config)

      }
      catch (error) {
        this.jsonError = true
      }
    }
  },
  mounted() {
    const configDisplay = { ...this.config }
    delete configDisplay.origin
    const jsonCache = JSON.stringify(configDisplay, undefined, 2)
    document.getElementById('json-input').value = jsonCache
  }
}
</script>

<style scoped>

</style>
