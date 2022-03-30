<template>
  <div class="flex w-full min-h-screen">
    <SideNavigation />
    <main class="flex flex-col mainContent">
      <TopNavigation />

      <div class="mainContent__inner">
        <h1>Account</h1>
        <div>
          <h4 class="w-full pb-2 mt-10 mb-8 font-medium border-b border-gray-400">Your account number</h4>
          <p class="text-gray-500">
            Write down your account number! It’s all you need to access the Edge Network. No email, no username. Just anonymity.</p>
        </div>
        <div class="relative inline-block lg:w-1/2 accountNumber">
          <span class="text-3xl">{{user.accountNumber}}</span>
          <button @click.prevent="copyToClipboard" class="text-gray-400 hover:text-green">
            <DuplicateIcon class="w-6 h-6" />  
          </button>
          <div
            class="copied"
            :class="this.copied ? 'visible' : ''"
          >
            Copied!
          </div>
        </div>
        <h4 class="w-full pb-2 mt-10 mb-8 font-medium border-b border-gray-400">Setup 2FA</h4>
        <GoogleAuthEnable :user=user :twofactorQR=twofactorQR :twofactorUrl=twofactorUrl />
        
        <h4 class="w-full pb-2 mt-10 mb-8 font-medium border-b border-gray-400">Add recovery email</h4>
        <RecoveryEmail :user=user />
      </div>
    </main>
  </div>
</template>

<script>
import GoogleAuthEnable from "@/components/account/GoogleAuthEnable"
import { DuplicateIcon } from '@heroicons/vue/outline'
import RecoveryEmail from "@/components/account/RecoveryEmail"
import SideNavigation from "@/components/SideNavigation"
import TopNavigation from "@/components/TopNavigation"

import { fetcher } from '../utils/api'
import { mapGetters } from 'vuex'
import useSWRV from 'swrv'

export default {
  name: 'Account',
  title() {
    return 'Edge Account Portal » Account'
  },
  components: {
    DuplicateIcon,
    GoogleAuthEnable,
    RecoveryEmail,
    SideNavigation,
    TopNavigation
  },
  computed: {
    ...mapGetters({
      user: 'auth/StateUser'
    })
  },
  data() {
    return {
      twofactorUrl: '',
      twofactorQR: '',
      copied: false
    }
  },
  methods: {
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.user.accountNumber)
      
      setTimeout(() => {
        this.copied = false
      }, 2000)
    }
  },
  mounted() {
    this.loading = true
    const { data: user, error, mutate } = useSWRV(() => '/accounts?id=' + (this.user ? this.user.accountNumber : 'XXX'), fetcher)

    this.polling = setInterval(() => {
      mutate()

      this.twofactorQR = user.value.twofactorQR
      this.twofactorUrl = user.value.twofactorUrl
    }, 2000)
  },
  unmounted() {
    clearInterval(this.polling)
    this.polling = null
  }
}
</script>
<style scoped>
  .mainContent {
    @apply relative flex-1 pb-10;
  }
  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-7;
  }

  /* standard cell */
  .serverList__cell {
    @apply text-gray-500 text-sm lg:w-1/3 truncate;
  }

  .accountNumber {
    @apply flex items-center justify-between relative p-3 mt-2 bg-gray-100 border border-gray-300 inline-block;
  }
  .copied {
    @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
    @apply transition-opacity duration-200 ease-in;
  }
  .copied.visible {
    @apply opacity-100;
  }
</style>
