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
      <span v-if="errors.hostname">{{errors.hostname}}</span>
    </div>
    <div class="input-group">
      <label class="label">Server</label>
      <input type="text" placeholder="Server" value="forest_tanzanite.edge.network" class="input input--floating" />
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'ServerName',
  data () {
    return {
      errors: {},
      hostname: ''
    }
  },
  methods: {
    validateHostname(value) {
      console.log('value', value)
      const regex = /^[a-zA-Z0-9]{1}[a-zA-Z0-9-_\.]+$/

      console.log('regex.test(value)', regex.test(value))
      console.log('regex.exec(value)', regex.exec(value))

      if (regex.test(value)) {
        this.errors.hostname = ''
        return true
      } else {
        this.errors.hostname = 'Invalid'
        return false
      }
    },
    ...mapMutations([
      'selectServerProperty'
    ])
  },
  watch: {
    hostname(value) {
      if (this.validateHostname(value)) {
        this.hostname = value
        this.selectServerProperty({ property: 'serverHostname', value })
      }
    }
  }
}
</script>

<style scoped>

</style>
