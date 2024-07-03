<template>
  <div class="mainContent__inner space-y-4">
    <h1>Account</h1>
    <div class="box">
      <div>
        <h4>Account Number</h4>
        <p class="text-gray-500">Write down your account number and keep it secret. You can use your account number to sign into the account.</p>
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
      <h4>Account Email</h4>
      <div>
        <ManageAccountEmail v-if="isEmailEnabled" />
        <AddAccountEmail v-else />
      </div>
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
      <h4>Crypto Payments</h4>
      <p class="text-gray-500">
        Edge runs on its own layer 0 blockchain, and payments are settled in its own coin, called XE, in the background.
        By default payment information in the account interface is presented in fiat.
        If you would prefer to see payment information in crypto, you can enable it here.
      </p>
      <button v-if="account.useCryptoView" @click="toggleCryptoView" class="text-sm py-3 button button--outline-error">Disable Crypto Payments</button>
      <button v-else @click="toggleCryptoView" class="text-sm py-3 button button--outline-success">Enable Crypto Payments</button>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import AddAccountEmail from '@/components/account/AddAccountEmail'
import Disable2FA from '@/components/account/Disable2FA'
import Enable2FA from '@/components/account/Enable2FA'
import ManageAccountEmail from '@/components/account/ManageAccountEmail'
import ReferralCode from '@/components/ReferralCode'
import { mapState } from 'vuex'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'

export default {
  name: 'Account',
  title() {
    return 'Edge Account Portal » Account'
  },
  components: {
    AddAccountEmail,
    Disable2FA,
    EyeIcon,
    EyeOffIcon,
    Enable2FA,
    ManageAccountEmail,
    ReferralCode
  },
  computed: {
    ...mapState(['account', 'backupCodes', 'session']),
    formattedAccountNumber() {
      return format.accountNumber(this.account._key)
    },
    formattedAccountNumberMasked() {
      return format.accountNumberMasked(this.account._key)
    },
    is2FAEnabled() {
      return this.account.totps
    },
    isEmailEnabled() {
      return this.account.email && this.account.email.address
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
    async toggleCryptoView() {
      await utils.updateAccount(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
        account: this.account._key,
        useCryptoView: !this.account.useCryptoView
      })
      this.$store.dispatch('updateAccount')
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
