<template>
  <strong class="flex-shrink-0 block logo">
    <router-link to="/">
      <img src="/assets/logo.svg" alt="Edge" :class="[size === 'small' ? 'w-20' : 'w-28']">
    </router-link>
  </strong>
</template>

<script>
export default {
  name: 'Logo',
  props: {
    size: {
      type: String
    }
  }
}
</script>
