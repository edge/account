<template>
  <div ref="menu" class="topNavigation" :class="{'menu-open':showNav}">

    <!-- logo - hidden on larger screens -->
    <div class="md:hidden"><Logo size="small" /></div>

    <!-- burger - hidden on larger screens -->
    <div class="md:hidden"><BurgerButton @click="showNav = !showNav;" /></div>
    <!-- search - hidden on small screens -->
    <div class="topNavigation__left">
      <Search size="large"/>
    </div>

    <!-- user nav and deploy button - hidden on small screens -->
    <div class="topNavigation__right">
      <router-link to="/servers/deploy">
        <button class="h-full button button--success">Deploy Server</button>
      </router-link>
      <UserMenu />
    </div>
    <MobileNavigation />
  </div>
</template>

<script>
import BurgerButton from '@/components/BurgerButton'
import Logo from '@/components/Logo'
import MobileNavigation from '@/components/MobileNavigation'
import Search from '@/components/Search'
import UserMenu from '@/components/UserMenu'
import { mapState } from 'vuex'

export default {
  name: 'TopNavigation',
  data: function () {
    return {
      showNav: false,
      mainNav: [
        {
          link: '/',
          text: 'Index'
        }
      ]
    }
  },
  components: {
    BurgerButton,
    Logo,
    MobileNavigation,
    Search,
    UserMenu
  },
  computed: {
    ...mapState(['account', 'session'])
  },
  methods: {
    isLoggedIn: function() {
      return this.$store.getters['auth/isAuthenticated']
    }
  },
  watch: {
    $route () {
      this.showNav = false
    }
  }
}
</script>
<style scoped>
  .topNavigation {
    @apply sticky top-0 z-10 flex items-center justify-between w-full px-3 h-16 bg-white border-b border-gray-300;
    @apply md:px-5 lg:px-8 md:h-20 md:bg-gray-200 md:justify-end lg:justify-between;
  }
  .topNavigation__left {
    @apply hidden lg:block;
  }
  .topNavigation__right {
    @apply items-center hidden space-x-2 md:flex;
  }
</style>
