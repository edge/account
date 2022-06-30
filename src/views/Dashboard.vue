<template>
  <div class="flex w-full min-h-screen">
    <SideNavigation />
    <main class="flex flex-col w-full mainContent">
      <TopNavigation />
      <SuspensionWarning />
      <router-view />
    </main>
  </div>
</template>

<script>
import SideNavigation from '@/components/SideNavigation'
import SuspensionWarning from '@/components/SuspensionWarning'
import TopNavigation from '@/components/TopNavigation'
import { mapState } from 'vuex'

const STORE_REFRESH_INTERVAL = 5 * 1000
const HEARTBEAT_INTERVAL = 10 * 60 * 1000

export default {
  name: 'Dashboard',
  title() {
    return 'Edge Account Portal » Server'
  },
  data() {
    return {
      iAccount: null,
      iHeartbeat: null
    }
  },
  computed: {
    ...mapState(['tasks'])
  },
  components: {
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
    this.$store.dispatch('updateBalance')
    this.$store.dispatch('updateServerCount')

    // poll all active tasks, balance and server count
    this.iAccount = setInterval(() => {
      this.$store.dispatch('updateAccount')
      this.$store.dispatch('updateTasks')
      this.$store.dispatch('updateBalance')
      this.$store.dispatch('updateServerCount')
    }, STORE_REFRESH_INTERVAL)

    // keep session alive
    this.iHeartbeat = setInterval(() => {
      this.$store.dispatch('sessionHeartbeat')
    }, HEARTBEAT_INTERVAL)
  },
  unmounted() {
    clearInterval(this.iAccount)
    clearInterval(this.iHeartbeat)
  },
  watch: {
    tasks() {
      this.tasks.forEach(task => {
        // remove any tasks that compelte from the store
        if (['complete', 'gone'].includes(task.status)) this.removeTask(task)
        // TODO - handle failed tasks
        if (task.status === 'failed') console.error(`failed task: ${task._key}`)
      })
    }
  }
}
</script>
<style>
  .mainContent {
    @apply relative flex-1;
  }

  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-7;
  }
</style>
