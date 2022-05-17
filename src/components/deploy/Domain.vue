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
  computed: {
    domain() {
      return this.hostname ? `${this.hostname}.edge.network` : ''
    }
  },
  props: ['hostname']
}
</script>
