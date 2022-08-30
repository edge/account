<template>
  <div v-if="error" class="error_wrapper errorMessage">
    <div class="float-left">
      <ExclamationIcon class="w-3.5 text-red" />
    </div>
    <span class="errorMessage__text text-red">{{ formattedError }}</span>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'

const paramLookup = {
  'backupCode': 'Backup Code',
  'comment': 'Comment',
  'name': 'Hostname',
  'otp': 'TOTP',
  'region': 'Region',
  'region.servers': 'Servers',
  'spec.cpus': 'vCPU',
  'spec.disk': 'Disk',
  'spec.ram': 'RAM',
  'settings.os': 'Operating System',
  'settings.hostname': 'Hostname',
  'settings.domain': 'Domain',
  'ttl': 'TTL',
  'type': 'Type',
  'value': 'Value',
  'zone': 'Domain'
}

export default {
  name: 'HttpError',
  props: ['error'],
  components: {
    ExclamationIcon
  },
  computed: {
    formattedError() {
      const body = this.error.response.body

      const field = body.param && paramLookup[body.param]
      let message = ''
      if (['spec.disk', 'spec.ram'].includes(body.param)) message = this.formatMiBInError(body.reason)
      else message = body.reason || body.message

      return field ? [field, message].join(': ') : message
    }
  },
  methods: {
    formatMiBInError(errorMessage) {
      const MiB = errorMessage.replace(/^\D+/g, '')
      const GB =  MiB ? `${MiB / 1024} GB` : ''
      return errorMessage.replace(MiB, GB)
    }
  }
}
</script>

<style scoped>
.error_wrapper {
  @apply block;
}
</style>
