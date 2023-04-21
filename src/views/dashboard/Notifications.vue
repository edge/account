<template>
  <div class="mainContent__inner">
    <h1>Notifications</h1>

    <div class="controls">
      <div class="page-controls">
        <span>
          <input id="include-read" type="checkbox" :checked="includeRead" @change="setIncludeRead" />
          <label for="include-read" class="ml-2">Show read notifications</label>
        </span>
      </div>
      <div class="page-actions" v-if="unreadNotifications > 0">
        <button class="mark-read" type="button" @click="markAllRead()">
          <Tooltip text="Mark all read">
            <CheckCircleIcon class="w-6 hover:text-green"/>
          </Tooltip>
        </button>
      </div>
    </div>

    <div v-if="!loaded" class="box mt-2 flex items-center">
      <span>Loading notifications</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>
    <div v-else-if="notifications.length === 0" class="box mt-2 flex items-center">
      <span>You have no new notifications.</span>
    </div>
    <div v-else>
      <div v-for="notification in notifications" v-bind:key="notification._key" class="notificationList">
        <li
          :class="[
            'notificationList__item',
            notification.read ? 'read' : 'unread',
            hasAction(notification) ? 'actionable' : ''
          ]"
        >
          <div class="details">
            <span class="timestamp" v-if="isToday(notification)">{{ timestamp(notification) }}</span>
            <span class="timestamp" v-else>{{ timestamp(notification, true) }}</span>
            <span class="text">{{ notification.text }}</span>
          </div>
          <div class="actions">
            <button class="action" type="button" v-if="hasAction(notification)" @click="action(notification)">
              <Tooltip :text="actionLabel(notification)">
                <ArrowCircleRightIcon class="w-6 hover:text-green"/>
              </Tooltip>
            </button>
            <button class="mark-unread" type="button" v-if="notification.read" @click="markUnread(notification)">
              <Tooltip text="Mark unread">
                <CheckCircleIcon class="w-6 hover:text-green"/>
              </Tooltip>
            </button>
            <button class="mark-read" type="button" v-else @click="markRead(notification)">
              <Tooltip text="Mark read">
                <CheckCircleIcon class="w-6 hover:text-green"/>
              </Tooltip>
            </button>
            <button class="remove" type="button" @click="remove(notification)">
              <Tooltip text="Delete">
                <TrashIcon class="w-6 hover:text-red"/>
              </Tooltip>
            </button>
          </div>
        </li>
      </div>
    </div>

    <Pagination
      :currentPage=currentPage
      :limit=limit
      :totalCount="metadata.totalCount"
      @change-page=changePage
    />
  </div>
</template>

<script>
/* global process */
import * as api from '@/account-utils'
import * as format from '@/utils/format'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
import { ArrowCircleRightIcon, CheckCircleIcon, TrashIcon } from '@heroicons/vue/outline'

const actionTypes = ['account-suspended']

export default {
  name: 'Notifications',
  title() {
    return 'Edge Account Portal » Notifications'
  },
  components: {
    ArrowCircleRightIcon,
    CheckCircleIcon,
    LoadingSpinner,
    Pagination,
    TrashIcon,
    Tooltip
  },
  data() {
    return {
      includeRead: false,
      limit: 20,
      loaded: false,
      metadata: {
        totalCount: 0
      },
      notifications: [],
      pageHistory: [1]
    }
  },
  computed: {
    ...mapState(['session', 'unreadNotifications']),
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    }
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
    actionLabel(notification) {
      switch (notification.type) {
      case 'account-suspended':
        return 'Go to billing'
      default:
        return 'Action'
      }
    },
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    hasAction(notification) {
      return actionTypes.includes(notification.type)
    },
    isToday(notification) {
      const now = new Date()
      const then = new Date(notification.created)
      return now.getDate() === then.getDate() && now.getMonth() === then.getMonth() && now.getFullYear() === then.getFullYear()
    },
    async markAllRead() {
      if (this.notifications.length === 0) return
      await api.notifications.markAllRead(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key)
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
          page: this.currentPage,
          read: this.includeRead ? undefined : false
        }
      )
      this.notifications = res.results
      this.metadata = res.metadata
      this.loaded = true
      this.$store.dispatch('updateUnreadNotifications')
    },
    async remove(notification) {
      await api.notifications.deleteNotifications(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, [notification])
      await this.refresh()
      this.$store.dispatch('updateUnreadNotifications')
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
  },
  watch: {
    pageHistory() {
      this.refresh()
    }
  }
}
</script>

<style scoped>
.controls {
  @apply flex pb-3 pl-1 pr-6;
}

.controls .page-controls {
  @apply flex flex-col w-full;
}

.controls .page-actions {
  @apply flex flex-col w-max sm:flex-row;
}

.notificationList {
  @apply mt-2 space-y-2;
}

.notificationList__item {
  @apply flex bg-white text-gray-500 rounded-md w-full px-5 pr-4 py-3;
}

.notificationList__item.unread .text {
  @apply font-bold;
}

.notificationList__item .details {
  @apply flex flex-col w-full;
}

.notificationList__item .actions {
  @apply flex flex-col w-max sm:flex-row;
}

.notificationList__item .actions button {
  @apply sm:mr-2;
}

.page-actions button,
.actions button {
  line-height: 0;
}
</style>
