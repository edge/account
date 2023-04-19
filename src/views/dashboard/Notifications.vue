<template>
  <div class="mainContent__inner">
    <h1>Notifications</h1>

    <div v-for="notification in notifications" v-bind:key="notification._key" class="notificationList">
      <li
        :class="[
          'notificationList__item',
          notification.read ? 'read' : 'unread',
          hasAction(notification) ? 'clickable' : ''
        ]"
        @click="action(notification)"
      >
        <span class="timestamp" v-if="isToday(notification)">{{ timestamp(notification) }}</span>
        <span class="timestamp" v-else>{{ timestamp(notification, true) }}</span>
        <span class="text">{{ notification.text }}</span>
      </li>
    </div>
  </div>
</template>

<script>
/* global process */
import * as api from '@/account-utils'
import * as format from '@/utils/format'
import { mapState } from 'vuex'

const actionTypes = ['account-suspended']

export default {
  name: 'Notifications',
  title() {
    return 'Edge Account Portal » Notifications'
  },
  components: {},
  data() {
    return {
      limit: 20,
      page: 1,
      notifications: []
    }
  },
  computed: {
    ...mapState(['session'])
  },
  methods: {
    action(notification) {
      switch (notification.type) {
      case 'account-suspended':
        this.$router.push('/billing/wallet')
        break
      default:
        break
      }
    },
    hasAction(notification) {
      return actionTypes.includes(notification.type)
    },
    isToday(notification) {
      const now = new Date()
      const then = new Date(notification.created)
      return now.getDate() === then.getDate() && now.getMonth() === then.getMonth() && now.getFullYear() === then.getFullYear()
    },
    async refresh() {
      const res = await api.notifications.getNotifications(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.page
        }
      )
      this.notifications = res.results
    },
    timestamp(notification, withDate) {
      return withDate
        ? `${format.date(notification.created)}, ${format.time(notification.created)}`
        : format.time(notification.created)
    }
  },
  mounted() {
    this.refresh()
    this.iDomains = setInterval(() => {
      this.refresh()
    }, 60000)
  }
}
</script>

<style scoped>
.notificationList {
  @apply mt-2 space-y-2;
}

.notificationList__item {
  @apply flex flex-col bg-white text-gray-500 rounded-md w-full px-5 pr-4 py-3;
}

.notificationList__item.clickable {
  @apply border-2 border-gray-400;
  cursor: pointer;
}

.notificationList__item.clickable:hover {
  @apply border-gray-500;
  cursor: pointer;
  opacity: 100%;
}

.notificationList__item.unread .text {
  @apply font-bold;
}

.notificationList__item.read {
  opacity: 80%;
}
</style>
