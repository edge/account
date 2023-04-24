<template>
  <div class="mainContent__inner space-y-4">
    <h1>Account</h1>
    <div class="box">
      <div>
        <h4>Your Account Number</h4>
        <p class="text-gray-500">Write down your account number! It’s all you need to access the Edge Network. No email, no username. Just anonymity.</p>
      </div>
      <!-- account number display -->
      <div class="account-number-wrapper">
        <span v-if="showAccountNumber" class="account-number monospace">{{ formattedAccountNumber }}</span>
        <span v-else class="account-number masked monospace">{{ formattedAccountNumberMasked }}</span>
        <!-- hide/show account number button button -->
        <button
          @click.prevent="toggleShowAccountNumber"
          class="ml-2 text-gray-400 hover:text-green"
        >
          <EyeIcon v-if="showAccountNumber" class="ml-2 w-5 h-5" />
          <EyeOffIcon v-if="!showAccountNumber" class="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
    <div class="box">
      <ReferralCode />
    </div>
    <div class="box">
      <h4>Two-factor Authentication (2FA)</h4>
      <div>
        <Disable2FA v-if="is2FAEnabled && !showAddExtra2FA && !backupCodes" />
        <Enable2FA v-else @enable2FA="onEnable2FA" />
        <button
          v-if="is2FAEnabled && !backupCodes"
          @click="toggleAddExtra2FA"
          class="mt-2 underline text-gray-500 hover:text-green"
        >
          {{ showAddExtra2FA ? 'Return to remove existing 2FA code' : 'Add extra 2FA code' }}
        </button>
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
import * as format from '@/utils/format'
import Disable2FA from '@/components/account/Disable2FA'
import DisableRecoveryEmail from '@/components/account/DisableRecoveryEmail'
import Enable2FA from '@/components/account/Enable2FA'
import EnableRecoveryEmail from '@/components/account/EnableRecoveryEmail'
import ReferralCode from '@/components/ReferralCode'
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
    EyeIcon,
    EyeOffIcon,
    Enable2FA,
    EnableRecoveryEmail,
    ReferralCode
  },
  computed: {
    ...mapState(['account', 'backupCodes']),
    formattedAccountNumber() {
      return format.accountNumber(this.account._key)
    },
    formattedAccountNumberMasked() {
      return format.accountNumberMasked(this.account._key)
    },
    is2FAEnabled() {
      return this.account.totps
    },
    isRecoveryEnabled() {
      return this.account.recovery && this.account.recovery.email.verified
    }
  },
  data() {
    return {
      copied: false,
      showAccountNumber: false,
      showAddExtra2FA: false
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
    onEnable2FA() {
      this.showAddExtra2FA = false
    },
    toggleShowAccountNumber() {
      this.showAccountNumber = !this.showAccountNumber
    },
    toggleAddExtra2FA() {
      this.showAddExtra2FA = !this.showAddExtra2FA
    }
  }
}
</script>
<style scoped>
.account-number-wrapper {
  @apply flex items-center justify-between relative w-max max-w-full;
}
.account-number {
  @apply text-3xl text-green pr-4;
}
.account-number.masked {
  @apply text-gray;
}
</style>
