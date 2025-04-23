<script setup>
import { DuplicateIcon } from '@heroicons/vue/outline'
import StatusDot from '../../../components/StatusDot.vue'
import { defineProps, ref } from 'vue'
import * as format from '@/utils/format'

defineProps({
  gpu: Object
})

const copied = ref(false)

async function copyToClipboard(str) {
  await navigator.clipboard.writeText(str)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 1000)
}

function formatTimestamp(ts) {
  return `${format.date(ts)}, ${format.time(ts)}`
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <div class="box overflow_hidden gpu-details xl:col-span-2">
      <h4 class="section__title">Server details</h4>
      <div class="overview__grid">
        <!-- Name, hostname, IP address -->
        <div class="grid__col col__1">
          <div class="info__section">
            <span class="label">Name</span><span class="info">{{ gpu.name }}</span>
          </div>
          <div class="info__section">
            <span class="label">Hostname</span><span class="info">{{ gpu.hostname }}</span>
          </div>
          <div class="info__section">
            <span class="label">IP Address</span>
            <div class="relative flex w-max">
              <span>{{ gpu.ipAddress }}</span>
              <button
                @click.prevent="copyToClipboard(gpu.ipAddress)"
                class="text-gray-400 hover:text-green"
              >
                <DuplicateIcon class="ml-2 w-5 h-5" />
              </button>
              <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
            </div>
          </div>
        </div>
        <div class="grid__col col__2">
          <div class="info__section">
            <span class="label">Status</span>
            <span class="info">
              <StatusDot
                :isActive="gpu.status === 'active'"
                :isInactive="gpu.status !== 'active'"
                :statusText="gpu.status === 'active' ? 'Active' : 'Inactive'"
              />
            </span>
          </div>
          <div class="info__section">
            <span class="label">Created</span>
            <span class="info">{{ formatTimestamp(gpu.created) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="box overflow_hidden gpu-specs">
      <h4 class="section__title">GPU specs</h4>
      <div class="info__section mb-4">
        <span class="label">GPU Model</span>
        <span class="info">{{ gpu.gpuModel }}</span>
      </div>
      <!-- vcpus, ram, disk, bandwidth -->
      <div class="overview__grid">
        <div class="info__section">
          <span class="label">GPU</span>
          <span class="info">{{ gpu.gpuCount }}</span>
        </div>
        <div class="info__section">
          <span class="label">vCPUs</span>
          <span class="info">{{ gpu.cpuCount }}</span>
        </div>
        <div class="info__section">
          <span class="label">RAM</span>
          <span class="info">{{ gpu.memoryGiB }} GiB</span>
        </div>
        <div class="info__section">
          <span class="label">Disk</span>
          <span class="info">{{ gpu.diskGiB }} GiB</span>
        </div>
      </div>
    </div>
  </div>
</template>

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
.gpu-details .info__section {
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
  .gpu-details .info__section {
    @apply flex-col;
  }
}

@media (min-width: 450px) {
  .gpu-details .info__section {
    @apply flex-row;
  }

  .gpu-specs .overview__grid, .gpu-costs .overview__grid {
    @apply grid-cols-2;
  }
  .gpu-specs .label, .gpu-costs .label {
    @apply w-20;
  }

  /* .overview__grid {
    @apply grid-cols-2
  } */
}
@screen lg {
  .gpu-specs .overview__grid {
    @apply grid-cols-4;
  }
  .gpu-specs .label {
    @apply w-max;
  }
  .gpu-costs .label {
    @apply w-max;
  }
}
@screen xl {
  .gpu-details .overview__grid {
    @apply grid-cols-2
  }
  .gpu-specs .overview__grid {
    @apply grid-cols-2
  }
}
@screen 2xl {
  .gpu-specs .overview__grid {
    grid-template-columns: repeat(3, 1fr) auto;
  }
}
</style>
