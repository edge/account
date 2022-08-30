<template>
  <div
    class="flex items-center"
    :class="[
      isActive ? 'active' : '',
      isInactive ? 'inactive' : '',
      extraClass
    ]"
  >
    <span class="domainList__statusDot" />
    <span class="domainList__statusText capitalize">{{ status }}</span>
  </div>
</template>

<script>
// import { mapState } from 'vuex'

export default {
  name: 'DomainStatus',
  props: ['extraClass', 'domain'],
  computed: {
    isActive() {
      return true
    },
    isInactive() {
      return false
    },
    status() {
      // if (this.isStopping) return 'Stopping'
      // if (this.isDestroying) return 'Deleting'
      // if (this.isResizing) return 'Resizing'
      // if (this.isRestoring) return 'Restoring'
      // if (this.isStarting) return 'Starting'
      return this.domain.status || 'Active'
    }
  }
}
</script>

<style>
.text-m {
  font-size: 0.8rem;
}

/* status dot */
.domainList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.active .domainList__statusDot {
  @apply bg-green;
}
.inactive .domainList__statusDot {
  @apply bg-red;
}
.active .domainList__statusText {
  @apply text-green;
}
.inactive .domainList__statusText {
  @apply text-red;
}
</style>
