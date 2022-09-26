<template>
    <li
      @click=goToIntegration
      class="cdnList__item"
      :class="isActive ? 'active' : isInactive ? 'inactive' : ''"
    >
      <!-- name -->
      <div class="cdnList__field name overflow-hidden">
        <span
          class="text-md truncate"
          :class="isActive ? 'text-green' : 'text-red'"
          :title="integration.name"
        >
          {{ integration.name }}
        </span>
      </div>
      <!-- domain -->
      <div class="cdnList__field domain overflow-hidden">
        <span class="cdnList__header">Domain</span>
        <span class="text-m" :title="integration.data.domain">{{ integration.data.domain }}</span>
      </div>
      <!-- requests -->
      <div class="cdnList__field requests">
        <span class="cdnList__header">Requests (24h)</span>
        <!-- @todo -->
        <span class="text-m">TBD</span>
      </div>
      <!-- traffic -->
      <div class="cdnList__field traffic">
        <!-- @todo -->
        <span class="cdnList__header">Traffic (24h)</span>
        <span class="text-m">TBD</span>
      </div>
      <!-- status dot -->
      <div class="domainList__field status">
        <span class="domainList__header">Status</span>
        <StatusDot :isActive="isActive" :isInactive="!isActive" :small="true" :statusText="statusText" />
      </div>
    </li>
</template>

<script>
// import * as format from '@/utils/format'
import StatusDot from '@/components/StatusDot'

export default {
  name: 'CdnIntegrationListItem',
  components: {
    StatusDot
  },
  props: ['integration'],
  computed: {
    isActive() {
      return this.integration.active
    },
    statusText() {
      return this.isActive ? 'Active' : 'Inactive'
    }
  },
  methods: {
    goToIntegration() {
      this.$router.push(`/cdn/${this.integration._key}`)
    }
  }
}
</script>
<style scoped>
.text-m {
  font-size: 0.8rem;
}

/* list item */
.cdnList__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-t-8 border-gray-400 rounded-md w-full p-5;
  @apply cursor-pointer transition-all duration-100;
}
.cdnList__item.active {
  @apply border-green;
}
.cdnList__item.inactive {
  @apply border-red;
}

/* list item content */
.cdnList__field {
  @apply flex flex-col;
}
.cdnList__header {
  @apply text-md mr-2;
}
.domain, .status {
  @apply flex flex-col;
}
.cdnList__name {
  @apply text-md text-green truncate;
}

@media (min-width: 350px) {
  .cdnList__item {
    grid-template-columns: repeat(2, 1fr);
  }
  .status {
    @apply row-start-2 col-start-2;
  }
  .domain {
    @apply row-start-2;
  }
  .requests, .traffic {
    @apply row-start-3;
  }
}

@screen sm {
  .cdnList__item {
    @apply border-l-8 border-t-0;
    grid-template-columns: repeat(3, 1fr) 80px;
  }
  .name {
    @apply row-start-1 col-span-4;
  }
  .domain {
    @apply row-start-2 col-start-1;
  }
  .requests, .traffic {
    @apply row-start-2;
  }
  .requests {
    @apply col-start-2;
  }
  .traffic {
    @apply col-start-3;
  }
  .status {
    @apply col-start-4 row-start-2;
  }
}

@screen lg {
  .cdnList__item {
    @apply flex justify-between gap-x-2;
  }
  .name {
    @apply flex-1 flex-shrink-0 col-span-1 row-span-2 justify-center;
    flex-basis: 150px;
  }
  .domain {
    @apply flex-1;
    flex-basis: 200px;
  }
  .status {
    @apply flex-1 row-start-1 flex-shrink-0;
    flex-basis: 70px;
  }

  .requests, .traffic {
    @apply flex-1 flex-shrink-0;
    flex-basis: 150px;
  }
}
</style>
