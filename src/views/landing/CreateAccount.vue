<template>
  <div
    class="landingPage__content"
    :class="isAccountGenerated ? 'sm:mt-14' : ''"
  >
    <Logo/>

    <div>
      <p class="pr-5 text-lg">
        <span>All you need to sign in to Edge is a secret account number, known only to you.</span>
      </p>

      <div>
        <!-- Generate account number step -->
        <div class="step">
          <div class="step-title">
            <KeyIcon class="step-icon" />
            <span>Create an account</span>
          </div>

          <div class="step-content">
            <!-- generate account button -->
            <div v-if="!isAccountGenerated && !isGeneratingAccount" class="my-4">
              <button
                @click.prevent="generateAccount"
                class="w-full button button--solid button--success"
                :disabled="isGeneratingAccount"
              >
                <span>Generate Account</span>
              </button>
              <!-- error message  -->
              <div v-if="errors.accountNumber" class="flex items-center errorMessage mt-2">
                <ExclamationIcon class="w-3.5 h-3.5" />
                <span class="errorMessage__text">{{ errors.accountNumber }}</span>
              </div>
            </div>
            <!-- account number display -->
            <div v-else class="account-number-wrapper">
              <span class="account-number monospace">{{ formattedAccountNumber }}</span>
              <!-- copy to clipboard button -->
              <button
                v-show="isAccountGenerated"
                @click.prevent="copyToClipboard"
                class="text-gray-400 hover:text-green"
              >
                <DuplicateIcon class="w-6 h-6" />
              </button>
              <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
            </div>
            <!-- generating account message -->
            <div class="mt-3" v-show="isGeneratingAccount">
              <span class="text-gray-500">Generating your account number.</span>
            </div>
            <!-- remember account number warning -->
            <div class="mt-3 flex flex-col" v-show="isAccountGenerated">
              <span class="font-medium text-black">Write down your account number!</span>
              <span class="mt-1 text-gray-500">
                It’s all you need to access the Edge Network. No email, no username. Just anonymity.
              </span>
            </div>
          </div>
        </div>

        <!-- Secure account step -->
        <div class="step" :class="step < 2 ? 'inactive' : ''" >
          <div class="step-title" @click="changeStep(2)">
            <FingerPrintIcon class="step-icon"/>
            <span>Secure your account</span>
          </div>

          <div class="step-content" v-if="step === 2">
            <!-- 2fa section -->
            <div class="my-4 bg-gray-200 rounded-lg">
              <button
                @click.prevent="toggleShow2FA"
                class="w-full button"
                :class="is2FAEnabled && !backupCodes ? 'button--outline-success text-green bg-white hover:bg-white cursor-default' : 'button--success'"
              >
                <span>Enable Two-factor Authentication (2FA)</span>
                <div v-if="!is2FAEnabled || backupCodes" class="absolute right-3">
                  <ChevronDownIcon v-if="show2FA"
                    class="chevron-icon"
                  />
                  <ChevronRightIcon v-else
                    class="chevron-icon"
                  />
                </div>
                <div v-else class="absolute right-3">
                  <ShieldCheckIcon
                    class="chevron-icon text-green"
                    :class="is2FAEnabled ? 'enabled' : ''"
                  />
                </div>
              </button>
              <div v-show="show2FA && (!is2FAEnabled || backupCodes)">
                <div class="px-2 mb-4">
                  <Enable2FA :createAccount="true" />
                </div>
              </div>
            </div>
            <!-- recovery email section -->
            <div class="mb-4 bg-gray-200 rounded-lg">
              <button
                @click.prevent="toggleShowRecovery"
                class="w-full button"
                :class="isRecoveryEnabled ? 'button--outline-success text-green bg-white hover:bg-white cursor-default' : 'button--success'"
              >
                <span>Add Recovery Email</span>
                <div v-if="!isRecoveryEnabled" class="absolute right-3">
                  <ChevronDownIcon v-if="showRecovery"
                    class="chevron-icon"
                  />
                  <ChevronRightIcon v-else
                  class="chevron-icon"
                  />
                </div>
                <div v-else class="absolute right-3">
                  <ShieldCheckIcon
                    class="chevron-icon text-green"
                    :class="isRecoveryEnabled ? 'enabled' : ''"
                  />
                </div>
              </button>
              <div v-show="showRecovery && !isRecoveryEnabled">
                <div class="px-2 mt-2">
                  <EnableRecoveryEmail :createAccount="true" />
                </div>
              </div>
            </div>
          </div>
          <!-- when moving past secure account section, still display whether recovery/2fa has been enabled -->
          <div class="step-content" v-else-if="step > 2">
            <div class="my-4">
              <div @click="toggleShow2FA" class="cursor-pointer flex items-center mb-4">
                <div>
                  <ShieldCheckIcon v-if="is2FAEnabled" class="w-5 text-green" />
                  <ShieldExclamationIcon v-else class="w-5 text-gray" />
                </div>
                <span class="ml-2 hover:text-green">
                  Two-factor authentication {{ is2FAEnabled ? 'successfully' : 'not' }} enabled
                </span>
              </div>
              <div @click="toggleShowRecovery" class="cursor-pointer flex items-center">
                <div>
                  <ShieldCheckIcon v-if="isRecoveryEnabled" class="w-5 text-green" />
                  <ShieldExclamationIcon v-else class="w-5 text-gray" />
                </div>
                <span class="ml-2 hover:text-green">
                  Recovery email {{ isRecoveryEnabled ? 'successfully' : 'not' }} added
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- go direct to account / back to sign in buttons -->
        <div >
          <div class="mt-6">
            <button
              v-if="step > 1"
              @click.prevent="goToAccount"
              class="w-full button button--solid button--success"
            >
              <span>Go directly to my account</span>
            </button>
            <router-link v-else
              :to="{ name: 'Sign In' }"
              class="w-full block mt-2 text-sm text-center text-gray-500 underline hover:text-green"
            >I already have an account</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as api from '@/account-utils/index'
import Cookies from 'js-cookie'
import Enable2FA from '@/components/account/Enable2FA'
import EnableRecoveryEmail from '@/components/account/EnableRecoveryEmail'
import Logo from '@/components/Logo'
import { mapState } from 'vuex'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldCheckIcon
} from '@heroicons/vue/solid'
import {
  DuplicateIcon,
  ExclamationIcon,
  FingerPrintIcon,
  KeyIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/outline'

export default {
  name: 'CreateAccount',
  title() {
    return 'Edge Account Portal » Create Account'
  },
  components: {
    ChevronDownIcon,
    ChevronRightIcon,
    DuplicateIcon,
    Enable2FA,
    EnableRecoveryEmail,
    ExclamationIcon,
    FingerPrintIcon,
    KeyIcon,
    Logo,
    ShieldCheckIcon,
    ShieldExclamationIcon
  },
  data() {
    return {
      accountNumber: '',
      copied: false,
      errors: {
        accountNumber: ''
      },
      isGeneratingAccount: false,
      isVerifying: false,
      show2FA: false,
      showRecovery: false,
      step: 1
    }
  },
  computed: {
    ...mapState(['account', 'backupCodes', 'session']),
    is2FAEnabled() {
      return this.account && this.account.totps
    },
    isAccountGenerated() {
      return this.account && !this.isGeneratingAccount
    },
    isAccountSecured() {
      return this.is2FAEnabled && this.isRecoveryEnabled
    },
    isRecoveryEnabled() {
      if (!this.account) return false
      if (this.account.recovery) return this.account.recovery.email.verified
      return false
    },
    formattedAccountNumber() {
      return format.accountNumber(this.accountNumber)
    }
  },
  methods: {
    changeStep (newStep) {
      if (!this.isAccountGenerated) return
      this.step = newStep
    },
    async copyToClipboard () {
      await navigator.clipboard.writeText(this.accountNumber)
      this.copied = true

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    async generateAccount() {
      this.isGeneratingAccount = true
      this.errors.accountNumber = ''
      this.accountNumber = this.generateRandomAccountNumber()
      const numGeneratorId = setInterval(() => {
        this.accountNumber = this.generateRandomAccountNumber()
      }, 100)

      setTimeout(async () => {
        try {
          const referralCode = Cookies.get('referralCode')

          const { account, session } = await api.accounts.createAccount(
            process.env.VUE_APP_ACCOUNT_API_URL,
            referralCode
          )
          // finish number generator on newly generated account number and dispatch to store
          clearInterval(numGeneratorId)
          this.accountNumber = account._key
          const payload = { account, session }
          this.$store.dispatch('signIn', payload)
          this.isGeneratingAccount = false
          this.changeStep(2)
        }
        catch (error) {
          clearInterval(numGeneratorId)
          this.isGeneratingAccount = false
          this.accountNumber = ''

          if (error.response.body.param === 'referralCode') Cookies.remove('referralCode')

          this.errors.accountNumber = 'Oops, something went wrong. Please try again.'
        }
      }, 1000)
    },
    generateRandomAccountNumber() {
      return Math.floor(Math.random() * 1e16)
    },
    async goToAccount() {
      this.$router.push('/')
    },
    toggleShow2FA() {
      if (this.is2FAEnabled && !this.backupCodes) return
      if (this.step !== 2) {
        this.step = 2
        this.show2FA = true
        this.showRecovery = false
      }
      else {
        this.show2FA = !this.show2FA
        if (this.show2FA) this.showRecovery = false
      }
    },
    toggleShowRecovery() {
      if (this.isRecoveryEnabled) return
      if (this.step !== 2) {
        this.step = 2
        this.showRecovery = true
        this.show2FA = false
      }
      else {
        this.showRecovery = !this.showRecovery
        if(this.showRecovery) this.show2FA = false
      }
    }
  },
  mounted() {
    const referralCodeRegExp = /^[A-Za-z0-9]{8}$/
    const referralCode = this.$route.query.r
    if(referralCodeRegExp.test(referralCode)) Cookies.set('referralCode', referralCode, { expires: 1 })
  },
  watch: {
    is2FAEnabled(new2FAEnabled) {
      if (new2FAEnabled && this.isRecoveryEnabled) this.step = 3
    },
    isRecoveryEnabled(newRecoveryEnabled) {
      if (newRecoveryEnabled && this.is2FAEnabled) this.step = 3
    }
  }
}
</script>
<style scoped>
.account-number-wrapper {
  @apply flex items-center justify-between relative py-3 pr-3;
}
.account-number {
  @apply text-2xl text-green;
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}

.step {
  @apply flex flex-col mb-6;
}
.step-title {
  @apply relative flex flex-row items-center text-lg cursor-pointer;
  z-index: 1;
}
.step-title::before {
  content: " ";
  @apply absolute transform w-2 h-full bg-green rounded-b;
  left: 16px;
  top: 10px;
  z-index: 0;
}
.step-icon {
  @apply w-10 border-2 rounded-3xl p-1 border-green bg-green text-white mr-3;
  z-index: 1;
}
.step.inactive .step-title {
  @apply pb-4 mb-2;
}
.step.inactive .step-title::before {
  @apply bg-gray
}
.step.inactive .step-icon {
  @apply bg-gray border-gray;
  z-index: 1;
}
.step-content {
  @apply relative flex flex-col ml-14 max-h-full;
}
.step-content::before {
  content: " ";
  @apply absolute w-2 h-full bg-green rounded-b;
  left: -40px;
}
.chevron-icon {
  @apply h-4 text-white;
}
.chevron-icon.enabled {
  @apply text-green;
}

.credit-items-grid {
  @apply grid grid-cols-3 grid-rows-2 gap-3 my-4
}
.credit-item {
  @apply flex flex-col border border-gray rounded-md p-1 items-center justify-center cursor-pointer hover:border-green text-gray hover:text-green;
}
.credit-item-icon {
  @apply h-10;
}

.address {
  @apply break-words;
  width: calc(100% - 30px);
  font-size: 0.76rem;
}

@media (max-width: 410px) {
  /* break account number into two equal rows */
  .account-number {
    @apply text-3xl;
    width: 200px;
  }

  .credit-items-grid {
    @apply grid-cols-2 grid-rows-3;
  }
}

@media (max-width: 325px) {
  .credit-items-grid {
    @apply grid-cols-1 grid-rows-6;
  }
}
</style>
