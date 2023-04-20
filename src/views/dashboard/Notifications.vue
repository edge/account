<template>
  <div class="mainContent__inner">
    <h1>Notifications</h1>

    <div class="box">
      <span>
        <input type="checkbox" :checked="includeRead" @change="setIncludeRead" />
        Show read notifications
      </span>
      <span>
        <button type="button" @click="markAllVisibleAsRead">Mark all as read</button>
      </span>
    </div>

    <div v-for="notification in notifications" v-bind:key="notification._key" class="notificationList">
      <li
        :class="[
          'notificationList__item',
          notification.read ? 'read' : 'unread',
          hasAction(notification) ? 'actionable' : ''
        ]"
      >
        <span class="timestamp" v-if="isToday(notification)">{{ timestamp(notification) }}</span>
        <span class="timestamp" v-else>{{ timestamp(notification, true) }}</span>
        <span class="text">{{ notification.text }}</span>
        <div class="actions">
          <button class="action" type="button" v-if="hasAction(notification)" @click="action(notification)">
            <ArrowCircleRightIcon />
            <span class="label">Action</span>
          </button>
          <button class="mark-unread" type="button" v-if="notification.read" @click="markUnread(notification)">
            <DocumentIcon />
            <span class="label">Mark unread</span>
          </button>
          <button class="mark-read" type="button" v-else @click="markRead(notification)">
            <DocumentIcon />
            <span class="label">Mark read</span>
          </button>
          <button class="remove" type="button" @click="remove(notification)">
            <DocumentRemoveIcon />
            <span class="label">Delete</span>
          </button>
        </div>
      </li>
    </div>
  </div>
</template>

<script>
/* global process */
import * as api from '@/account-utils'
import * as format from '@/utils/format'
import { mapState } from 'vuex'
import { ArrowCircleRightIcon, DocumentIcon, DocumentRemoveIcon } from '@heroicons/vue/outline'

const actionTypes = ['account-suspended']

export default {
  name: 'Notifications',
  title() {
    return 'Edge Account Portal » Notifications'
  },
  components: {
    ArrowCircleRightIcon,
    DocumentIcon,
    DocumentRemoveIcon
  },
  data() {
    return {
      limit: 20,
      page: 1,
      notifications: [],
      includeRead: false
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
    async markAllVisibleAsRead() {
      if (this.notifications.length === 0) return
      await api.notifications.markRead(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.notifications.filter(n => n.read !== true)
      )
      await this.refresh()
    },
    async markRead(notification) {
      await api.notifications.markRead(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, [notification])
      await this.refresh()
    },
    async markUnread(notification) {
      await api.notifications.markUnread(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, [notification])
      await this.refresh()
    },
    async refresh() {
      const res = await api.notifications.getNotifications(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        {
          limit: this.limit,
          page: this.page,
          read: this.includeRead ? undefined : false
        }
      )
      this.notifications = res.results
    },
    setIncludeRead(e) {
      if (e.target.checked) this.includeRead = true
      else this.includeRead = false
      this.refresh()
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

.notificationList__item.actionable {
  @apply border-2 border-gray-400;
  cursor: pointer;
}

.notificationList__item.actionable:hover {
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
