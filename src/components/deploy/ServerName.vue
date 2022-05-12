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

import { fetcher } from '../../utils/api'
import useSWRV from 'swrv'

export default {
  name: 'ServerName',
  data () {
    return {
      hostname: ''
    }
  },
  mounted() {
    // Get a new, random hostname.
    const { data } = useSWRV(() => '/servers?action=getHostname', fetcher)

    setTimeout(() => {
      this.hostname = data && data.value && data.value.hostname
    }, 1000)
  },
  watch: {
    hostname(value) {
      if (value) {
        this.$emit('name-changed', value)
      }
    }
  }
}
</script>
