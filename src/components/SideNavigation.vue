<template>
    <div class="sideNavigation">
      <div class="px-6">
        <Logo/>
      </div>
      <div class="sideNavigation__menu">
        <Menu :mainNav="mainNav"/>
      </div>
      <!-- <div class="sideNavigation__tools">
        <NavigationTools/>
      </div> -->
    </div>
</template>

<script>
import Logo from '@/components/Logo'
import Menu from '@/components/Menu'
import NavigationTools from '@/components/NavigationTools'

export default {
  name: 'SideNavigation',
  data: function () {
    return {
      mainNav: [
        {
          link: '/servers',
          text: 'Servers'
        }
        ,
        {
          link: '/storage',
          text: 'Storage',
          disabled: true
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
    Logo,
    Menu,
    NavigationTools
  }
}
</script>
<style scoped>
  .sideNavigation {
    @apply hidden md:sticky top-0 md:flex flex-col w-64 flex-shrink-0 overflow-auto py-6 bg-white border-r border-gray-300;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }
  .sideNavigation__menu {
    @apply flex-1 mt-20 px-3 flex-shrink-0;
  }
  .sideNavigation__tools {
    @apply bg-white pt-6 px-6 border-t border-gray-300;
  }
</style>
