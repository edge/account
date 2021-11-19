
<template>
  <ul class="navigation-tools">
    <li class="navigation-tools__item">
      <a href="/support" class="navigation-tools__link" target="_blank" rel="noreferrer">
        <span class="header-tools__icon">
          <SupportIcon class="w-5 h-5" />
        </span>
        <span>Support</span>
      </a>
    </li>
  </ul>
</template>

<script>
  import {SupportIcon} from "@heroicons/vue/outline";
  export default {
    name: "NavigationTools",
    components: {SupportIcon}
  }
</script>

<style scoped>
  .navigation-tools {
    @apply flex flex-col space-y-2
  }
  .navigation-tools__item {
  }
  .navigation-tools__link {
    @apply flex items-center space-x-1 text-gray-600;
  }
  .navigation-tools__icon {
  }
</style>