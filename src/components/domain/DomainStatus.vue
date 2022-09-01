<template>
  <div
    class="flex items-center"
    :class="[
      isActive ? 'active' : 'inactive',
      large ? 'text-lg' : 'text-m'
    ]"
  >
    <span class="domainList__statusDot" :class="large ? 'lg' : ''" />
    <span class="domainList__statusText capitalize">{{ status }}</span>
  </div>
</template>

<script>
// import { mapState } from 'vuex'

export default {
  name: 'DomainStatus',
  props: ['domain', 'large'],
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
.domainList__statusDot.lg {
  @apply w-3 h-3;
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
