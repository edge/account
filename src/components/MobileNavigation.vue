<template>
    <div class="mobileNavigation">
      <div class="flex-shrink-0 h-16 md:h-20"></div>
      <div class="mobileNavigation__inner">
        <!-- <div class="px-3 py-4 bg-gray-200 border-b border-gray-300">
          <Search size="full" />
        </div> -->
        <div class="mobileNavigation__account">
          <span class="text-xs">ACCOUNT NO.</span>
          <span>{{ formattedAccountNumber }}</span>
        </div>
        <div class="mobileNavigation__menu">
          <Menu v-if="services" :mainNav="mainNav" :closeNav=closeNav />
        </div>
        <div class="mobileNavigation__tools">
          <NavigationTools :closeNav=closeNav />
        </div>
      </div>
    </div>
</template>

<script>
import * as format from '@/utils/format'
import Menu from '@/components/Menu'
import NavigationTools from '@/components/NavigationTools'
// import Search from '@/components/Search'
import { mapState } from 'vuex'

export default {
  name: 'MobileNavigation',
  props: ['closeNav'],
  components: {
    Menu,
    NavigationTools
    // Search
  },
  computed: {
    ...mapState(['account', 'bareMetals', 'services']),
    formattedAccountNumber() {
      return format.accountNumberMasked(this.account._key)
    },
    mainNav() {
      let nav = [
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
          _key: 'storage',
          link: '/storage',
          text: 'Storage'
        },
        {
          _key: 'databases',
          link: '/databases',
          text: 'Databases'
        },
        {
          _key: 'shield',
          link: '/shield',
          text: 'Shield'
        }
      ]

      if (this.bareMetals > 0) {
        nav = [
          ...nav.slice(0, 2),
          {
            _key: 'baremetal',
            link: '/bare-metals',
            text: 'Bare Metal Servers'
          },
          ...nav.slice(2)
        ]
      }

      const navItems = nav.map(item => {
        const service = this.services.find(s => s._key === item._key)
        const disabled = !service || (!service.public && !service.beta)
        const beta = service && service.beta
        return { ...item, disabled, beta }
      })

      // add getting started to the top of the nav if not completed
      if (this.account && !this.account.isSetup) {
        navItems.unshift({
          _key: 'getting-started',
          link: '/getting-started',
          text: 'Getting Started'
        })
      }

      return navItems
    }
  }
}
</script>
<style scoped>
  .mobileNavigation {
    @apply fixed pointer-events-none opacity-0 right-0 w-full top-0 flex flex-col overflow-auto border-r border-gray-300 md:hidden;
    @apply transition-all transform -translate-x-full duration-500;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }
  .menu-open .mobileNavigation {
    @apply opacity-100 translate-x-0;
  }
  .mobileNavigation__inner {
    @apply flex-1 flex flex-col bg-white pb-6 pointer-events-auto;
  }
  .mobileNavigation__account {
    @apply flex flex-col px-5 flex-shrink-0 my-4 text-gray-400;
  }
  .mobileNavigation__menu {
    @apply flex-1 px-3;
  }
  .mobileNavigation__tools {
    @apply bg-white pt-6 px-6 border-t border-gray-300;
  }
</style>
