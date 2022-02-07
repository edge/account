<template>
  <div class="flex flex-col pb-2 space-y-6">
    <div class="input-group">
      <label class="label">Hostname</label>
      <input
        v-model="hostname"
        class="input input--floating"
        placeholder="Hostname"
        type="text"
        required
      />
    </div>
  </div>
</template>

<script>

export default {
  name: 'ServerName',
  data () {
    return {
      hostname: ''
    }
  },
  watch: {
    hostname(value) {
      this.$emit('name-changed', value)
    }
  }
}
</script>
