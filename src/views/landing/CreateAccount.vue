<template>
  <div
    class="landingPage__content"
    :class="isAccountGenerated ? 'sm:mt-14' : ''"
  >
    <Logo/>

    <div>
      <p class="pr-5 text-lg mb-12">
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
            <!-- create account options -->
            <div v-if="!accountType && !isAccountGenerated && !isGeneratingAccount" class="flex flex-col space-y-2 my-4">
              <div>
                <button
                  @click.prevent="setAccountType('email')"
                  class="w-full button button--solid button--success"
                >
                  <span>Use Email Address</span>
                </button>
                <!-- error message  -->
                <div v-if="errors.accountNumber" class="flex items-center errorMessage mt-2">
                  <ExclamationIcon class="w-3.5 h-3.5" />
                  <span class="errorMessage__text">{{ errors.accountNumber }}</span>
                </div>
              </div>
              <div>
                <button
                  @click.prevent="createAnonymousAccount"
                  class="w-full button button--solid button--success"
                >
                  <span>Sign Up Anonymously</span>
                </button>
                <!-- error message  -->
                <div v-if="errors.accountNumber" class="flex items-center errorMessage mt-2">
                  <ExclamationIcon class="w-3.5 h-3.5" />
                  <span class="errorMessage__text">{{ errors.accountNumber }}</span>
                </div>
              </div>
            </div>

            <!-- Email-first accounts -->
            <div v-if="accountType === 'email'">
              <div v-if="!generatedAccount">
                <!-- email address input -->
                <div class="input-group">
                  <input
                    id="email"
                    class="border border-gray rounded-md flex-1 text-lg px-3 py-2 focus:outline-none"
                    v-model="v$.emailInput.$model"
                    placeholder="Enter email address"
                    autocomplete
                    @keypress.enter="createEmailAccount"
                  />
                </div>
                <!-- error message  -->
                <ValidationError :errors="v$.emailInput.$errors" />
                <div v-if="errors.emailInput" class="flex items-center errorMessage mt-2">
                  <ExclamationIcon class="w-3.5 h-3.5" />
                  <span class="errorMessage__text">{{ errors.emailInput }}</span>
                </div>
                <div v-if="errors.accountEmail" class="flex items-center errorMessage mt-2">
                  <ExclamationIcon class="w-3.5 h-3.5" />
                  <span class="errorMessage__text">{{ errors.accountEmail }}</span>
                </div>

                <!-- buttons -->
                <div class="flex flex-col mt-2">
                  <!-- sign up -->
                  <button
                    @click.prevent="createEmailAccount"
                    class="mb-2 button button--success"
                    :disabled="isCreating || !emailInput || v$.emailInput.$invalid"
                  >
                    <div v-if="isCreating" class="flex flex-row">
                      <span>Creating Account</span>
                      <span class="ml-2"><LoadingSpinner /></span>
                    </div>
                    <span v-else>Sign Up</span>
                  </button>

                  <!-- return to create account options -->
                  <button @click="setAccountType(null)"
                    class="w-full text-sm text-center text-gray-500 underline hover:text-green"
                  >
                    Create anonymous account instead
                  </button>
                </div>
              </div>
              <div v-else>
                <span class="text-xl text-green break-words">{{ emailInput }}</span>
              </div>
            </div>

            <!-- Anonymous account -->
            <div v-if="accountType === 'anonymous'">
              <!-- account number display -->
              <div class="account-number-wrapper">
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
        </div>

        <!-- Verify email step (email-first accounts only) -->
        <div v-if="accountType === 'email' && step >= 2" class="step" :class="step < 2 ? 'inactive' : ''">
          <div class="step-title">
            <MailIcon class="step-icon"/>
            <span>Verify your email</span>
          </div>
          <div class="step-content" v-if="step === 2">
            <!-- email sent message -->
            <div class="flex mb-2 items-center">
              <div class="self-start">
                <BadgeCheckIcon class="h-5 text-green" />
              </div>
              <span class="email-conf ml-1 text-green">Confirmation email sent to {{ emailInput }}</span>
            </div>
            <!-- instructions -->
            <span class="text-gray-500">
              Not quite there yet.
              Check your emails and enter the confirmation code below to verify your email address.
            </span>
            <!-- resend email button and feedback -->
            <p class="text-gray-500 my-2">
              Haven't received the email?
              <span v-if="emailCooldown === 0"><span @click="resendEmail" class="underline cursor-pointer hover:text-green">Click here</span> to request another email.</span>
              <span v-else>Please wait {{ emailCooldown }} seconds.</span>
            </p>
            <!-- confirmation code and button -->
            <div class="input-field flex items-center w-full">
              <input
                v-model="v$.verificationCode.$model"
                label="Confirmation code"
                autocomplete="off"
                class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
                v-mask="'# # # # # #'"
                placeholder="1 2 3 4 5 6"
                @keypress.enter=verifyEmail
              />
              <button
                class="order-2 rounded-l-none text-sm py-3 button button--success py-2 w-32"
                @click.prevent="verifyEmail"
                :disabled="!canVerify"
              >
                <div v-if="isVerifying" class="flex flex-row items-center">
                  <span>Verifying</span>
                  <span class="ml-2"><LoadingSpinner /></span>
                </div>
                <span v-else>Verify</span>
              </button>
            </div>
            <!-- error message  -->
            <ValidationError :errors="v$.verificationCode.$errors" />
            <div v-if="errors.verificationCode" class="flex items-center errorMessage mt-1">
              <ExclamationIcon class="w-3.5 h-3.5" />
              <span class="errorMessage__text">{{ errors.verificationCode }}</span>
            </div>
          </div>
          <div v-else-if="step > 2" class="step-content">
            <div class="flex mb-2 items-center">
              <div>
                <BadgeCheckIcon class="h-5 text-green" />
              </div>
              <span class="ml-1 text-green">Email verified</span>
            </div>
          </div>
        </div>

        <!-- Secure account step -->
        <div class="step" v-if="step >= 3">
          <div class="step-title">
            <FingerPrintIcon class="step-icon"/>
            <span>Secure your account <span class="text-gray">(optional)</span></span>
          </div>

          <div class="step-content" v-if="step === 3">
            <!-- 2fa section -->
            <div class="my-4 bg-gray-200 rounded-lg">
              <button
                @click.prevent="toggleShow2FA"
                class="w-full button"
                :class="is2FAEnabled && !backupCodes ? 'button--outline-success text-green bg-white hover:bg-white cursor-default' : 'button--success'"
              >
                <span>Enable Two-Factor Authentication (2FA)</span>
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
            <!-- add email section -->
            <div v-if="accountType === 'anonymous'" class="mb-4 bg-gray-200 rounded-lg">
              <button
                @click.prevent="toggleShowAddEmail"
                class="w-full button"
                :class="isEmailEnabled ? 'button--outline-success text-green bg-white hover:bg-white cursor-default' : 'button--success'"
              >
                <span>Add Email Address</span>
                <div v-if="!isEmailEnabled" class="absolute right-3">
                  <ChevronDownIcon v-if="showAddEmail"
                    class="chevron-icon"
                  />
                  <ChevronRightIcon v-else
                  class="chevron-icon"
                  />
                </div>
                <div v-else class="absolute right-3">
                  <ShieldCheckIcon
                    class="chevron-icon text-green"
                    :class="isEmailEnabled ? 'enabled' : ''"
                  />
                </div>
              </button>
              <div v-show="showAddEmail && !isEmailEnabled">
                <div class="px-2 mt-2">
                  <AddAccountEmail :createAccount="true" />
                </div>
              </div>
            </div>
          </div>
          <!-- when moving past secure account section, still display whether email/2fa has been enabled -->
          <div class="step-content" v-else-if="step > 3">
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
              <div @click="toggleShowAddEmail" class="cursor-pointer flex items-center">
                <div>
                  <ShieldCheckIcon v-if="isEmailEnabled" class="w-5 text-green" />
                  <ShieldExclamationIcon v-else class="w-5 text-gray" />
                </div>
                <span class="ml-2 hover:text-green">
                  Account email {{ isEmailEnabled ? 'successfully' : 'not' }} added
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- go direct to account / back to sign in buttons -->
        <div>
          <div class="mt-12">
            <button
              v-if="step > 2"
              @click.prevent="goToAccount"
              class="w-full button button--solid button--success"
            >
              <span>Continue</span>
            </button>
            <span v-else-if="!isGeneratingAccount"
              class="w-full block mt-2 text-sm text-center text-gray-500">
              Already have an account?<br>
              <router-link :to="{ name: 'Sign In' }" class="underline hover:text-green">Return to Sign In</router-link>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import * as format from '@/utils/format'
import * as validation from '@/utils/validation'
import AddAccountEmail from '@/components/account/AddAccountEmail'
import Cookies from 'js-cookie'
import Enable2FA from '@/components/account/Enable2FA'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import ValidationError from '@/components/ValidationError.vue'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'
import {
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldCheckIcon
} from '@heroicons/vue/solid'
import {
  DuplicateIcon,
  ExclamationIcon,
  FingerPrintIcon,
  KeyIcon,
  MailIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/outline'

export default {
  name: 'CreateAccount',
  title() {
    return 'Edge Account Portal » Create Account'
  },
  components: {
    AddAccountEmail,
    ChevronDownIcon,
    ChevronRightIcon,
    BadgeCheckIcon,
    DuplicateIcon,
    Enable2FA,
    ExclamationIcon,
    FingerPrintIcon,
    KeyIcon,
    LoadingSpinner,
    Logo,
    MailIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ValidationError
  },
  data() {
    return {
      accountNumber: '',
      accountType: null,
      copied: false,
      emailCooldown: 0,
      emailInput: '',
      errors: {
        accountNumber: '',
        accountEmail: '',
        emailInput: '',
        verificationCode: ''
      },
      generatedAccount: null,
      generatedSession: null,
      isCreating: false,
      isGeneratingAccount: false,
      isVerifying: false,
      show2FA: false,
      showAddEmail: false,
      step: 1,
      verificationCode: ''
    }
  },
  validations() {
    return {
      emailInput: [
        validation.email
      ],
      verificationCode: [
        validation.confirmationCode
      ]
    }
  },
  computed: {
    ...mapState(['account', 'backupCodes', 'session']),
    canVerify() {
      return !this.v$.verificationCode.$invalid && !this.errors.verificationCode && !this.isVerifying
    },
    is2FAEnabled() {
      return this.account && this.account.totps
    },
    isAccountGenerated() {
      return this.account && !this.isGeneratingAccount
    },
    isAccountSecured() {
      return this.is2FAEnabled && this.isEmailEnabled
    },
    isEmailEnabled() {
      return this.account && this.account.email && this.account.email.address
    },
    formattedAccountNumber() {
      return format.accountNumber(this.accountNumber)
    },
    verificationSecret() {
      return format.removeSpaces(this.verificationCode)
    }
  },
  methods: {
    changeStep (newStep) {
      // if (!this.isAccountGenerated) return
      this.step = newStep
    },
    async copyToClipboard () {
      await navigator.clipboard.writeText(this.accountNumber)
      this.copied = true

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    async createAccount() {
      this.isCreating = true
      const body = { referralCode: Cookies.get('referralCode') }
      if (this.emailInput) body.address = this.emailInput
      const { account, session } = await api.accounts.createAccount(
        process.env.VUE_APP_ACCOUNT_API_URL,
        body
      )
      this.generatedAccount = account
      this.generatedSession = session
      this.isCreating = false
    },
    async createAnonymousAccount() {
      this.setAccountType('anonymous')
      this.isGeneratingAccount = true
      this.errors.accountNumber = ''
      this.accountNumber = this.generateRandomAccountNumber()
      const numGeneratorId = setInterval(() => {
        this.accountNumber = this.generateRandomAccountNumber()
      }, 100)

      setTimeout(async () => {
        try {
          await this.createAccount()
          // finish number generator on newly generated account number and dispatch to store
          clearInterval(numGeneratorId)
          this.accountNumber = this.generatedAccount._key
          this.signIn()
          this.isGeneratingAccount = false
          this.changeStep(3)
        }
        catch (error) {
          this.isCreating = false
          clearInterval(numGeneratorId)
          this.isGeneratingAccount = false
          this.accountNumber = ''
          if (error.response.body.param === 'referralCode') Cookies.remove('referralCode')
          this.errors.accountNumber = 'Oops, something went wrong. Please try again.'
        }
      }, 1000)
    },
    async createEmailAccount() {
      try {
        this.isCreating = true
        this.errors.accountEmail = ''

        // Wait 600ms to prevent spamming the create account endpoint
        await new Promise(resolve => setTimeout(resolve, 600))
        await this.createAccount()
        this.resetEmailCooldown()
        this.changeStep(2)
      }
      catch (error) {
        // error.message is string, so simplest way is to check for substring
        const emailInUse = typeof error.message === 'string' && error.message.includes('email address already in use')
        this.errors.accountEmail = emailInUse
          ? 'Email address already in use'
          : 'Oops, something went wrong. Please try again.'
        this.isCreating = false
      }
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
    async resendEmail() {
      await api.accounts.resendVerificationEmail(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.generatedSession._key,
        true
      )
      this.resetEmailCooldown()
    },
    resetEmailCooldown() {
      if (this.iEmailCooldown) clearInterval(this.iEmailCooldown)
      // set 15s email cooldown timer
      this.emailCooldown = 15
      this.iEmailCooldown = setInterval(() => {
        this.emailCooldown = this.emailCooldown - 1
        if (this.emailCooldown === 0) clearInterval(this.iEmailCooldown)
      }, 1000)
    },
    setAccountType(type) {
      this.accountType = type
    },
    signIn() {
      this.$store.dispatch('signIn', { account: this.generatedAccount, session: this.generatedSession })
    },
    async verifyEmail() {
      if (this.v$.verificationCode.$invalid) return
      this.isVerifying = true
      try {
        await api.accounts.verifyEmail(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.generatedSession._key,
          this.verificationSecret
        )
        setTimeout(async () => {
          this.signIn()
          this.changeStep(3)
          this.isVerifying = false
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.verificationCode = 'Verification code invalid'
          this.isVerifying = false
        }, 1000)
      }
    },
    toggleShow2FA() {
      if (this.is2FAEnabled && !this.backupCodes) return
      if (this.step !== 3) {
        this.step = 3
        this.show2FA = true
        this.showAddEmail = false
      }
      else {
        this.show2FA = !this.show2FA
        if (this.show2FA) this.showAddEmail = false
      }
    },
    toggleShowAddEmail() {
      if (this.isEmailEnabled) return
      if (this.step !== 3) {
        this.step = 3
        this.showAddEmail = true
        this.show2FA = false
      }
      else {
        this.showAddEmail = !this.showAddEmail
        if(this.showAddEmail) this.show2FA = false
      }
    }
  },
  mounted() {
    const referralCodeRegExp = /^[A-Za-z0-9]{8}$/
    const referralCode = this.$route.query.r
    if(referralCodeRegExp.test(referralCode)) Cookies.set('referralCode', referralCode, { expires: 1 })
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    accountType() {
      this.emailInput = ''
    },
    emailInput() {
      this.errors.emailInput = ''
    },
    is2FAEnabled(new2FAEnabled) {
      if (new2FAEnabled && this.isEmailEnabled) this.step = 3
    },
    isEmailEnabled(newEmail) {
      if (newEmail && this.is2FAEnabled) this.step = 3
    },
    verificationCode() {
      this.errors.verificationCode = ''
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

.email-conf {
  width: calc(100% - 20px);
  word-break: break-word;
}

.step {
  @apply flex flex-col mb-6;
}
.step-title {
  @apply relative flex flex-row items-center text-lg;
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
