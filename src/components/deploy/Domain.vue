<template>
  <div class="flex flex-col pb-2 space-y-6 mt-5">
    <div class="input-group">
      <label class="label">Domain</label>
      <input
        class="input input--floating"
        :value="domain"
        placeholder=".edge.network"
        readonly
        type="text"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Domain',
  data () {
    return {
      domain: ''
    }
  },
  props: ['hostname'],
  watch: {
    hostname(value) {
      this.domain = `${value || ''}.edge.network`
      this.$emit('name-changed', this.domain)
    }
  }
}
</script>
