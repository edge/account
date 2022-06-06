<template>
  <div v-if="error" class="flex items-center">
    <ExclamationIcon class="w-5 mr-2 text-red" />
    <span class="text-red">{{ formattedError }}</span>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'

const paramLookup = {
  'comment': 'Comment',
  'region': 'Region',
  'spec.cpus': 'vCPU',
  'spec.disk': 'Disk',
  'spec.ram': 'RAM',
  'settings.os': 'Operating System',
  'settings.hostname': 'Hostname',
  'settings.domain': 'Domain'
}

export default {
  name: 'HttpError',
  props: ['error'],
  components: {
    ExclamationIcon
  },
  data() {
    return {

    }
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

