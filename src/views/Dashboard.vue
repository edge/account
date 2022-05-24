<template>
  <div class="flex w-full min-h-screen">
    <SideNavigation />
    <main class="flex flex-col w-full mainContent">
      <TopNavigation />
      <router-view />
    </main>
  </div>
</template>

<script>
import SideNavigation from '@/components/SideNavigation'
import TopNavigation from '@/components/TopNavigation'
import { mapState } from 'vuex'

const TASK_REFRESH_INTERVAL = 5 * 1000

export default {
  name: 'Dashboard',
  title() {
    return 'Edge Account Portal » Server'
  },
  computed: {
    ...mapState(['tasks'])
  },
  components: {
    SideNavigation,
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
    // get any active tasks on page load
    this.$store.dispatch('getActiveTasks')

    // poll all active tasks
    setInterval(() => this.$store.dispatch('updateTasks'), TASK_REFRESH_INTERVAL)
  },
  watch: {
    tasks() {
      this.tasks.forEach(task => {
        // remove any tasks that compelte from the store
        if (task.status === 'complete') this.removeTask(task)
        // TODO - handle failed and gone tasks
        if (task.status === 'failed' || task.states === 'gone') console.log('FAILED TASK')
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
