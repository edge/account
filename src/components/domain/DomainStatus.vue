<template>
  <div
    class="flex items-center text-m"
    :class="[
      isActive ? 'active' : 'inactive'
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
  props: ['domain'],
  computed: {
    isActive() {
      return this.domain.active
    },
    status() {
      return this.domain.active ? 'Active' : 'Inactive'
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
