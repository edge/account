<template>
  <div class="flex flex-col pb-2 space-y-6 mt-4">
    <div class="input-group">
      <label class="label">Hostname</label>
      <input
        v-model="domain"
        class="input input--floating"
        :disabled="disableControls"
        :class="disableControls ? 'disabled' : ''"
        placeholder="domain-name"
        type="text"
        required
        @focusout=onFocusOut
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Domain',
  props: ['disableControls', 'hostname'],
  data() {
    return {
      domain: ''
    }
  },
  methods: {
    onFocusOut() {
      if (!this.domain) this.resetDomain()
    },
    resetDomain() {
      this.domain = `${this.hostname}.edge.network`
    }
  },
  watch: {
    hostname() {
      this.resetDomain()
    },
    domain(domain) {
      this.$emit('domain-changed', domain)
    }
  }
}
</script>
<style scoped>
input.disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
