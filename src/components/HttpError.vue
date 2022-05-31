<template>
  <div v-if="error" class="flex items-center">
    <ExclamationIcon class="w-5 mr-2 text-red" />
    <span class="text-red">{{ error }}</span>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'

const paramLookup = {
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
    hourlyCost() {
      if (!this.selectedRegion) return 0
      const { bandwidth, cpus, disk, ram } = this.selectedRegion.cost
      const hourlyCost = (bandwidth * (this.serverOptions.spec.bandwidth || 10))
        + (cpus * this.serverOptions.spec.cpus)
        + (disk * this.serverOptions.spec.disk)
        + (ram * this.serverOptions.spec.ram)
      return hourlyCost
    },
    canDeploy() {
      return !this.v$.serverOptions.$invalid || this.isSaving || this.deploying
    },
    deploying() {
      return this.tasks.some(task => task.action === 'create')
    }
  },
  methods: {
    formatError(error) {
      const body = error.response.body

      const field = body.param ? paramLookup[body.param] : ''
      let message = ''
      if (['spec.disk', 'spec.ram'].includes(body.param)) message = this.formatMiBInError(body.reason)
      else message = body.reason || body.message

      return [field, message].join(': ')
    },
    formatMiBInError(errorMessage) {
      const MiB = errorMessage.replace(/^\D+/g, '')
      const GB =  MiB ? `${MiB / 1024} GB` : ''
      return errorMessage.replace(MiB, GB)
    }
  }
}
</script>

