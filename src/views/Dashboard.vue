<template>
  <div class="flex w-full min-full-height">
    <SideNavigation />
    <main class="flex flex-col w-full mainContent">
      <TopNavigation />
      <SuspensionWarning v-if="loaded" />
      <Announcements v-if="loaded" />
      <router-view v-if="loaded" />
    </main>
  </div>
</template>

<script>
import Announcements from '@/components/Announcements'
import SideNavigation from '@/components/SideNavigation'
import SuspensionWarning from '@/components/SuspensionWarning'
import TopNavigation from '@/components/TopNavigation'
import { mapState } from 'vuex'

const STORE_REFRESH_INTERVAL = 5 * 1000
const CHECK_SESSION_INTERVAL = 15 * 1000
const NOTIFICATION_INTERVAL = 60 * 1000
const HEARTBEAT_INTERVAL = 10 * 60 * 1000

export default {
  name: 'Dashboard',
  title() {
    return 'Edge Account Portal » Server'
  },
  data() {
    return {
      iAccount: null,
      iHeartbeat: null,
      iNotification: null,
      lastHeartbeat: null
    }
  },
  computed: {
    ...mapState(['account', 'balance', 'config', 'tasks']),
    loaded() {
      return this.account && this.balance && this.config
    }
  },
  components: {
    Announcements,
    SideNavigation,
    SuspensionWarning,
    TopNavigation
  },
  methods: {
    removeTask(task) {
      // delay added to remove task to give server status a chance to catch up
      setTimeout(() => {
        this.$store.commit('deleteTask', task)
      }, 500)
    }
  },
  mounted() {
    // get any active tasks and balance on page load
    this.$store.dispatch('getActiveTasks')
    this.$store.dispatch('getAnnouncements')
    this.$store.dispatch('updateConfig')
    this.$store.dispatch('updateAccount')
    this.$store.dispatch('updateBalance')
    this.$store.dispatch('updateSubscriptions')
    this.$store.dispatch('updateUnreadNotifications')

    // poll all active tasks, balance and server count
    this.iAccount = setInterval(() => {
      this.$store.dispatch('updateAccount')
      this.$store.dispatch('updateBalance')
      this.$store.dispatch('updateTasks')
    }, STORE_REFRESH_INTERVAL)

    // keep session alive
    this.iHeartbeat = setInterval(() => {
      try {
        if (this.lastHeartbeat > Date.now() - HEARTBEAT_INTERVAL) return
        this.$store.dispatch('sessionHeartbeat')
        this.lastHeartbeat = Date.now()
      }
      catch (error) {
        clearInterval(this.iAccount)
        clearInterval(this.iHeartbeat)
        this.$store.dispatch('signOut')
        this.$router.push('/sign-in')
      }
    }, CHECK_SESSION_INTERVAL)

    // check for notifications
    this.iNotification = setInterval(() => {
      this.$store.dispatch('updateUnreadNotifications')
    }, NOTIFICATION_INTERVAL)
  },
  unmounted() {
    clearInterval(this.iAccount)
    clearInterval(this.iHeartbeat)
    clearInterval(this.iNotification)
  },
  watch: {
    tasks() {
      this.tasks.forEach(task => {
        // remove any tasks that compelte from the store
        if (['complete', 'gone', 'failed'].includes(task.status)) this.removeTask(task)
        /**  @todo - handle failed tasks */
        if (task.status === 'failed') console.error(`failed task: ${task._key}`)
      })
    }
  }
}
</script>
<style>
.min-full-height {
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
}

.mainContent {
  @apply relative flex-1;
}

.mainContent__inner {
  @apply px-3 pb-3 md:px-5 md:pb-5 lg:px-8 lg:pb-8 pt-0 mt-7;
}
</style>
