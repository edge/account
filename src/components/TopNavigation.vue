<template>
  <div ref="menu" class="topNavigation" :class="{'menu-open':showNav}">

    <!-- logo - hidden on larger screens -->
    <div class="md:hidden"><Logo size="small" /></div>

    <!-- burger - hidden on larger screens -->
    <div class="mobile-burger">
      <NotificationsLink />
      <BurgerButton @click="toggleNav" />
    </div>
    <!-- search - hidden on small screens -->
    <!-- <div class="topNavigation__left">
      <Search size="large"/>
    </div> -->

    <!-- user nav and deploy button - hidden on small screens -->
    <div class="topNavigation__wrapper hidden md:flex w-full items-center">
      <div v-if="balance && account.useCryptoView" class="balance hidden flex-col flex-shrink-0">
        <div class="flex-shrink-0 flex space-x-1">
          <span class="font-bold">Balance: </span>
          <span>{{ formatXE(balance.total.xe) }} XE / {{ formatUSD(balance.total.usd) }} USD </span>
          <span>
            (<router-link to="/billing/payments" class="text-green hover:underline">Add Funds</router-link>)
          </span>
        </div>
        <div v-if="balance.credit.usd > 0" class="items-center flex-shrink-0 flex space-x-1">
          <span class="font-bold">Credit: </span>
          <span>{{ formatXE(balance.credit.xe) }} XE / {{ formatUSD(balance.credit.usd) }} USD</span>
        </div>
        <div class="items-center flex-shrink-0 flex space-x-1">
          <span class="font-bold">Usage: </span>
          <span>{{ formatXE(this.balance.reserved.xe) }} XE / {{ formatUSD(this.balance.reserved.usd) }} USD </span>
          <Tooltip position="right" theme="white"
            text="This shows accrued costs since your last payment."
          >
            <InformationCircleIcon class="w-4 text-gray hover:text-green"/>
          </Tooltip>
        </div>
      </div>
      <div v-else-if="balance" class="balance hidden flex-col flex-shrink-0">
        <div v-if="balance.credit.usd > 0" class="items-center flex-shrink-0 flex space-x-1">
          <span class="font-bold">Credit: </span>
          <span>{{ formatUSD(balance.credit.usd) }} USD</span>
        </div>
        <div class="items-center flex-shrink-0 flex space-x-1">
          <span class="font-bold">Usage: </span>
          <span>{{ formatUSD(this.balance.reserved.usd) }} USD </span>
          <Tooltip position="right" theme="white"
            text="This shows accrued costs since your last payment."
          >
            <InformationCircleIcon class="w-4 text-gray hover:text-green"/>
          </Tooltip>
        </div>
      </div>

      <span class="topNavigation__right">
        <NotificationsLink />
        <UserMenu />
      </span>
    </div>
    <MobileNavigation v-if="account" :closeNav=closeMobileNav />
  </div>
</template>

<script>
import * as format from '@/utils/format'
import BurgerButton from '@/components/BurgerButton'
import { InformationCircleIcon } from '@heroicons/vue/outline'
import Logo from '@/components/Logo'
import MobileNavigation from '@/components/MobileNavigation'
import NotificationsLink from '@/components/NotificationsLink'
// import Search from '@/components/Search'
import Tooltip from '@/components/Tooltip'
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
    InformationCircleIcon,
    Logo,
    MobileNavigation,
    NotificationsLink,
    // Search,
    Tooltip,
    UserMenu
  },
  computed: {
    ...mapState(['account', 'balance', 'session'])
  },
  methods: {
    closeMobileNav() {
      this.showNav = false
    },
    formatUSD(usd) {
      return format.usd(usd, 2)
    },
    formatXE(xe) {
      return format.xe(xe)
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
      const crispClient = document.querySelector('.crisp-client')
      if (this.showNav) {
        document.documentElement.style.overflow = 'hidden'
        if (crispClient) crispClient.style.display = 'none'
      }
      else {
        document.documentElement.style.overflow = 'auto'
        if (crispClient) crispClient.style.display = 'block'
      }
    }
  }
}
</script>
<style scoped>
.mobile-burger {
  @apply flex flex-row items-center md:hidden;
}

.mobile-burger .notifications-link {
  @apply mr-4;
}

.topNavigation {
  @apply top-0 z-40 flex items-center justify-between w-full px-3 h-16 bg-white border-b border-gray-300;
  @apply md:px-5 lg:px-8 md:h-20 md:bg-gray-200 md:justify-end;
}
/* .topNavigation.menu-open {
  @apply fixed;
} */
.topNavigation__wrapper {
  @apply justify-end;
}
.topNavigation__left {
  @apply hidden lg:block;
}
.topNavigation__right {
  @apply items-center hidden space-x-2 md:flex;
}

@media (min-width: 950px) {
  .balance {
    @apply flex;
  }

  .topNavigation__wrapper {
    @apply justify-between;
  }
}
</style>
