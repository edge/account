<template>
    <li
      @click=goToDomain
      class="domainList__item"
    >
      <!-- server details -->
      <div class="domainList__field name overflow-hidden">
        <!-- server name -->
        <span class="domainList__name">{{ domain._key }}</span>
      </div>
      <!-- domain records -->
      <div class="domainList__field records">
        <!-- records -->
        <span class="domainList__header">Records</span>
        <div>
          <div v-if="domain.records" class="domainList__stats text-m">
            <div v-for="(count, type, index) in domain.records"
              :key="type"
              class="flex space-x-2"
            >
              <span>{{count}} {{type}}</span>
              <span v-if="index !== recordTypesCount - 1" class="divider"></span>
            </div>
          </div>
          <span v-else class="italic text-gray-400">No records</span>

          <!-- <span>A</span>
          <span class="divider"></span>
          <span>MX</span>
          <span class="divider"></span>
          <span>CNAME</span>
          <span class="divider"></span>
          <span></span> -->
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
        <DomainStatus extraClass="text-m" :domain=domain />
      </div>
    </li>
</template>

<script>
// import * as format from '@/utils/format'
import DomainStatus from '@/components/domain/DomainStatus'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'DomainsListItem',
  components: {
    DomainStatus
  },
  props: ['domain'],
  computed: {
    ...mapState(['tasks']),
    created() {
      const created = moment(this.domain.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    },
    recordTypesCount() {
      return this.domain && Object.keys(this.domain.records).length
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
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 rounded-md w-full p-5 pr-8;
  @apply cursor-pointer transition-all duration-100;
}

/* list item content */
.domainList__field {
  @apply flex flex-col;
}
.domainList__header {
  @apply text-md mr-2;
}
.ip__and__domain {
  @apply flex flex-col overflow-hidden;
}
.zone, .created, .status {
  @apply flex flex-col;
}
.domainList__name {
  @apply text-md text-green truncate;
}
.domainList__stats {
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

/* tablet sized screens up to desktop */
@media (min-width: 470px) {
  .domainList__item {
    @apply grid-rows-3 gap-x-10;
    grid-template-columns: auto;
  }
  .domainList__header {
    @apply mr-0;
  }
  .name {
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
  .domainList__item {
    @apply flex justify-between gap-x-4;
  }
  .name {
    @apply col-span-1 row-span-2 flex-shrink justify-center;
    flex-basis: 280px;
  }
  .records {
    @apply flex-shrink-0;
    flex-basis: 320px;
  }
  .created {
    @apply col-start-4 row-start-1 flex-shrink-0;
    flex-basis: 120px;
  }
  .status {
    @apply col-start-5 row-start-1;
    flex-basis: 100px;
  }
}

@media (max-width: 370px) {
  .domainList__stats {
    @apply flex-col space-x-0;
  }

  .domainList__stats .divider {
    @apply hidden;
  }
}
</style>
