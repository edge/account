<template>
  <div class="landingPage__content">
    <!-- sign in with account number -->
    <div v-if="!requires2FA" >
      <Logo class="mb-6" />
      <p class="pr-5 text-lg mb-6">
        <span>Welcome back. Enter your account number to sign into the Edge Network.</span>
      </p>
      <div class="landingPage__form">
        <!-- account number input -->
        <div class="input-group">
          <label for="accountNumber" class="label">Account number</label>
          <input
            id="accountNumber"
            class="account-number border border-gray rounded-md flex-1 px-3 py-2 text-center text-lg focus:outline-none"
            v-mask="'#### #### #### ####'"
            v-model="v$.accountNumberInput.$model"
            placeholder="1234 5678 9012 3456"
            autocomplete
            @keypress="signInOnEnter"
          />
        </div>
        <!-- error message  -->
        <div class="flex items-center errorMessage mt-2"
          v-for="error of v$.accountNumberInput.$errors"
          :key="error.$uid"
        >
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ error.$message }}</span>
        </div>
        <div v-if="errors.accountNumberInput" class="flex items-center errorMessage mt-2">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ errors.accountNumberInput }}</span>
        </div>
        <!-- buttons -->
        <div class="flex flex-col mt-6">
          <!-- sign in -->
          <button
            @click.prevent="signIn"
            class="mb-2 button button--success"
            :disabled="!canSignIn"
            v-show="!requires2FA"
          >
            <div v-if="isLoading" class="flex flex-row">
              <span>Signing in</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Sign in</span>
          </button>
          <!-- lost account -->
          <router-link :to="{ name: 'Recover Account' }"
            class="w-full text-sm text-center text-gray-500 underline hover:text-green"
          >
            I lost my account number
          </router-link>
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
            <span>Create new account</span>
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
          <!-- eslint-disable-next-line max-len -->
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
            @keypress="signInOnEnter"
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
        <div v-if="useBackupCode"><div class="flex items-center errorMessage mt-2"
          v-for="error of v$.backupCode.$errors"
          :key="error.$uid"
        >
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ error.$message }}</span>
        </div>
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

import * as format from '../../utils/format'
import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import AuthCodeInput from '@/components/AuthCodeInput'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import useVuelidate from '@vuelidate/core'
import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'SignIn',
  title() {
    return 'Edge Account Portal » Sign In'
  },
  components: {
    AuthCodeInput,
    ExclamationIcon,
    HttpError,
    LoadingSpinner,
    Logo,
    ShieldExclamationIcon
  },
  data() {
    return {
      accountNumberInput: '',
      backupCode: '',
      errors: {
        accountNumberInput: '',
        backupCode: '',
        otpSecret: ''
      },
      httpError: null,
      is2FACodeValid: false,
      isLoading: false,
      otpSecret: '',
      requires2FA: false,
      useBackupCode: false
    }
  },
  validations() {
    return {
      accountNumberInput: [
        validation.accountNumberInput
      ],
      backupCode: [
        validation.backupCode
      ]
    }
  },
  computed: {
    accountNumber() {
      return format.removeSpaces(this.accountNumberInput)
    },
    canSignIn() {
      return !this.v$.accountNumberInput.$invalid && !this.errors.accountNumberInput && !this.isLoading
    },
    signInBody() {
      const body = { account: this.accountNumber }
      if (this.useBackupCode) body.backupCode = this.backupCode
      if (this.otpSecret) body.otp = this.otpSecret
      return body
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
    resetOtpErrors() {
      this.errors.otpSecret = ''
    },
    returnToSignIn() {
      this.errors.accountNumberInput = ''
      this.otpSecret = ''
      this.requires2FA = false
    },
    async signIn() {
      if (this.v$.accountNumberInput.$invalid) return
      if (this.requires2FA && this.useBackupCode && this.v$.backupCode.$invalid) return

      this.isLoading = true

      try {
        const { session } = await utils.sessions.createSession(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.signInBody
        )
        if (session._key) {
          const { account } = await utils.accounts.getAccount(
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
      catch (error) {
        if (this.requires2FA) {
          setTimeout(() => {
            this.httpError = error
            this.isLoading = false
          }, 500)
        }
        if (error.response) {
          if (error.response && error.response.status === 401) {
            this.requires2FA = true
            this.isLoading = false
          }
          else {
            setTimeout(() => {
              this.isLoading = false
              this.errors.accountNumberInput = 'We couldn\'t find that account'
            }, 800)
          }
        }
      }
    },
    signInOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.signIn()
    },
    async toggleUseBackupCode() {
      this.backupCode = ''
      this.otpSecret = ''
      this.httpError = ''
      await this.v$.$reset()
      this.useBackupCode = !this.useBackupCode
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    accountNumberInput() {
      // reset account number error (i.e. invalid account) when input is changed
      this.errors.accountNumberInput = ''
    },
    backupCode() {
      this.httpError = ''
    },
    otpSecret() {
      this.httpError = ''
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
