<template>
  <p>TODO A</p>
</template>

<script>
// import StatusDot from '@/components/StatusDot'
import moment from 'moment'

export default {
  name: 'IntegrationListItem',
  components: {
    // StatusDot
  },
  props: ['integration'],
  computed: {
    created() {
      const created = moment(this.integration.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
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
  },
  methods: {
    goToIntegration() {
      this.$router.push(`/pages/${this.integration._key}`)
    }
  }
}
</script>

<style scoped>
.text-m {
font-size: 0.8rem;
}

/* list item */
.integrationList__item {
@apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-t-8 border-gray-400 rounded-md w-full p-5;
@apply cursor-pointer transition-all duration-100;
}
.integrationList__item.active {
@apply border-green;
}
.integrationList__item.inactive {
@apply border-red;
}

/* list item content */
.cdnList__field {
@apply flex flex-col;
}
.cdnList__header {
@apply text-md mr-2;
}
.status {
@apply flex flex-col;
}
.cdnList__name {
@apply text-md text-green truncate;
}

@media (min-width: 350px) {
  .integrationList__item {
    grid-template-columns: repeat(2, 1fr);
  }
  .status {
    @apply row-start-2 col-start-2;
  }
  .created {
    @apply row-start-2;
  }
}

@screen sm {
  .integrationList__item {
    @apply border-l-8 border-t-0;
    @apply flex justify-between gap-x-2;
  }
  .name {
    @apply flex-1 flex-shrink-0 col-span-1 row-span-2 justify-center;
    flex-basis: 350px;
  }
  .created {
    @apply flex-1 row-start-2 flex-shrink-0;
    flex-basis: 100px;
  }
  .status {
    @apply flex-1 row-start-1 flex-shrink-0;
    flex-basis: 100px;
  }
}
</style>
