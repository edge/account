<template>
    <div class="mobileNavigation">
      <div class="flex-shrink-0 h-16 md:h-20"></div>
      <div class="mobileNavigation__inner">
        <div class="px-3 py-4 bg-gray-200 border-b border-gray-300">
          <Search size="full" />
        </div>
        <div class="mobileNavigation__menu">
          <Menu :mainNav="mainNav"/>
          <router-link
            to="/servers/deploy"
          >
            <button class="w-full mt-5 button button--success">Deploy Server</button>
          </router-link>
        </div>
        <div class="mobileNavigation__tools">
          <NavigationTools/>
        </div>
      </div>
    </div>
</template>

<script>
import Menu from '@/components/Menu'
import NavigationTools from '@/components/NavigationTools'
import Search from '@/components/Search'

export default {
  name: 'MobileNavigation',
  data: function () {
    return {
      showNav: false,
      mainNav: [
        {
          link: '/servers',
          text: 'Servers'
        }
        ,
        {
          link: '/storage',
          text: 'Storage'
        },
        {
          link: '/content-deliver',
          text: 'Content Delivery',
          disabled: true
        },
        {
          link: '/databases',
          text: 'Databases',
          disabled: true
        },
        {
          link: '/domains',
          text: 'Domains',
          disabled: true
        },
        {
          link: '/shield',
          text: 'Shield',
          disabled: true
        }
      ]
    }
  },
  components: {
    Menu,
    NavigationTools,
    Search
  }
}
</script>
<style scoped>
  .mobileNavigation {
    @apply fixed pointer-events-none opacity-0 right-0 w-full top-0 flex flex-col h-screen overflow-auto border-r border-gray-300;
    @apply transition-all transform -translate-x-full duration-500;
  }
  .menu-open .mobileNavigation {
    @apply opacity-100 translate-x-0;
  }
  .mobileNavigation__inner {
    @apply flex-1 flex flex-col bg-white pb-6 pointer-events-auto;
  }
  .mobileNavigation__menu {
    @apply flex-1 px-3 flex-shrink-0 mt-8;
  }
  .mobileNavigation__tools {
    @apply bg-white pt-6 px-6 border-t border-gray-300;
  }
</style>
