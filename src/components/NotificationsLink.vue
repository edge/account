<template>
  <RouterLink to="/notifications" class="notifications-link">
    <InboxIcon/>
  </RouterLink>
</template>

<script>
import { InboxIcon } from '@heroicons/vue/outline'
import { RouterLink } from 'vue-router'

export default {
  name: 'NotificationsLink',
  components: {
    InboxIcon,
    RouterLink
  }
}
</script>

<style scoped>
.notifications-link {
  width: 24px;
}
</style>
