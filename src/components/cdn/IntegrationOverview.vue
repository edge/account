<template>
  <div class="box">
    <h4>Details</h4>
    <div class="flex flex-col space-y-4">
      <div class="details__item">
        <span class="details__label">Display Name</span>
        <span class="details__info">{{ integration.name }}</span>
      </div>
      <div class="details__item">
        <span class="details__label">Origin URL</span>
        <span class="details__info">{{ integration.data.config.origin }}</span>
      </div>
      <div class="details__item">
        <span class="details__label">Primary Domain</span>
        <span class="details__info">{{ integration.data.domain }}</span>
      </div>
      <div class="details__item" v-if="integration.data.additionalDomains.length">
        <span class="details__label">Additional Domains</span>
        <div class="flex flex-col space-y-2">
          <span
            v-for="domain in integration.data.additionalDomains"
            :key="domain"
            class="details__info"
          >
            {{ domain }}
          </span>
        </div>
      </div>
      <div class="details__item">
        <span class="details__label">Status</span>
        <span class="details__info">
          <StatusDot :isActive=isActive :isInactive="!isActive" :statusText=statusText />
        </span>
      </div>
      <div class="details__item">
        <span class="details__label">Created</span>
        <span class="details__info">{{ created }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as format from '@/utils/format'
import StatusDot from '@/components/StatusDot'

export default {
  name: 'IntegrationOverview',
  props: ['integration'],
  components: {
    StatusDot
  },
  computed: {
    created() {
      return `${format.date(this.integration.created)}, ${format.time(this.integration.created)}`
    },
    domains() {
      return [
        this.integration.data.domain,
        ...this.integration.data.additionalDomains
      ]
    },
    isActive() {
      return this.integration.active
    },
    statusText() {
      return this.isActive ? 'Active' : 'Inactive'
    }
  }
}
</script>

<style scoped>
.details__item {
  @apply flex
}

.details__label {
  @apply font-bold block mr-2 flex-shrink-0 w-40;
}
</style>
