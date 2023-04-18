<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <div class="box overflow_hidden server__details xl:col-span-2">
      <h4 class="section__title">Server details</h4>
      <div class="overview__grid">
        <!-- name, hostname, ip, region -->
        <div class="grid__col col__1">
          <div class="info__section">
            <span class="label">Server Name</span><span class="info">{{ server.settings.name }}</span>
          </div>
          <div class="info__section">
            <span class="label">Hostname</span><span class="info">{{ server.settings.domain }}</span>
          </div>
          <div class="info__section">
            <span class="label">IP Address</span>
            <div class="relative flex w-max">
              <span class="">{{ server.network.ip[0] }}</span>
              <button
                @click.prevent="copyToClipboard(server.network.ip[0])"
                class="text-gray-400 hover:text-green"
              >
                <DuplicateIcon class="ml-2 w-5 h-5" />
              </button>
              <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
            </div>
          </div>
          <div class="info__section">
            <span class="label">Region</span>
            <span class="info">{{ region ? region.name : 'Unknown' }}</span>
          </div>
        </div>
        <!-- status, os, created, updated -->
        <div class="grid__col col__2">
          <div class="info__section">
            <span class="label">Status</span><span class="info">
              <StatusDot
                :isActive=isActive
                :isInactive=isInactive
                :statusText=statusText
              />
            </span>
          </div>
          <div class="info__section">
            <span class="label">OS</span><span class="info">{{ server.settings.os.version }}</span>
          </div>
          <div class="info__section">
            <span class="label">Created</span><span class="info">{{ created }}</span>
          </div>
          <div class="info__section">
            <span class="label">Last Updated</span><span class="info">{{ updated }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="box overflow_hidden server__specs">
      <h4 class="section__title">Server specs</h4>
      <!-- vcpus, ram, disk, bandwidth -->
      <div class="overview__grid">
        <div class="info__section">
          <span class="label">vCPUs</span><span class="info">{{ server.spec.cpus }}</span>
        </div>
        <div class="info__section">
          <span class="label">RAM</span><span class="info">{{ formattedRAM }}</span>
        </div>
        <div class="info__section">
          <span class="label">Disk</span><span class="info">{{ formattedDisk }}</span>
        </div>
        <div class="info__section">
          <span class="label">Bandwidth</span><span class="info">{{ server.spec.bandwidth }} Mbps</span>
        </div>
      </div>
    </div>
    <div class="box overflow_hidden server__costs">
      <h4 class="section__title">Estimated costs</h4>
      <!-- hourly and daily costs -->
      <div class="overview__grid">
        <div class="info__section">
          <span class="label">Hourly</span><span class="info">${{ formattedHourlyCost }}</span>
        </div>
        <div class="info__section">
          <span class="label">Daily</span><span class="info">${{ formattedDailyCost }}</span>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import * as format from '@/utils/format'
import { DuplicateIcon } from '@heroicons/vue/outline'
import StatusDot from '@/components/StatusDot'

export default {
  name: 'ServerOverview',
  props: ['activeTasks', 'region', 'server'],
  components: {
    DuplicateIcon,
    StatusDot
  },
  data() {
    return {
      copied: false
    }
  },
  computed: {
    created() {
      return this.formatTimestamp(this.server.created)
    },
    disablingTaskInProgress() {
      return this.isStopping || this.isStarting || this.isResizing || this.isRestoring
    },
    formattedDailyCost() {
      return format.usd(this.hourlyCost * 24, 2)
    },
    formattedDisk() {
      return format.mib(this.server.spec.disk)
    },
    formattedHourlyCost() {
      return format.usd(this.hourlyCost, 4)
    },
    formattedRAM() {
      return format.mib(this.server.spec.ram)
    },
    hourlyCost() {
      return this.region && (
        (this.region.cost.bandwidth * (this.server.spec.bandwidth)) +
        (this.region.cost.ram * this.server.spec.ram) +
        (this.region.cost.disk * this.server.spec.disk) +
        (this.region.cost.cpus * this.server.spec.cpus)
      )
    },isCreating() {
      return this.activeTasks.some(task => task.action === 'create')
    },
    isActive() {
      return (!this.disablingTaskInProgress) && this.server.status === 'active'
    },
    isDestroyed() {
      return this.server.status === 'deleted' && !this.activeTasks.some(task => task.action === 'destroy')
    },
    isDestroying() {
      return this.activeTasks.some(task => task.action === 'destroy')
    },
    isInactive() {
      return (!this.disablingTaskInProgress) && (['deleted', 'deleting', 'stopped'].includes(this.server.status) || this.isDestroying)
    },
    isResizing() {
      const diskResize = this.activeTasks.some(task => task.action === 'resizeDisk')
      const resourceResize = this.activeTasks.some(task => task.action === 'resizeResource')
      return diskResize || resourceResize
    },
    isRestoring() {
      return this.activeTasks.some(task => task.action === 'restoreBackup')
    },
    isStarting() {
      return this.activeTasks.some(task => task.action === 'start')
    },
    isStopping() {
      return this.activeTasks.some(task => task.action === 'stop')
    },
    statusText() {
      if (this.isStopping) return 'Stopping'
      if (this.isDestroying) return 'Deleting'
      if (this.isResizing) return 'Resizing'
      if (this.isRestoring) return 'Restoring'
      if (this.isStarting) return 'Starting'
      return this.server.status
    },
    updated() {
      return this.formatTimestamp(this.server.updated)
    }
  },
  methods: {
    async copyToClipboard(str) {
      await navigator.clipboard.writeText(str)
      this.copied = true

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    formatTimestamp(ts) {
      return `${format.date(ts)}, ${format.time(ts)}`
    }
  }
}
</script>
<style scoped>
.section__title {
  @apply mb-4;
}
.overview__grid {
  @apply grid grid-cols-1 gap-y-4;
}
.grid__col {
  @apply flex flex-col space-y-4
}
.info__section {
  @apply flex overflow-hidden w-full;
}
.label {
  @apply font-bold block mr-2 flex-shrink-0 w-24;
}
.server__details .info__section {
  @apply flex-col;
}

.info {
  @apply flex-shrink-0 truncate w-full;
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}

@media (max-width: 450px) {
  .server__details .info__section {
    @apply flex-col;
  }
}

@media (min-width: 450px) {
  .server__details .info__section {
    @apply flex-row;
  }

  .server__specs .overview__grid, .server__costs .overview__grid {
    @apply grid-cols-2;
  }
  .server__specs .label, .server__costs .label {
    @apply w-20;
  }

  /* .overview__grid {
    @apply grid-cols-2
  } */
}
@screen lg {
  .server__specs .overview__grid {
    @apply grid-cols-4;
  }
  .server__specs .label {
    @apply w-max;
  }
  .server__costs .label {
    @apply w-max;
  }
}
@screen xl {
  .server__details .overview__grid {
    @apply grid-cols-2
  }
  .server__specs .overview__grid {
    @apply grid-cols-2
  }
}
@screen 2xl {
  .server__specs .overview__grid {
    grid-template-columns: repeat(3, 1fr) auto;
  }
}
</style>
