<template>
    <li
      class="serverList__item"
      :class="[server.status]"
    >
      <span class="serverList__status" :class="[server.status]" />

      <div class="serverList__main">
        <router-link class="serverList__name" :to="'/server/'+ server._key">
          {{ server.settings.hostname }}
        </router-link>
        <div class="serverList__stats">
          <span>{{ server.spec.cpus }} vCPU</span>
          <span class="text-gray-400">/</span>
          <span>{{ formattedDisk }} Disk</span>
          <span class="text-gray-400">/</span>
          <span>{{ formattedRAM }} RAM</span>
        </div>
      </div>
      <div class="flex items-center flex-shrink-0 mt-3 space-x-5 lg:space-x-0 lg:flex-1 lg:mt-0 lg:justify-between">
        <div class="flex items-center space-x-1 lg:justify-center serverList__cell">
          <UbuntuIcon
            v-if="os.group === 'ubuntu'"
            className="w-5 h-5 text-gray-400 flex-shrink-0"
          />
          <CentOsIcon
            v-if="os.group === 'centos'"
            className="w-5 h-5 text-gray-400 flex-shrink-0"
          />
          <span>
            {{ osGroup }} -
            {{ os.version }}
          </span>
        </div>
        <!-- <span class="lg:text-center serverList__cell">{{ server.ip }}</span> -->
        <!-- <div class="flex items-center lg:justify-end serverList__cell">
          {{ region.name }}
          <img :src=region.flagIcon[0].url width="25" class="ml-2 rounded-sm" />
        </div> -->
      </div>
    </li>
</template>

<script>
import CentOsIcon from '@/components/icons/Centos'
import UbuntuIcon from '@/components/icons/Ubuntu'

export default {
  name: 'ServerListItem',
  components: {
    CentOsIcon,
    UbuntuIcon
  },
  data() {
    return {
      loading: false,
      regions: [],
      servers: []
    }
  },
  props: ['server', 'regionList'],
  computed: {
    formattedDisk() {
      return `${this.server.spec.disk / 1024} GB`
    },
    formattedOSName(os) {
      return os.group.slice(0, 1).toUpperCase() + os.group.slice(1)
    },
    formattedRAM() {
      const ram = this.server.spec.ram
      if (ram < 1024) return `${ram} MB`
      return `${this.server.spec.disk / 1024} GB`
    },
    // region() {
    //   return this.regionList.find(os => os.id === this.server.settings.region.id)
    // },
    os() {
      return this.server.settings.os
    },
    osGroup() {
      const group = this.os.group
      return group.slice(0, 1) + group.slice(1)
    }
  }
}
</script>
<style scoped>
  .serverList__item {
    @apply relative flex flex-wrap flex-col lg:flex-row  lg:items-center justify-between bg-white rounded-md w-full p-5 lg:pr-12;
  }
  .serverList__item.active {
    @apply border-green;
  }
  .serverList__item.inactive {
    @apply border-red;
  }

  /* status dot */
  .serverList__status {
    @apply w-2.5 h-2.5 rounded-full block absolute right-5;
  }
  .serverList__status.active {
    @apply bg-green;
  }
  .serverList__status.inactive {
    @apply bg-red;
  }

  /* first col (multi line) */
  .serverList__main {
    @apply lg:w-1/4 text-gray-500 flex flex-col space-y-0.5 flex-shrink-0;
  }
  .serverList__name {
    @apply text-green text-base font-medium truncate w-full hover:underline;
  }
  .serverList__stats {
    @apply flex space-x-1.5 text-xs flex-shrink-0;
  }
  .serverList__stats span {
    @apply flex-shrink-0;
  }

  /* standard cell */
  .serverList__cell {
    @apply text-gray-500 text-sm lg:w-1/3 truncate;
  }
</style>
