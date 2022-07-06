<template>
  <div ref="menu" class="topNavigation" :class="{'menu-open':showNav}">

    <!-- logo - hidden on larger screens -->
    <div class="md:hidden"><Logo size="small" /></div>

    <!-- burger - hidden on larger screens -->
    <div class="md:hidden"><BurgerButton @click="showNav = !showNav;" /></div>
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
            (<button @click="toggleTopUpModal" class="text-green hover:underline">Add Funds</button>)
          </span>
        </span>
        <span>{{ formattedBalance }} XE / {{ formattedUSDBalance }} USD </span>
        <span class="hidden lg:block">
          (<button @click="toggleTopUpModal" class="text-green hover:underline">Add Funds</button>)
        </span>
      </div>
      <span class="topNavigation__right">
        <router-link to="/servers/deploy">
          <button class="h-full button button--success">Deploy Server</button>
        </router-link>
        <UserMenu />
      </span>
    </div>
    <TopUpModal
      v-if=showTopUpModal
      @modal-close=toggleTopUpModal
    />
    <MobileNavigation v-if="account" :closeNav=closeMobileNav />
  </div>
</template>

<script>
import BurgerButton from '@/components/BurgerButton'
import Logo from '@/components/Logo'
import MobileNavigation from '@/components/MobileNavigation'
// import Search from '@/components/Search'
import TopUpModal from '@/components/billing/TopUpModal'
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
      showNav: false,
      showTopUpModal: false
    }
  },
  components: {
    BurgerButton,
    Logo,
    MobileNavigation,
    // Search,
    TopUpModal,
    UserMenu
  },
  computed: {
    ...mapState(['account', 'balance', 'session']),
    formattedBalance() {
      return this.balance && (this.balance.total.xe / 1e6).toLocaleString(undefined, {
        maximumFractionDigits: 6,
        minimumFractionDigits: 6
      })
    },
    formattedUSDBalance() {
      return this.usdBalance && (Math.floor(this.usdBalance * 100) / 100).toFixed(2)
    },
    usdBalance() {
      return this.balance && this.balance.total.usd
    }
  },
  methods: {
    closeMobileNav() {
      this.showNav = false
    },
    toggleTopUpModal() {
      this.showTopUpModal = !this.showTopUpModal
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
    @apply top-0 z-40 flex items-center justify-between w-full px-3 h-16 bg-white border-b border-gray-300;
    @apply md:px-5 lg:px-8 md:h-20 md:bg-gray-200 md:justify-end;
  }
  .topNavigation__left {
    @apply hidden lg:block;
  }
  .topNavigation__right {
    @apply items-center hidden space-x-2 md:flex;
  }
</style>
