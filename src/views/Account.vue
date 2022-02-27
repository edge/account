<template>
  <div class="flex w-full min-h-screen">
    <SideNavigation />
    <main class="flex flex-col mainContent">
      <TopNavigation />

      <div class="mainContent__inner">
        <h1>Account</h1>

        <GoogleAuthEnable :user=user :twofactorQR=twofactorQR :twofactorUrl=twofactorUrl />
      </div>
    </main>
  </div>
</template>

<script>
import GoogleAuthEnable from "@/components/account/GoogleAuthEnable"
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
    GoogleAuthEnable,
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
      twofactorQR: ''
    }
  },
  methods: {
  },
  mounted() {
    this.loading = true
    const { data: user, error, mutate } = useSWRV(() => '/accounts?id=' + (this.user ? this.user.accountNumber : 'XXX'), fetcher)

    setTimeout(() => {
      // console.log('user', user)
      this.twofactorQR = user.value.twofactorQR
      this.twofactorUrl = user.value.twofactorUrl
    }, 1000)
  }
}
</script>
<style scoped>
  .mainContent {
    @apply relative flex-1;
  }
  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-7;
  }

  /* the list */
  .serverList {
    @apply mt-5 lg:mt-5 space-y-2;
  }

  /* the list item */
  .serverList__item {
    @apply relative flex flex-wrap flex-col lg:flex-row  lg:items-center justify-between bg-white rounded-md w-full p-5 lg:pr-12;
  }
  .serverList__item.active {
    @apply border-green;
  }
  .serverList__item.inactive {
    @apply border-red;
  }

  /* status dot */
  .serverList__status {
    @apply w-2.5 h-2.5 rounded-full block absolute right-5;
  }
  .serverList__status.active {
    @apply bg-green;
  }
  .serverList__status.inactive {
    @apply bg-red;
  }

  /* first col (multi line) */
  .serverList__main {
    @apply lg:w-1/4 text-gray-500 flex flex-col space-y-0.5 flex-shrink-0;
  }
  .serverList__name {
    @apply text-green text-base font-medium truncate w-full hover:underline;
  }
  .serverList__stats {
    @apply flex space-x-1.5 text-xs flex-shrink-0;
  }
  .serverList__stats span {
    @apply flex-shrink-0;
  }

  /* standard cell */
  .serverList__cell {
    @apply text-gray-500 text-sm lg:w-1/3 truncate;
  }
</style>
