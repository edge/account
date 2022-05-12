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

export default {
  name: 'Dashboard',
  title() {
    return 'Edge Account Portal » Server'
  },
  data: function () {
    return {
      activeTask: null,
      loading: false,
      polling: null,
      server: null,
      tasks: [],
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  components: {
    SideNavigation,
    TopNavigation
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
