<template>
  <div class="space-y-4">
    <div class="box">
      <h4>Details</h4>
      <div class="details__grid">
        <div class="details__item">
          <span class="details__label">Display Name</span>
          <span class="details__info">{{ integration.name }}</span>
        </div>
        <div class="details__item lg:row-start-2 lg:col-start-2">
          <span class="details__label col-2">Origin URL</span>
          <span class="details__info">{{ integration.data.config.origin }}</span>
        </div>
        <div class="details__item">
          <span class="details__label">Primary Domain</span>
          <span class="details__info">{{ integration.data.config.domain }}</span>
        </div>
        <div class="details__item lg:row-start-3" v-if="integration.data.config.additionalDomains.length">
          <span class="details__label">Additional Domains</span>
          <div class="flex flex-col space-y-2 truncate">
            <span
              v-for="domain in integration.data.config.additionalDomains"
              :key="domain"
              class="details__info"
            >
              {{ domain }}
            </span>
          </div>
        </div>
        <div class="details__item lg:row-start-1 lg:col-start-2">
          <span class="details__label col-2">Status</span>
          <span class="details__info">
            <StatusDot :isActive=isActive :isInactive="isInactive" :statusText=statusText />
          </span>
        </div>
        <div class="details__item lg:col-start-2">
          <span class="details__label col-2">Created</span>
          <span class="details__info">{{ created }}</span>
        </div>
      </div>
    </div>
    <IntegrationMetrics :integration=integration />
  </div>
</template>

<script>
import * as format from '@/utils/format'
import IntegrationMetrics from '@/components/cdn/IntegrationMetrics'
import StatusDot from '@/components/StatusDot'

export default {
  name: 'IntegrationOverview',
  props: ['integration'],
  components: {
    IntegrationMetrics,
    StatusDot
  },
  computed: {
    created() {
      return `${format.date(this.integration.created)}, ${format.time(this.integration.created)}`
    },
    domains() {
      return [
        this.integration.data.config.domain,
        ...this.integration.data.config.additionalDomains
      ]
    },
    isActive() {
      return this.integration.active
    },
    isInactive() {
      return this.integration.suspended || !this.isActive
    },
    statusText() {
      return this.isActive ? 'Active' : 'Suspended'
    }
  }
}
</script>

<style scoped>
.details__grid {
  @apply grid lg:grid-cols-2 gap-4
}

.details__item {
  @apply flex truncate;
}
.details__info {
  @apply truncate;
}
.details__label {
  @apply font-bold block mr-2 flex-shrink-0 w-36;
}
.details__label.col-2 {
  @apply lg:w-20
}

@media (max-width: 500px) {
  .details__item {
    @apply flex-col
  }
}
</style>
