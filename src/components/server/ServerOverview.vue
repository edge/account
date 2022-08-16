<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <div class="box server__details xl:col-span-2">
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
            <span class="label">Status</span><span class="info"><ServerStatus :server="server" /></span>
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
    <div class="box server__specs">
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
    <div class="box server__costs">
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
import * as format from '../../utils/format'
import { DuplicateIcon } from '@heroicons/vue/outline'
import ServerStatus from '@/components/server/ServerStatus'

export default {
  name: 'ServerOverview',
  props: ['region', 'server'],
  components: {
    DuplicateIcon,
    ServerStatus
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
      return `${format.time(ts)}, ${format.date(ts)}`
    }
  }
}
</script>
<style scoped>
.box {
  @apply p-4 md:p-6 bg-white rounded-lg w-full overflow-hidden;
}
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
