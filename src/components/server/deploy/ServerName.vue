<template>
  <div class="flex flex-col pb-2 space-y-6">
    <div class="input-group">
      <label class="label">Server Name</label>
      <input
        v-model="serverName"
        class="input input--floating"
        :disabled=disableControls
        :class="disableControls ? 'disabled' : ''"
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
  props: ['disableControls', 'hostname'],
  data () {
    return {
      serverName: ''
    }
  },
  watch: {
    hostname() {
      this.serverName = this.hostname
    },
    serverName(serverName) {
      this.$emit('name-changed', serverName)
    }
  }
}
</script>

<style scoped>
input.disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
