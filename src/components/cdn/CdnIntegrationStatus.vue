<template>
  <div
    class="flex items-center"
    :class="[
      isActive ? 'active' : 'inactive',
      large ? 'text-lg' : 'text-m'
    ]"
  >
    <span class="cdnList__statusDot" :class="large ? 'lg' : ''" />
    <span class="cdnList__statusText capitalize">{{ status }}</span>
  </div>
</template>

<script>

export default {
  name: 'CdnIntegrationStatus',
  props: ['integration', 'large'],
  computed: {
    isActive() {
      return true
      /** @todo */
      return this.integration.active
    },
    status() {
      return 'Active'
      /** @todo */
      return this.integration.active ? 'Active' : 'Inactive'
    }
  }
}
</script>

<style>
.text-m {
  font-size: 0.8rem;
}

/* status dot */
.cdnList__statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.cdnList__statusDot.lg {
  @apply w-3 h-3;
}
.active .cdnList__statusDot {
  @apply bg-green;
}
.inactive .cdnList__statusDot {
  @apply bg-red;
}
.active .cdnList__statusText {
  @apply text-green;
}
.inactive .cdnList__statusText {
  @apply text-red;
}
</style>
