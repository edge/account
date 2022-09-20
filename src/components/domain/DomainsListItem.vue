<template>
    <li
      @click=goToDomain
      class="domainList__item"
    >
      <!-- server details -->
      <div class="domainList__field name overflow-hidden">
        <!-- server name -->
        <span class="domainList__name" :title="domain._key">{{ domain._key }}</span>
      </div>
      <!-- domain records -->
      <div class="domainList__field records overflow-hidden">
        <!-- records -->
        <span class="domainList__header">Records</span>
        <div class="truncate">
          <div v-if="domain.records" class="domainList__records text-m truncate">
            <span :title="recordsList" class="truncate">{{ recordsList }}</span>
          </div>
          <span v-else class="italic text-gray-400">No records</span>
        </div>
      </div>
      <!-- created -->
      <div class="domainList__field created">
        <span class="domainList__header">Created</span>
        <span class="text-m">{{ created }}</span>
      </div>
      <!-- status dot -->
      <div class="domainList__field status">
        <span class="domainList__header">Status</span>
        <StatusDot :isActive=isActive :isInactive="!isActive" :small="true" :statusText=statusText />
      </div>
    </li>
</template>

<script>
// import * as format from '@/utils/format'
import StatusDot from '@/components/StatusDot'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'DomainsListItem',
  components: {
    StatusDot
  },
  props: ['domain'],
  computed: {
    ...mapState(['tasks']),
    created() {
      const created = moment(this.domain.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    },
    isActive() {
      return this.domain.active
    },
    recordsList() {
      let title = ''
      for (const key in this.domain.records) {
        title += `${this.domain.records[key]} ${key} | `
      }
      return title ? title.slice(0, title.length - 3) : 'No records'
    },
    recordTypesCount() {
      return this.domain && Object.keys(this.domain.records).length
    },
    statusText() {
      return this.isActive ? 'Active' : 'Inactive'
    }
  },
  methods: {
    goToDomain() {
      this.$router.push(`/domain/${this.domain._key}`)
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
.domainList__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 rounded-md w-full p-5;
  @apply cursor-pointer transition-all duration-100;
}

/* list item content */
.domainList__field {
  @apply flex flex-col;
}
.domainList__header {
  @apply text-md mr-2;
}
.zone, .created, .status {
  @apply flex flex-col;
}
.domainList__name {
  @apply text-md text-green truncate;
}
.domainList__records {
  @apply flex space-x-1.5;
}
/* status dot */
.domainList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.divider {
  @apply h-full bg-gray-400;
  width: 1px
}

@media (min-width: 350px) {
  .domainList__item {
    grid-template-columns: 1fr 80px;
  }
  .status {
    @apply row-start-1 col-start-2;
  }
}

/* tablet sized screens up to desktop */
@media (min-width: 470px) {
  .domainList__item {
    @apply gap-x-2;
    grid-template-columns: 1fr 100px 80px;
  }
  .domainList__header {
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
  .domainList__item {
    @apply flex justify-between gap-x-2;
  }
  .name {
    @apply flex-1 col-span-1 row-span-2 justify-center;
    flex-basis: 150px;
  }
  .records {
    @apply flex-1 flex-shrink-0;
    flex-basis: 300px;
  }
  .created, .status {
    @apply flex-1 row-start-1 flex-shrink-0;
  }
  .created {
    flex-basis: 100px;
  }
  .status {
    flex-basis: 70px;
  }
}

@media (max-width: 370px) {
  .domainList__records {
    @apply flex-col space-x-0;
  }

  .domainList__records .divider {
    @apply hidden;
  }
}
</style>
