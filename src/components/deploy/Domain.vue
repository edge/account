<template>
  <div class="flex flex-col pb-2 space-y-6 mt-5">
    <div class="input-group">
      <label class="label">Hostname</label>
      <input
        v-model="domain"
        class="input input--floating"
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
  props: ['hostname'],
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
