<template>
  <div v-if="error" class="error_wrapper errorMessage">
    <div class="float-left">
      <ExclamationIcon class="w-3.5" :class="overCapacityError ? 'text-gray' : 'text-red'" />
    </div>
    <span class="errorMessage__text" :class="overCapacityError ? 'text-gray' : 'text-red'">{{ formattedError }}</span>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'

const paramLookup = {
  'backupCode': 'Backup Code',
  'comment': 'Comment',
  'name': 'Hostname',
  'otp': 'TOTP',
  'paymentMethod': 'Payment Method',
  'path': 'Path',
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

      if (this.overCapacityError) return 'We\'re currently at capacity in this region. Please check back soon.'
      if (this.serviceUnavailableError) return 'Service unavailable. Please try again later or contact support for assistance if this issue persists.'

      const field = body.param && paramLookup[body.param]
      let message = ''
      if (['spec.disk', 'spec.ram'].includes(body.param)) message = this.formatMiBInError(body.reason)
      else message = body.reason || body.message
      // format power dns error messages
      if (message.includes('RRset')) message = this.formatPowerDnsError(message)

      return field ? [field, message].join(': ') : message
    },
    overCapacityError() {
      return this.error.response && this.error.response.body.detail === 'there is no suitable node in cluster'
    },
    serviceUnavailableError() {
      return this.error.status === 503
    }
  },
  methods: {
    formatMiBInError(errorMessage) {
      const MiB = errorMessage.replace(/^\D+/g, '')
      const GB =  MiB ? `${MiB / 1024} GB` : ''
      return errorMessage.replace(MiB, GB)
    },
    formatPowerDnsError(message) {
      const splitMessage = message.split(' ')
      const type = splitMessage[splitMessage.indexOf('IN') + 1]
      let a = 'A'
      if (['A', 'AAAA', 'ALIAS'].includes(type)) a += 'n'
      if (message.includes('Duplicate record')) return `${a} ${type} record with that hostname and value already exists.`
      if (message.includes('has more than one record')) return `${a} ${type} record with that hostname already exists.`
      if (message.includes('Conflicts with pre-existing RRset')) return 'This record conflicts with an existing record.'
    }
  }
}
</script>

<style scoped>
.error_wrapper {
  @apply block;
}
</style>
