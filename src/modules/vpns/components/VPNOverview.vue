<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <div class="box overflow_hidden vpn__details xl:col-span-2">
      <h4 class="section__title">VPN details</h4>
      <div class="overview__grid">
        <!-- name, hostname, ip, region -->
        <div class="grid__col col__1">
          <div class="info__section">
            <span class="label">VPN Name</span><span class="info">{{ vpn.name }}</span>
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
    <div class="box overflow_hidden vpn__specs">
      <h4 class="section__title">VPN specs</h4>
      <div class="overview__grid">
        <div class="info__section">
          <span class="label">Type</span>
          <span v-if="vpn.multiuser" class="info">Multiuser</span>
          <span v-else class="info">Single-user</span>
        </div>
        <div class="info__section">
          <span class="label">Speed</span>
          <span v-if="vpn.speed === 'fastest'" class="info">Fastest</span>
          <span v-else-if="vpn.speed === 'faster'" class="info">Faster</span>
          <span v-if="vpn.speed === 'fast'" class="info">Fast</span>
        </div>
      </div>
    </div>
    <div class="box overflow_hidden vpn__costs">
      <h4 class="section__title">Cost</h4>
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
import { mapState } from 'vuex'

export default {
  name: 'VPNOverview',
  props: ['region', 'server', 'vpn'],
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
    ...mapState(['config']),
    activeTasks() {
      if (this.server) return this.$store.getters.tasksByServerId(this.server._key)
      return []
    },
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
      if (this.vpn.multiuser) {
        const chargeableUsers = Math.max(0, this.vpn.users - this.config.vpn.multiuser.usersIncluded)
        const userCost = this.config.vpn.multiuser.costPerUser * chargeableUsers
        const periodCost = this.config.vpn.multiuser.cost + userCost
        const hourlyCost = periodCost / this.config.vpn.multiuser.costBasis
        return hourlyCost
      }

      return this.config.vpn.singleuser.cost / this.config.vpn.singleuser.costBasis
    },
    isCreating() {
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
      return this.formatTimestamp(this.server.updatedByUser || this.server.created)
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
.vpn__details .info__section {
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
  .vpn__details .info__section {
    @apply flex-col;
  }
}

@media (min-width: 450px) {
  .vpn__details .info__section {
    @apply flex-row;
  }

  .vpn__specs .overview__grid, .vpn__costs .overview__grid {
    @apply grid-cols-2;
  }
  .vpn__specs .label, .vpn__costs .label {
    @apply w-20;
  }

  /* .overview__grid {
    @apply grid-cols-2
  } */
}
@screen lg {
  .vpn__specs .overview__grid {
    @apply grid-cols-4;
  }
  .vpn__specs .label {
    @apply w-max;
  }
  .vpn__costs .label {
    @apply w-max;
  }
}
@screen xl {
  .vpn__details .overview__grid {
    @apply grid-cols-2
  }
  .vpn__specs .overview__grid {
    @apply grid-cols-2
  }
}
@screen 2xl {
  .vpn__specs .overview__grid {
    grid-template-columns: repeat(3, 1fr) auto;
  }
}
</style>
