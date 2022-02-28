<template>
  <div class="topNavigation" :class="{'menu-open':showNav}">

    <!-- logo - hidden on larger screens -->
    <div class="md:hidden"><Logo size="small" /></div>

    <!-- burger - hidden on larger screens -->
    <div class="md:hidden"><BurgerButton @click="showNav = !showNav;" /></div>
    <!-- search - hidden on small screens -->
    <div class="topNavigation__left">
      <!-- <Search size="large"/> -->
    </div>

    <!-- user nav and deploy button - hidden on small screens -->
    <div class="topNavigation__right">
      <router-link to="/deploy">
        <button class="h-full button button--success">Deploy Server</button>
      </router-link>
      <UserMenu :user=user />
    </div>
    <MobileNavigation />
  </div>
</template>

<script>
  import Logo from '@/components/Logo'
  import BurgerButton from '@/components/BurgerButton'
  import MobileNavigation from '@/components/MobileNavigation'
  import Search from '@/components/Search'
  import UserMenu from '@/components/UserMenu'
  import { mapGetters } from 'vuex'

  export default {
    name: "TopNavigation",
    data: function () {
      return {
        showNav: false,
        mainNav: [
          {
            link: "/",
            text: "Index"
          }
        ]
      }
    },
    components: {
      Logo,
      MobileNavigation,
      BurgerButton,
      Search,
      UserMenu
    },
    computed: {
      ...mapGetters({
        user: 'auth/StateUser'
      })
    },
    methods: {
      bodyScrollLock () {
        const targetElement = document.querySelector('#menu')
        
        if (this.showNav) {
          bodyScrollLock.disableBodyScroll(targetElement)
        } else {
          bodyScrollLock.enableBodyScroll(targetElement)
        }
      },
      isLoggedIn: function() {
        return this.$store.getters['auth/isAuthenticated']
      }
    },
    watch: {
      $route () {
        this.showNav = false
      },
      showNav: 'bodyScrollLock'
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