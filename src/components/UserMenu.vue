<template>
  <Menu as='div' class="menu" v-if="account">
    <MenuButton class="menu__button">
      <span class="w-full truncate">Account</span>
      <ChevronDownIcon class="w-5 h-5 text-gray-400" />
    </MenuButton>
    <MenuItems class="menu__items">
      <div class="px-1 py-2.5">
        <MenuItem >
          <button
            class="menu__item accountNumber"
          >
            <span class="text-xs uppercase text-gray-400">Account No.</span>
            <span class="text-gray-400">{{ formattedAccountNumber }}</span>
          </button>
        </MenuItem>
        <div class="divider"></div>
        <MenuItem v-slot="{ active }">
          <button
            @click.prevent="navigate('/billing/wallet')"
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Billing
          </button>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            @click.prevent="navigate('/account')"
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Settings
          </button>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            @click.prevent="navigate('/support')"
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Support
          </button>
        </MenuItem>
        <div class="divider"></div>
        <MenuItem v-slot="{ active }">
          <button
            @click.prevent="signOut"
            :class="[
              'menu__item',
              active ? 'active' : ''
            ]"
          >
            Sign out
          </button>
        </MenuItem>
      </div>
    </MenuItems>
  </Menu>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import * as format from '@/utils/format'
import {ChevronDownIcon} from '@heroicons/vue/solid'
import { mapState } from 'vuex'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

export default {
  name: 'UserMenu',
  components: {
    ChevronDownIcon,
    Menu,
    MenuButton,
    MenuItems,
    MenuItem
  },
  computed: {
    ...mapState(['account', 'session']),
    formattedAccountNumber() {
      return format.accountNumberMasked(this.account._key)
    }
  },
  methods: {
    navigate(path) {
      this.$router.push(path)
    },
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
  .menu {
    @apply relative;
    /* @apply absolute top-8 right-8; */
  }
  .menu__button {
    @apply flex items-center p-3 space-x-1 bg-white border border-gray-300 rounded-md;
    @apply focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25;
  }
  .menu__items {
    @apply absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5;
    @apply focus:outline-none;
  }
  .menu__item {
    @apply group flex rounded items-center w-full px-2 py-2.5 text-sm text-gray-600;
  }
  .menu__item.accountNumber {
    @apply flex-col items-start
  }
  .menu__item.active {
   @apply bg-gray-100;
  }
  .divider {
    @apply w-full bg-gray-300 my-2.5 box-border;
    height: 1px;
  }
</style>
