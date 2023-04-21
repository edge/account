<template>
  <RouterLink to="/notifications" class="notifications-link">
    <InboxIcon/>
    <span v-if="unreadNotifications > 0">{{ unreadNotifications }}</span>
  </RouterLink>
</template>

<script>
import { InboxIcon } from '@heroicons/vue/outline'
import { RouterLink } from 'vue-router'
import { mapState } from 'vuex'

export default {
  name: 'NotificationsLink',
  components: {
    InboxIcon,
    RouterLink
  },
  computed: {
    ...mapState(['unreadNotifications'])
  }
}
</script>

<style scoped>
.notifications-link {
  @apply flex flex-row mr-2 items-center;
}

.notifications-link svg {
  @apply w-6;
}

.notifications-link span {
  @apply ml-1 font-bold;
  margin-top: 0.1rem;
}

.notifications-link:hover {
  @apply text-green;
}

.notifications-link:hover svg {
  @apply text-green;
}
</style>
