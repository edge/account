<template>
  <div class="mainContent__inner">
    <h1>Account</h1>
    <div class="box">
      <div>
        <h4>Your Account Number</h4>
        <!-- eslint-disable-next-line max-len -->
        <p class="text-gray-500">Write down your account number! It’s all you need to access the Edge Network. No email, no username. Just anonymity.</p>
      </div>
      <!-- account number display -->
      <div class="account-number-wrapper">
        <span v-if="showAccountNumber" class="account-number monospace">{{ formattedAccountNumber }}</span>
        <span v-else class="account-number masked monospace">XXXX XXXX XXXX XXXX</span>
        <!-- hide/show account number button button -->
        <button
          @click.prevent="toggleShowAccountNumber"
          class="ml-2 text-gray-400 hover:text-green"
        >
          <EyeIcon v-if="showAccountNumber" class="ml-2 w-5 h-5" />
          <EyeOffIcon v-if="!showAccountNumber" class="ml-2 w-5 h-5" />
        </button>
        <!-- copy to clipboard button -->
        <button
          @click.prevent="copyToClipboard"
          class="ml-2 text-gray-400 hover:text-green"
        >
          <DuplicateIcon class="w-6 h-6" />
        </button>
        <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
      </div>
    </div>
    <div class="box">
      <h4>Two-factor Authentication (2FA)</h4>
      <div>
        <Disable2FA v-if="is2FAEnabled" />
        <Enable2FA v-else />
      </div>
    </div>

    <div class="box">
      <h4>Recovery Email</h4>
      <div>
        <DisableRecoveryEmail v-if="isRecoveryEnabled" />
        <EnableRecoveryEmail v-else />
      </div>
    </div>
  </div>
</template>

<script>
import Disable2FA from '@/components/account/Disable2FA'
import DisableRecoveryEmail from '@/components/account/DisableRecoveryEmail'
import { DuplicateIcon } from '@heroicons/vue/outline'
import Enable2FA from '@/components/account/Enable2FA'
import EnableRecoveryEmail from '@/components/account/EnableRecoveryEmail'
import { mapState } from 'vuex'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'

export default {
  name: 'Account',
  title() {
    return 'Edge Account Portal » Account'
  },
  components: {
    Disable2FA,
    DisableRecoveryEmail,
    DuplicateIcon,
    EyeIcon,
    EyeOffIcon,
    Enable2FA,
    EnableRecoveryEmail
  },
  computed: {
    ...mapState(['account']),
    formattedAccountNumber() {
      // add space every 4 characters
      return this.account._key.replace(/.{4}/g, '$& ')
    },
    is2FAEnabled() {
      if (this.account.totp) return this.account.totp.enabled
      return false
    },
    isRecoveryEnabled() {
      if (this.account.recovery) return this.account.recovery.email.verified
      return false
    }
  },
  data() {
    return {
      copied: false,
      showAccountNumber: false
    }
  },
  methods: {
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.account._key)
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    toggleShowAccountNumber() {
      this.showAccountNumber = !this.showAccountNumber
    }
  }
}
</script>
<style scoped>
.box {
  @apply w-full my-4 p-6 bg-white rounded-lg;
}

.box h4 {
  @apply w-full pb-2 mb-4 font-medium;
}

.account-number-wrapper {
  @apply flex items-center justify-between relative w-max max-w-full;
}
.account-number {
  @apply text-3xl text-green pr-4;
}
.account-number.masked {
  @apply text-gray;
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}
</style>
