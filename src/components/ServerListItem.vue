<template>
    <li
      @click=goToServer
      class="serverList__item"
      :class="isActive ? 'active' : isInactive ? 'inactive' : ''"
    >
      <!-- server details -->
      <div class="serverList__field details overflow-hidden">
        <!-- server name -->
        <span class="serverList__name">{{ server.settings.name ||server.settings.hostname }}</span>
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
              <UbuntuIcon
                v-if="os.group === 'ubuntu'"
                className="w-5 h-5"
              />
              <CentOsIcon
                v-if="os.group === 'centos'"
                className="w-5 h-5"
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
        </div>
      </div>
      <!-- region -->
      <div class="serverList__field zone">
        <span class="serverList__header">Zone</span>
        <div class="flex">
          <img class="flagIcon" :src="region.flag" alt="flag">
          <span class="text-m">{{ region.name }}</span>
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
        <div class="flex items-center">
          <span class="serverList__statusDot" />
          <span
            class="capitalize text-m"
            :class="[
              isActive ? 'text-green' : '',
              isInactive ? 'text-red' : ''
            ]"
          >
            {{ server.status }}
          </span>
        </div>
      </div>
    </li>
</template>

<script>
import CentOsIcon from '@/components/icons/Centos'
import UbuntuIcon from '@/components/icons/Ubuntu'
import moment from 'moment'

export default {
  name: 'ServerListItem',
  components: {
    CentOsIcon,
    UbuntuIcon
  },
  props: ['server', 'regions'],
  computed: {
    created() {
      const created = moment(this.server.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    },
    formattedDisk() {
      return `${this.server.spec.disk / 1024} GB`
    },
    formattedRAM() {
      const ram = this.server.spec.ram
      if (ram < 1024) return `${ram} MB`
      return `${this.server.spec.disk / 1024} GB`
    },
    isActive() {
      return this.server.status === 'active'
    },
    isInactive() {
      return this.server.status === 'stopped' || this.server.status === 'crashed'
    },
    region() {
      return this.regions.find(region => region._key === this.server.region)
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
@media (min-width: 450px) {
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
    flex-basis: 220px;
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
</style>
