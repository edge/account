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
// import * as utils from '../../account-utils'

export default {
  name: 'ServerName',
  data () {
    return {
      hostname: ''
    }
  },
  methods: {
    async getNewHostname() {
      // await utils.servers.getHostname()

      // temporary test code
      this.hostname = 'testname'
    }
  },
  mounted() {
    // Get a new, random hostname.
    this.getNewHostname()
  },
  watch: {
    hostname(hostname) {
      this.$emit('name-changed', hostname)
    }
  }
}
</script>
