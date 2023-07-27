<template>
  <div class="landingPage__content">
    <!-- sign in with magic link -->
    <div v-if="!requires2FA && magicLinkToken">
      <Logo class="mb-6" />
      <p v-if="!errors.magicLink" class="pr-5 text-lg mb-6">
        <span>Please wait whilst we verify your details and sign you into the Edge Network.</span>
      </p>
      <div class="landingPage__form">
        <!-- error message -->
        <div v-if="errors.magicLink" class="flex items-center text-red text-lg mt-2">
          <span class="">{{ errors.magicLink }}</span>
        </div>
        <!-- account sign in input -->
        <div v-else class="input-group">
          <!-- <label for="accountNumber" class="label">Account details</label> -->
          <div
            v-if="magicLinkResponse"
            class="account-number bg-white border border-gray rounded-md flex-1 px-3 py-2 text-center text-lg cursor-default"
          >
            <span>{{ magicLinkResponse.address }}</span>
          </div>
        </div>
        <!-- buttons -->
        <div class="flex flex-col mt-6">
          <!-- sign in -->
          <button
            v-if="!errors.magicLink"
            class="mb-2 button button--success"
            disabled
          >
            <div v-if="isLoading" class="flex flex-row">
              <span>Signing In</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Sign In</span>
          </button>

          <!-- divider -->
          <div class="flex items-center w-full my-6 space-x-2">
            <div class="flex-1 h-px bg-gray-400" />
          </div>
          <!-- create account -->
          <router-link
            :to="{ name: 'Sign In' }"
            class="button button--solid"
          >
            <span>Return to Sign In</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- sign in with account number -->
    <div v-else-if="!requires2FA" >
      <Logo class="mb-6" />
      <p class="pr-5 text-lg mb-12">
        <span>Welcome back. Enter your account number or email to sign into the Edge Network.</span>
      </p>
      <div class="landingPage__form">
        <!-- account sign in input -->
        <div v-if="!magicLinkSent" class="input-group">
          <!-- <label for="accountNumber" class="label">Account details</label> -->
          <input
            id="accountNumber"
            class="account-number border border-gray rounded-md flex-1 px-3 py-2 text-center text-lg focus:outline-none"
            v-mask="numericalInput && '#### #### #### ####'"
            v-model="v$.signInInput.$model"
            placeholder="Enter email or account number"
            autocomplete
            @keypress.enter=signIn
          />
        </div>
        <!-- error message  -->
        <ValidationError :errors="v$.signInInput.$errors" />
        <div v-if="errors.signInInput" class="flex items-center errorMessage mt-2">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ errors.signInInput }}</span>
        </div>
        <!-- buttons -->
        <div class="flex flex-col" :class="!magicLinkSent && 'mt-6'">
          <!-- sign in -->
          <button
            v-if="!magicLinkSent"
            @click.prevent="signIn"
            class="mb-2 button button--success"
            :disabled="!canSignIn"
            v-show="!requires2FA"
          >
            <div v-if="isLoading" class="flex flex-row">
              <span>Signing In</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Sign In</span>
          </button>

          <!-- magic link sent confirmation -->
          <div v-if="magicLinkSent">
            <div class="flex mb-2 items-center">
              <div>
                <BadgeCheckIcon class="h-5 text-green" />
              </div>
              <span class="ml-1 text-green">Email sent to {{ signInInput }}</span>
            </div>
            <!-- instructions -->
            <span class="text-gray-500">
              Check your emails and simply follow the link to continue to your account.
            </span>
            <!-- resend email button and feedback -->
            <p class="text-gray-500 my-2">
              Haven't received the email?
              <span v-if="emailCooldown === 0"><span @click="signIn" class="underline cursor-pointer hover:text-green">Click here</span> to request another email.</span>
              <span v-else>Please wait {{ emailCooldown }} seconds.</span>
            </p>
            <button @click.prevent="magicLinkSent = false"
              class="w-full text-sm text-center text-gray-500 underline hover:text-green"
            >
              Re-enter my account details
            </button>
          </div>

          <!-- divider -->
          <div class="flex items-center w-full my-6 space-x-2">
            <div class="flex-1 h-px bg-gray-400" />
            <span class="inline-block tracking-wider text-black">OR</span>
            <div class="flex-1 h-px bg-gray-400" />
          </div>
          <!-- create account -->
          <button
            @click.prevent="goToCreateAccount"
            class="button button--solid"
          >
            <span>Create Account</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2fa check -->
    <div v-else class="flex flex-col">
      <div class="flex flex-col">
        <div><ShieldExclamationIcon class="h-20 text-green mb-4" /></div>
        <span class="text-lg mb-2">Authenticate your account.</span>
        <span class="text-gray mb-2">Please enter the
          <span v-if="useBackupCode">one of your 8-digit alphanumeric backup codes. The code can only be used once.</span>
          <span v-else>the 6-digit code from your two-factor authentication app.</span>
        </span>

        <!-- otp / backup code input -->
        <div v-if="useBackupCode" class="input-field flex items-center w-full pt-2">
          <input
            v-model="v$.backupCode.$model"
            label="Confirmation code"
            autocomplete="off"
            class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
            v-mask="'NNNNNNNN'"
            placeholder="1a2bc34d"
            @keypress.enter=signIn
          />
          <button
            class="order-2 rounded-l-none text-sm py-3 button button--error py-2 w-36"
            @click.prevent="signIn"
            :disabled="v$.backupCode.$invalid"
          >
            <div v-if="isLoading" class="flex flex-row items-center">
              <span>Signing In</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Sign In</span>
          </button>
        </div>
        <AuthCodeInput
          v-else
          :error="httpError"
          :isCodeValid="is2FACodeValid"
          :onComplete="onUpdateOtp"
          :resetErrors="resetOtpErrors"
        />
        <!-- error message  -->
        <div v-if="useBackupCode">
          <ValidationError :errors="v$.backupCode.$errors" />
          <div class="mt-2"><HttpError :error=httpError /></div>
        </div>

        <button v-if="useBackupCode" @click="toggleUseBackupCode" class="underline mt-2">
          Go back to use authenticator device
        </button>
        <button v-else @click="toggleUseBackupCode" class="underline mt-2">
          Lost my authenticator device
        </button>

        <div class="flex flex-col mt-6">
          <button
            @click.prevent="returnToSignIn"
            class="button button--success"
            >
            <span>Cancel</span>
          </button>
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
import AuthCodeInput from '@/components/AuthCodeInput'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'SignIn',
  title() {
    return 'Edge Account Portal » Sign In'
  },
  components: {
    AuthCodeInput,
    BadgeCheckIcon,
    ExclamationIcon,
    HttpError,
    LoadingSpinner,
    Logo,
    ShieldExclamationIcon,
    ValidationError
  },
  data() {
    return {
      backupCode: '',
      emailCooldown: 0,
      errors: {
        backupCode: '',
        magicLink: '',
        otpSecret: '',
        signInInput: ''
      },
      httpError: null,
      is2FACodeValid: false,
      isLoading: false,
      magicLinkResponse: null,
      magicLinkSent: false,
      otpSecret: '',
      requires2FA: false,
      signInInput: '',
      useBackupCode: false
    }
  },
  validations() {
    return {
      backupCode: [
        validation.backupCode
      ],
      signInInput: [
        validation.signInInput
      ]
    }
  },
  computed: {
    accountNumber() {
      if (this.magicLinkResponse) return this.magicLinkResponse.account
      else return this.numericalInput && format.removeSpaces(this.signInInput)
    },
    canSignIn() {
      return this.signInInput && !this.v$.signInInput.$invalid && !this.errors.signInInput && !this.isLoading
    },
    numericalInput() {
      // check if input is entirely numerical to determine if account number input (with spaces optional to allow for masking)
      return this.magicLinkResponse || /^\d+(\s\d+)*\s*$/.test(this.signInInput)
    },
    signInBody() {
      const body = { account: this.accountNumber }
      if (this.useBackupCode) body.backupCode = this.backupCode
      if (this.otpSecret) body.otp = this.otpSecret
      return body
    },
    magicLinkToken() {
      return this.$route.query.t
    }
  },
  methods: {
    goToCreateAccount () {
      this.$router.push({ name: 'Create Account' })
    },
    onUpdateOtp(newCode) {
      this.otpSecret = newCode
      this.signIn()
    },
    resetEmailCooldown() {
      // set 15s email cooldown timer
      this.emailCooldown = 15
      this.iEmailCooldown = setInterval(() => {
        this.emailCooldown = this.emailCooldown - 1
        if (this.emailCooldown === 0) clearInterval(this.iEmailCooldown)
      }, 1000)
    },
    resetOtpErrors() {
      this.errors.otpSecret = ''
    },
    returnToSignIn() {
      this.signInInput = ''
      this.otpSecret = ''
      this.magicLinkResponse = null
      this.errors = {
        backupCode: '',
        magicLink: '',
        otpSecret: '',
        signInInput: ''
      },
      this.requires2FA = false
    },
    async sendMagicLink() {
      await api.accounts.sendMagicLink(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.signInInput
      )
      this.resetEmailCooldown()
    },
    async signIn() {
      if (this.v$.signInInput.$invalid) return
      if (this.requires2FA && this.useBackupCode && this.v$.backupCode.$invalid) return

      this.isLoading = true

      try {
        // sign in if using account number
        if (this.numericalInput) {
          const { session } = await api.sessions.createSession(
            process.env.VUE_APP_ACCOUNT_API_URL,
            this.signInBody
          )
          if (session._key) {
            const { account } = await api.accounts.getAccount(
              process.env.VUE_APP_ACCOUNT_API_URL,
              session._key
            )
            this.is2FACodeValid = true
            const payload = { account, session }
            this.$store.dispatch('signIn', payload)
            setTimeout(() => {
              this.$router.push('/servers')
            }, 800)
          }
        }
        // request magic link email if using email address
        else {
          await this.sendMagicLink()
          setTimeout(() => {
            this.isLoading = false
            this.magicLinkSent = true
          }, 800)
        }
      }
      catch (error) {
        if (this.requires2FA) {
          setTimeout(() => {
            this.httpError = error
            this.isLoading = false
          }, 500)
        }
        if (error.response) {
          if (error.response.status === 401) {
            this.requires2FA = true
            this.isLoading = false
          }
          else {
            setTimeout(() => {
              this.isLoading = false
              this.errors.signInInput = 'We couldn\'t find that account'
            }, 800)
          }
        }
      }
    },
    async toggleUseBackupCode() {
      this.backupCode = ''
      this.otpSecret = ''
      this.httpError = ''
      await this.v$.$reset()
      this.useBackupCode = !this.useBackupCode
    },
    async verifyMagicLinkToken() {
      try {
        this.magicLinkResponse = await api.accounts.verifyMagicLinkToken(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.magicLinkToken
        )
        console.log(this.magicLinkResponse)
        await this.signIn()
      }
      catch (error) {
        this.errors.magicLink = 'Your link appears to be invalid. Please return to sign in and try again.'
      }
    }
  },
  async mounted() {
    if (this.magicLinkToken) await this.verifyMagicLinkToken()
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    backupCode() {
      this.httpError = ''
    },
    otpSecret() {
      this.httpError = ''
    },
    signInInput() {
      // reset sign in input number error (i.e. invalid account) when input is changed
      this.errors.signInInput = ''

      // sign in input uses v-mask to add spaces if entering account number
      // on the rare occurrence that an email begins with 4 or more numbers, this will remove any masking once
      // a non-numerical character is entered
      if (!this.numericalInput) this.signInInput = format.removeSpaces(this.signInInput)
    }
  }
}
</script>
<style scoped>
@media (max-width: 275px) {
  .account-number {
    @apply text-sm p-3;
  }
}

@media (max-width: 450px) {
  /* split input and button into two rows */
  .input-field {
    @apply flex-col;
  }

  .input-field input {
    @apply w-full border-r rounded-r-md mb-2;
  }

  .input-field .button {
    @apply w-full rounded-l-md;
  }
}
</style>
