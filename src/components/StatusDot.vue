<template>
  <div
    class="flex items-center"
    :class="[
      isActive ? 'active' : '',
      isInactive ? 'inactive' : '',
      large ? 'text-lg' : '',
      small ? 'text-m' : ''
    ]"
  >
    <span class="statusDot" :class="large ? 'lg' : ''" />
    <span class="statusText capitalize">{{ statusText }}</span>
  </div>
</template>

<script>

export default {
  name: 'StatusDot',
  props: ['isActive', 'isInactive', 'large', 'small', 'statusText']
}
</script>

<style>
.text-m {
  font-size: 0.8rem;
}

/* status dot */
.statusDot {
  @apply w-2.5 h-2.5 rounded-full mr-1 bg-gray-400;
}
.statusDot.lg {
  @apply w-3 h-3;
}
.active .statusDot {
  @apply bg-green;
}
.inactive .statusDot {
  @apply bg-red;
}
.active .statusText {
  @apply text-green;
}
.inactive .statusText {
  @apply text-red;
}
</style>
