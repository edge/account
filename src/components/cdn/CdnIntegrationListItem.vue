<template>
    <li
      @click=goToIntegration
      class="cdnList__item"
    >
      <!-- name -->
      <div class="cdnList__field name overflow-hidden">
        <span class="cdnList__header">Name</span>
        <span class="text-m" :title="integration.name">{{ integration.name }}</span>
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
        <StatusDot :isActive="true" :isInactive="false" :small="true" :statusText="'active'" />
      </div>
    </li>
</template>

<script>
// import * as format from '@/utils/format'
import StatusDot from '@/components/StatusDot'
import moment from 'moment'

export default {
  name: 'CdnIntegrationListItem',
  components: {
    StatusDot
  },
  props: ['integration'],
  computed: {
    created() {
      const created = moment(this.integration.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
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

.flagIcon {
  @apply h-4 w-4 rounded-xl mr-1;
}

/* list item */
.cdnList__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 rounded-md w-full p-5;
  @apply cursor-pointer transition-all duration-100;
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
.cdnList__records {
  @apply flex space-x-1.5;
}
/* status dot */
.cdnList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.divider {
  @apply h-full bg-gray-400;
  width: 1px
}

@media (min-width: 350px) {
  .cdnList__item {
    grid-template-columns: 1fr 80px;
  }
  .status {
    @apply row-start-1 col-start-2;
  }
}

/* tablet sized screens up to desktop */
@media (min-width: 470px) {
  .cdnList__item {
    @apply gap-x-2;
    grid-template-columns: 1fr 100px 80px;
  }
  .cdnList__header {
    @apply mr-0;
  }
  .name {
    @apply col-span-3;
  }
  .records, .created, .status {
    @apply row-start-2 col-span-1
  }
  .status {
    @apply justify-self-end
  }
  .divider {
    @apply block;
  }
}

@screen lg {
  .cdnList__item {
    @apply flex justify-between gap-x-2;
  }
  .name {
    @apply flex-1 flex-shrink-0 col-span-1 row-span-2 justify-center;
    flex-basis: 100px;
  }
  .domain {
    @apply flex-1;
    flex-basis: 300px;
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

@media (max-width: 370px) {
  .cdnList__records {
    @apply flex-col space-x-0;
  }

  .cdnList__records .divider {
    @apply hidden;
  }
}
</style>
