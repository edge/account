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
import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Pagination from '@/components/Pagination'
import Tooltip from '@/components/Tooltip'
import { mapState } from 'vuex'
import { ArrowCircleRightIcon, CheckCircleIcon, TrashIcon } from '@heroicons/vue/outline'

const actionMap = {
  'account-2fa-added': ['Manage account', function () {
    this.$router.push('/account')
  }],
  'account-2fa-disabled': ['Manage account', function () {
    this.$router.push('/account')
  }],
  'account-2fa-enabled': ['Manage account', function () {
    this.$router.push('/account')
  }],
  'account-2fa-removed': ['Manage account', function () {
    this.$router.push('/account')
  }],
  // 'account-advice-unsuspend':
  'account-dns-confirmed': ['Go to DNS zone', function (notification) {
    this.$router.push(`/domain/${notification.data.key}`)
  }],
  'account-dns-unconfirmed': ['Go to DNS zone', function (notification) {
    this.$router.push(`/domain/${notification.data.key}`)
  }],
  'account-email-verified': ['Manage account', function () {
    this.$router.push('/account')
  }],
  'account-funded': ['Go to purchase', function (notification) {
    this.$router.push(`/billing/payments/purchase/${notification.data.key}`)
  }],
  'account-funding-failed': ['Manage payment methods', function () {
    this.$router.push('/billing/payments')
  }],
  'account-payment-method-added': ['Manage payment methods', function () {
    this.$router.push('/billing/payments')
  }],
  'account-payment-method-removed': ['Manage payment methods', function () {
    this.$router.push('/billing/payments')
  }],
  'account-server-added': ['Go to server', function (notification) {
    this.$router.push(`/server/${notification.data.key}`)
  }],
  // 'account-server-removed':
  'account-warn-low-balance': ['Go to billing', function () {
    this.$router.push('/billing/wallet')
  }],
  'account-warn-suspend': ['Go to billing', function () {
    this.$router.push('/billing/wallet')
  }]
}

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
    ...mapState(['account', 'session', 'unreadNotifications']),
    currentPage() {
      return this.pageHistory[this.pageHistory.length - 1]
    }
  },
  methods: {
    action(notification) {
      if (actionMap[notification.type] !== undefined) actionMap[notification.type][1].apply(this, [notification])
    },
    actionLabel(notification) {
      if (actionMap[notification.type] !== undefined) return actionMap[notification.type][0]
      return 'Action'
    },
    changePage(newPage) {
      this.pageHistory = [...this.pageHistory, newPage]
    },
    hasAction(notification) {
      return actionMap[notification.type] !== undefined
    },
    isToday(notification) {
      const now = new Date()
      const then = new Date(notification.created)
      return now.getDate() === then.getDate() && now.getMonth() === then.getMonth() && now.getFullYear() === then.getFullYear()
    },
    async markAllRead() {
      if (this.notifications.length === 0) return
      await utils.updateAllNotifications(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
        account: this.account._key,
        read: true
      })
      await this.refresh()
    },
    async markRead(notification) {
      await utils.updateNotifications(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, [{
        _key: notification._key,
        read: true
      }])
      await this.refresh()
    },
    async markUnread(notification) {
      await utils.updateNotifications(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, [{
        _key: notification._key,
        read: false
      }])
      await this.refresh()
    },
    async refresh() {
      const res = await utils.getNotifications(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
        limit: this.limit,
        page: this.currentPage,
        read: this.includeRead ? undefined : false
      })
      this.notifications = res.results
      this.metadata = res.metadata
      this.loaded = true
      this.$store.dispatch('updateUnreadNotifications')
    },
    async remove(notification) {
      await utils.deleteNotifications(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, [{
        _key: notification._key
      }])
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
  @apply flex pb-3 pl-1 pr-1 sm:pr-6;
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
