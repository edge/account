<template>
    <div class="sideNavigation">
      <div class="px-6">
        <Logo/>
      </div>
      <div class="sideNavigation__menu">
        <Menu v-if="services" :mainNav="mainNav" />
      </div>
      <!-- <div class="sideNavigation__tools">
        <NavigationTools/>
      </div> -->
    </div>
</template>

<script>
import Logo from '@/components/Logo'
import Menu from '@/components/Menu'
// import NavigationTools from '@/components/NavigationTools'
import { mapState } from 'vuex'

const nav = [
  {
    _key: 'cdn',
    link: '/cdn',
    text: 'Content Delivery'
  },
  {
    _key: 'servers',
    link: '/servers',
    text: 'Servers'
  },
  {
    _key: 'dns',
    link: '/domains',
    text: 'Domains'
  },
  {
    _key: 'page',
    link: '/pages',
    text: 'Pages'
  },
  {
    _key: 'storage',
    link: '/storage',
    text: 'Storage'
  },
  {
    _key: 'db',
    link: '/databases',
    text: 'Databases'
  },
  {
    _key: 'shield',
    link: '/shield',
    text: 'Shield'
  }
]

export default {
  name: 'SideNavigation',
  computed: {
    ...mapState(['progress', 'services']),
    mainNav() {
      const navItems = nav.map(item => {
        const service = this.services.find(s => s._key === item._key)
        const disabled = !service || (!service.public && !service.beta)
        const beta = service && service.beta
        return { ...item, disabled, beta }
      })

      // add getting started to the top of the nav if not completed
      if (!this.progress.all) {
        navItems.unshift({
          _key: 'getting-started',
          link: '/getting-started',
          text: 'Getting Started'
        })
      }

      return navItems
    }
  },
  components: {
    Logo,
    Menu
    // NavigationTools
  }
}
</script>
<style scoped>
  .sideNavigation {
    @apply hidden md:sticky top-0 md:flex flex-col w-52 lg:w-64 flex-shrink-0 overflow-auto py-6 bg-white border-r border-gray-300;
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
