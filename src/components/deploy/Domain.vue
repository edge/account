<template>
  <div class="flex flex-col pb-2 space-y-6 mt-5">
    <div class="input-group">
      <label class="label">Domain</label>
      <input
        v-model="domain"
        class="input input--floating"
        placeholder=".edge.network"
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
  watch: {
    domain(value) {
      this.$emit('name-changed', value)
    }
  }
}
</script>
