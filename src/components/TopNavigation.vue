<template>
  <div ref="menu" class="topNavigation" :class="{'menu-open':showNav}">

    <!-- logo - hidden on larger screens -->
    <div class="md:hidden"><Logo size="small" /></div>

    <!-- burger - hidden on larger screens -->
    <div class="md:hidden"><BurgerButton @click="toggleNav" /></div>
    <!-- search - hidden on small screens -->
    <!-- <div class="topNavigation__left">
      <Search size="large"/>
    </div> -->

    <!-- user nav and deploy button - hidden on small screens -->
    <div class="hidden md:flex w-full items-center justify-between ">
      <div class="flex-shrink-0 flex flex-col lg:flex-row lg:space-x-1">
        <span>
          <span class="font-bold">Balance: </span>
          <span class="lg:hidden">
            (<router-link to="/billing/payments" class="text-green hover:underline">Add Funds</router-link>)
          </span>
        </span>
        <span>{{ formattedBalance }} XE / {{ formattedUSDBalance }} USD </span>
        <span class="hidden lg:block">
          (<router-link to="/billing/payments" class="text-green hover:underline">Add Funds</router-link>)
        </span>
      </div>
      <span class="topNavigation__right">
        <router-link to="/servers/deploy">
          <button class="h-full button button--success">Deploy Server</button>
        </router-link>
        <UserMenu />
      </span>
    </div>
    <MobileNavigation v-if="account" :closeNav=closeMobileNav />
  </div>
</template>

<script>
import * as format from '../utils/format'
import BurgerButton from '@/components/BurgerButton'
import Logo from '@/components/Logo'
import MobileNavigation from '@/components/MobileNavigation'
// import Search from '@/components/Search'
import UserMenu from '@/components/UserMenu'
import { mapState } from 'vuex'

export default {
  name: 'TopNavigation',
  data: function () {
    return {
      mainNav: [
        {
          link: '/',
          text: 'Index'
        }
      ],
      showNav: false
    }
  },
  components: {
    BurgerButton,
    Logo,
    MobileNavigation,
    // Search,
    UserMenu
  },
  computed: {
    ...mapState(['account', 'balance', 'session']),
    formattedBalance() {
      return this.balance && format.xe(this.balance.total.xe)
    },
    formattedUSDBalance() {
      return this.usdBalance && format.usd(this.usdBalance, 2)
    },
    usdBalance() {
      return this.balance && this.balance.total.usd
    }
  },
  methods: {
    closeMobileNav() {
      this.showNav = false
    },
    toggleNav() {
      this.showNav = !this.showNav
      window.scrollTo(document.body.scrollHeight, 0)
    }
  },
  watch: {
    $route () {
      this.showNav = false
    },
    showNav() {
      if (this.showNav) document.documentElement.style.overflow = 'hidden'
      else document.documentElement.style.overflow = 'auto'
    }
  }
}
</script>
<style scoped>
.topNavigation {
  @apply top-0 z-40 flex items-center justify-between w-full px-3 h-16 bg-white border-b border-gray-300;
  @apply md:px-5 lg:px-8 md:h-20 md:bg-gray-200 md:justify-end;
}
/* .topNavigation.menu-open {
  @apply fixed;
} */
.topNavigation__left {
  @apply hidden lg:block;
}
.topNavigation__right {
  @apply items-center hidden space-x-2 md:flex;
}
</style>
