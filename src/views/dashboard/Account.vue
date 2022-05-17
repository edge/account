<template>
  <div class="mainContent__inner">
    <h1>Account</h1>
    <div>
      <h4 class="w-full pb-2 mt-10 mb-6 font-medium border-b border-gray-400">Your account number</h4>
      <!-- eslint-disable-next-line max-len -->
      <p class="text-gray-500">Write down your account number! It’s all you need to access the Edge Network. No email, no username. Just anonymity.</p>
    </div>
    <!-- account number display -->
    <div class="account-number-wrapper">
      <span class="account-number monospace">{{ formattedAccountNumber }}</span>
      <!-- copy to clipboard button -->
      <button
        @click.prevent="copyToClipboard"
        class="text-gray-400 hover:text-green"
      >
        <DuplicateIcon class="w-6 h-6" />
      </button>
      <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
    </div>
    <h4 class="w-full pb-2 mt-16 mb-6 font-medium border-b border-gray-400">Setup 2FA</h4>
    <div>
      <GoogleAuthEnable />
    </div>

    <h4 class="w-full pb-2 mt-16 mb-6 font-medium border-b border-gray-400">Add recovery email</h4>
    <div>
      <RecoveryEmail />
    </div>
  </div>
</template>

<script>
import { DuplicateIcon } from '@heroicons/vue/outline'
import GoogleAuthEnable from '@/components/account/GoogleAuthEnable'
import RecoveryEmail from '@/components/account/RecoveryEmail'
import { mapState } from 'vuex'

export default {
  name: 'Account',
  title() {
    return 'Edge Account Portal » Account'
  },
  components: {
    DuplicateIcon,
    GoogleAuthEnable,
    RecoveryEmail
  },
  computed: {
    ...mapState(['account', 'session']),
    formattedAccountNumber() {
      // add space every 4 characters
      return this.account._key.replace(/.{4}/g, '$& ')
    }
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
      await navigator.clipboard.writeText(this.account._key)
      setTimeout(() => {
        this.copied = false
      }, 2000)
    }
  }
}
</script>
<style scoped>
/* standard cell */
.serverList__cell {
  @apply text-gray-500 text-sm lg:w-1/3 truncate;
}

.account-number-wrapper {
  @apply flex items-center justify-between relative py-3 pr-3 w-max;
}
.account-number {
  @apply text-4xl text-green pr-4;
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}
</style>
