<template>
  <div class="flex flex-col pb-2 space-y-6">
    <div class="input-group">
      <label class="label">Server Name</label>
      <input
        v-model="serverName"
        class="input input--floating"
        placeholder="server-name"
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
      serverName: ''
    }
  },
  watch: {
    serverName(serverName) {
      this.$emit('name-changed', serverName)
    }
  }
}
</script>
