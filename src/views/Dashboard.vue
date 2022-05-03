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
import SideNavigation from "@/components/SideNavigation"
import TopNavigation from "@/components/TopNavigation"
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

import { useRoute } from 'vue-router'
import useSWRV from 'swrv'
import { fetcher } from '../utils/api'
import { mapActions } from 'vuex'

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
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TopNavigation
  },
  methods: {
    ...mapActions(['setVncSettings'])
  }
}
</script>
<style scoped>
  .mainContent {
    @apply relative flex-1;
  }
  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-7;
  }

  /* crumbs */
  .crumbs {
    @apply flex space-x-2 mb-2 items-center;
  }
  .crumbs li {
    @apply text-gray-400;
  }
  .crumbs li a {
    @apply text-green hover:text-green hover:underline;
  }
  .tabGroup {
    @apply relative;
  }

  .tabs {
    @apply w-full space-x-4 md:space-x-8 border-b border-gray-300 overflow-auto flex flex-nowrap;
  }
  .tab {
    @apply pb-1 font-medium border-b text-gray-500 border-transparent;
    @apply hover:text-black;
  }
  .tab--selected {
    @apply text-green border-green;
    @apply hover:text-green;
  }
  .server-detail {
    @apply flex-shrink-0;
  }
  .server-icon {
    @apply w-4 h-4 text-gray-500 flex-shrink-0;
  }
  .specsGradient {
    @apply absolute top-0 right-0 w-10 h-full pointer-events-none sm:hidden bg-gradient-to-l from-gray-200;
  }
</style>
