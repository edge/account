
<template>
  <ul class="navigation-tools">
    <li @click="closeNav" class="navigation-tools__item mobileOnly">
      <router-link to="/account" class="navigation-tools__link">
        <span class=""><UserIcon class="w-5 h-5" /></span>
        <span class="navigation-tools__label">Account</span>
      </router-link>
    </li>
    <li @click="closeNav" class="navigation-tools__item mobileOnly">
      <router-link to="/billing/wallet" class="navigation-tools__link">
        <span class=""><CashIcon class="w-5 h-5" /></span>
        <span class="navigation-tools__label">Billing</span>
      </router-link>
    </li>
    <li class="navigation-tools__item mobileOnly">
      <button @click="signOut" class="navigation-tools__link">
        <span class=""><LogoutIcon class="w-5 h-5" /></span>
        <span class="navigation-tools__label">Sign Out</span>
      </button>
    </li>
  </ul>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import { mapState } from 'vuex'
import {
  CashIcon,
  LogoutIcon,
  UserIcon
} from '@heroicons/vue/outline'

export default {
  name: 'NavigationTools',
  props: ['closeNav'],
  components: {
    CashIcon,
    LogoutIcon,
    // SupportIcon,
    UserIcon
  },
  computed: {
    ...mapState(['account', 'session'])
  },
  methods: {
    async signOut() {
      try {
        await api.sessions.deleteSession(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        this.$store.dispatch('signOut')
        this.$router.push('/sign-in')
      }
      catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.navigation-tools {
  @apply flex flex-row justify-between text-xs;
}
.navigation-tools__item {
}
.navigation-tools__link {
  @apply flex items-center space-x-1 text-gray-600;
}
.navigation-tools__icon {
}
.navigation-tools__label {
  @apply leading-none;
}
.mobileOnly {
  @apply md:hidden;
}

@media (max-width: 350px) {
  .navigation-tools__link {
    @apply flex-col space-x-0 space-y-1;
  }
}
</style>
