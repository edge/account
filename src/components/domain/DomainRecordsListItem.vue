<template>
    <li class="recordList__item">
      <div class="recordList__field type">
        <span class="recordList__header">Type</span>
        <!-- server name -->
        <span class="recordList__value text-center">{{ record.type }}</span>
      </div>
      <!-- server details -->
      <div class="recordList__field name overflow-hidden">
        <span class="recordList__header">Hostname</span>
        <span class="recordList__value">{{ record.name }}</span>
      </div>
      <!-- domain records -->
      <div class="recordList__field value">
        <!-- records -->
        <span class="recordList__header">Value</span>
        <span class="recordList__value">{{ record.value }}</span>
      </div>
      <!-- created -->
      <div class="recordList__field ttl">
        <span class="recordList__header">TTL</span>
        <span class="recordList__value">{{ record.ttl }}</span>
      </div>
      <!-- settings -->
      <div class="recordList__field settings justify-center">
        <div class="hover:text-green cursor-pointer">
          <CogIcon class="w-7" />
        </div>
        <div></div>
      </div>
    </li>
</template>

<script>
// import * as format from '@/utils/format'
import { CogIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'DomainsListItem',
  components: {
    CogIcon
  },
  props: ['record'],
  computed: {
    ...mapState(['tasks']),
    created() {
      const created = moment(this.record.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    }
  },
  methods: {
  }
}
</script>
<style scoped>
.text-m {
  font-size: 0.8rem;
}

/* list item */
.recordList__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 rounded-md w-full p-5 pr-8;
}

/* list item content */
.recordList__field {
  @apply flex flex-col;
}
.recordList__header {
  @apply text-md mr-2;
}
.ip__and__domain {
  @apply flex flex-col overflow-hidden;
}
.zone, .created, .status {
  @apply flex flex-col;
}
.recordList__value {
  @apply text-sm text-black truncate;
}
.recordList__stats {
  @apply flex space-x-1.5;
}
/* status dot */
.recordList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.divider {
  @apply h-full bg-gray-400;
  width: 1px
}

/* tablet sized screens up to desktop */
@media (min-width: 470px) {
  .recordList__item {
    @apply grid-rows-3 gap-x-10;
    grid-template-columns: auto;
  }
  .recordList__header {
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
  .recordList__item {
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
  .recordList__stats {
    @apply flex-col space-x-0;
  }

  .recordList__stats .divider {
    @apply hidden;
  }
}
</style>
