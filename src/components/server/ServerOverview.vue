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
            <span class="label">IP Address</span><span class="info">{{ server.network.ip[0] }}</span>
          </div>
          <div class="info__section">
            <span class="label">Region</span><span class="info">{{ region && region.name }}</span>
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
          <span class="label">Daily</span><span class="info">${{ formattedHourlyCost }}</span>
        </div>
        <div class="info__section">
          <span class="label">Hourly</span><span class="info">${{ formattedDailyCost }}</span>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import ServerStatus from '@/components/server/ServerStatus'
import moment from 'moment'

export default {
  name: 'ServerOverview',
  props: ['region', 'server'],
  data() {
    return {

    }
  },
  components: {
    ServerStatus
  },
  computed: {
    created() {
      return this.formatTimestamp(this.server.created)
    },
    formattedDailyCost() {
      return this.formatCost(this.hourlyCost * 24, 2)
    },
    formattedDisk() {
      return this.formatMiB(this.server.spec.disk)
    },
    formattedHourlyCost() {
      return this.formatCost(this.hourlyCost, 4)
    },
    formattedRAM() {
      return this.formatMiB(this.server.spec.ram)
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
    formatCost(cost, decimalPlaces) {
      const mult = 10**decimalPlaces
      return (Math.round(cost * mult) / mult).toFixed(decimalPlaces)
    },
    formatMiB(MiB) {
      if (MiB < 1024) {
        return `${MiB} MiB`
      }
      return `${MiB / 1024} GiB`
    },
    formatTimestamp(ts) {
      const mnt = moment(ts)
      return `${mnt.format('LT')}, ${mnt.format('LL')}`
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

@media (max-width: 450px) {
  .server__details .info__section {
    @apply flex-col;
  }
}

@media (min-width: 450px) {
  .server__details .info {
    width: calc(100% - 96)
  }
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
    @apply grid-cols-4
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
    @apply grid-cols-4
  }
}
</style>
