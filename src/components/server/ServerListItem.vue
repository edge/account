<template>
    <li
      @click=goToServer
      class="serverList__item"
      :class="isActive ? 'active' : isInactive ? 'inactive' : ''"
    >
      <!-- server details -->
      <div class="serverList__field details overflow-hidden">
        <!-- server name -->
        <span class="serverList__name">{{ server.settings.name }}</span>
        <!-- ip address / domain name -->
        <div class="ip__and__domain text-m">
          <span v-if="server.network">{{ server.network.ip[0] }}</span>
          <span v-if="server.network" class="divider hidden"></span>
          <div class="truncate" :data="server.settings.domain">{{ server.settings.domain }}</div>
        </div>
      </div>
      <!-- server specs -->
      <div class="serverList__field specs">
        <!-- OS -->
          <div class="serverList__header flex items-center">
            <div class="mr-1">
              <DistroIcon
                :os="os.group"
                className="w-4 h-4"
              />
            </div>
            <span>{{ os.version }}</span>
          </div>
        <!-- specs -->
        <div class="serverList__stats text-m">
          <span>{{ server.spec.cpus }} vCPU</span>
          <span class="divider"></span>
          <span>{{ formattedDisk }} Disk</span>
          <span class="divider"></span>
          <span>{{ formattedRAM }} RAM</span>
          <span class="divider"></span>
          <span>{{ server.spec.bandwidth }} Mbps</span>
        </div>
      </div>
      <!-- region -->
      <div class="serverList__field zone">
        <span class="serverList__header">Zone</span>
        <div class="flex">
          <img v-if="region" class="flagIcon" :src="flagSrc" alt="flag">
          <span
            class="text-m"
            :class="region ? '' : 'italic text-gray'"
          >
            {{ region ? region.name : 'Unknown' }}
          </span>
        </div>
      </div>
      <!-- created -->
      <div class="serverList__field created">
        <span class="serverList__header">Created</span>
        <span class="text-m">{{ created }}</span>
      </div>
      <!-- status dot -->
      <div class="serverList__field status">
        <span class="serverList__header">Status</span>
        <StatusDot :isActive=isActive :isInactive=isInactive :small="true" :statusText=statusText />
      </div>
    </li>
</template>

<script>
import * as format from '@/utils/format'
import DistroIcon from '@/components/icons/DistroIcon'
import StatusDot from '@/components/StatusDot'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'ServerListItem',
  components: {
    DistroIcon,
    StatusDot
  },
  props: ['server', 'regions'],
  computed: {
    ...mapState(['tasks']),
    activeTasks() {
      return this.$store.getters.tasksByServerId(this.server._key)
    },
    created() {
      const created = moment(this.server.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    },
    disablingTaskInProgress() {
      // server status and active tasks aren't always 100% in sync
      // these tasks are where the status will be displayed in grey whilst running
      return this.isStopping || this.isStarting || this.isResizing || this.isRestoring
    },
    flagSrc() {
      return 'https://hatscripts.github.io/circle-flags/flags/gb.svg'
      // return `https://hatscripts.github.io/circle-flags/flags/${region.flag}.svg`
    },
    formattedDisk() {
      return format.mib(this.server.spec.disk)
    },
    formattedRAM() {
      return format.mib(this.server.spec.ram)
    },
    isActive() {
      return (!this.disablingTaskInProgress) && this.server.status === 'active'
    },
    isCrashed() {
      return this.server.status === 'crashed'
    },
    isDestroying() {
      return this.activeTasks.some(task => task.action === 'destroy')
    },
    isInactive() {
      // eslint-disable-next-line max-len
      return (!this.disablingTaskInProgress) && (['deleted', 'deleting', 'stopped'].includes(this.server.status) || this.isDestroying || this.isCrashed)
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
    region() {
      return this.regions.find(region => region._key === this.server.region)
    },
    statusText() {
      if (this.isStopping) return 'Stopping'
      if (this.isDestroying) return 'Deleting'
      if (this.isResizing) return 'Resizing'
      if (this.isRestoring) return 'Restoring'
      if (this.isStarting) return 'Starting'
      return this.server.status
    },
    os() {
      return this.server.settings.os
    }
  },
  methods: {
    goToServer() {
      this.$router.push(`/server/${this.server._key}`)
    }
  }
}
</script>
<style scoped>
.text-m {
  font-size: 0.8rem;
}

.flagIcon {
  @apply h-4 w-4 rounded-xl mr-1;
}

/* list item */
.serverList__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-t-8 border-gray-400 rounded-md w-full p-5 pr-8;
  @apply cursor-pointer transition-all duration-100;
}
.serverList__item.active {
  @apply border-green;
}
.serverList__item.inactive {
  @apply border-red;
}

/* list item content */
.serverList__field {
  @apply flex flex-col;
}
.serverList__header {
  @apply text-md mr-2;
}
.ip__and__domain {
  @apply flex flex-col overflow-hidden;
}
.zone, .created, .status {
  @apply flex flex-col;
}
.serverList__name {
  @apply text-md text-gray-500 truncate;
}
.active .serverList__name {
  @apply text-green font-medium;
}
.inactive .serverList__name {
  @apply text-red font-medium;
}
.serverList__stats {
  @apply flex space-x-1.5;
}
/* status dot */
.serverList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.active .serverList__statusDot {
  @apply bg-green;
}
.inactive .serverList__statusDot {
  @apply bg-red;
}
.divider {
  @apply h-full bg-gray-400;
  width: 1px
}

/* tablet sized screens up to desktop */
@media (min-width: 470px) {
  .serverList__item {
    @apply grid-rows-3 gap-x-10;
    grid-template-columns: auto;
  }
  .serverList__header {
    @apply mr-0;
  }
  .details {
    @apply col-span-2;
  }
  .ip__and__domain {
    @apply flex-row space-x-1
  }
  .ip__and__domain.divider {
    @apply block;
  }
  .zone {
    @apply col-start-2 row-start-2;
  }

  .created {
    @apply col-start-1 row-start-3;
  }

  .status {
    @apply col-start-2 row-start-3;
  }

  .divider {
    @apply block;
  }
}

@screen lg {
  .serverList__item {
    @apply flex justify-between border-l-8 border-t-0 gap-x-4;
  }
  .details {
    @apply col-span-1 flex-shrink;
    flex-basis: 280px;
  }
  .specs {
    @apply flex-shrink-0;
    flex-basis: 320px;
  }
  .zone {
    @apply col-start-3 row-start-1 flex-shrink-0;
    flex-basis: 80px;
  }
  .created {
    @apply col-start-4 row-start-1 flex-shrink-0;
    flex-basis: 120px;
  }
  .status {
    @apply col-start-5 row-start-1;
    flex-basis: 100px;
  }
  /* zone and created fields are hidden on small desktop screens */
  .zone, .created {
    @apply hidden;
  }
}

@media (min-width: 1180px) {
  .zone, .created {
    @apply flex;
  }
}

@media (max-width: 370px) {
  .serverList__stats {
    @apply flex-col space-x-0;
  }

  .serverList__stats .divider {
    @apply hidden;
  }
}
</style>
