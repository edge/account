
<template>
  <ul class="navigation-tools">
    <li class="navigation-tools__item">
      <router-link to="/account" class="navigation-tools__link">
        <span class="header-tools__icon">
          <CogIcon class="w-5 h-5" />
        </span>
        <span>Settings</span>
      </router-link>
    </li>
    <!-- <li class="navigation-tools__item">
      <router-link to="/billing" class="navigation-tools__link">
        <span class="header-tools__icon">
          <CashIcon class="w-5 h-5" />
        </span>
        <span>Billing</span>
      </router-link>
    </li> -->
    <li class="navigation-tools__item">
      <a href="/support" class="navigation-tools__link" target="_blank" rel="noreferrer">
        <span class="header-tools__icon">
          <SupportIcon class="w-5 h-5" />
        </span>
        <span>Support</span>
      </a>
    </li>
    <li class="navigation-tools__item">
      <button @click="signOut" class="navigation-tools__link">
        <span class="header-tools__icon">
          <LogoutIcon class="w-5 h-5" />
        </span>
        <span>Sign Out</span>
      </button>
    </li>
  </ul>
</template>

<script>
/* global process */

import * as utils from '../account-utils/index'
import { mapState } from 'vuex'
import {
  CashIcon,
  CogIcon,
  LogoutIcon,
  SupportIcon
} from '@heroicons/vue/outline'

export default {
  name: 'NavigationTools',
  components: {
    CashIcon,
    CogIcon,
    LogoutIcon,
    SupportIcon
  },
  computed: {
    ...mapState(['account', 'session'])
  },
  methods: {
    async signOut() {
      try {
        await utils.sessions.deleteSession(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        await this.$store.commit('logout')
        localStorage.removeItem('session')
        this.$router.push('/signin')
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

@media (max-width: 350px) {
  .navigation-tools__link {
    @apply flex-col;
  }
}
</style>
