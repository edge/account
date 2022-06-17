<template>
  <div class="flex flex-col pb-2 space-y-6 mt-5">
    <div class="input-group">
      <label class="label">Domain</label>
      <input
        v-model="domain"
        class="input input--floating"
        placeholder="domain-name"
        type="text"
        required
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
  watch: {
    hostname() {
      this.domain = `${this.hostname}.edge.network`
    },
    domain(domain) {
      this.$emit('domain-changed', domain)
    }
  }
}
</script>
