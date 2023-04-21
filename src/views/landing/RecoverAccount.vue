<template>
  <div class="landingPage__content">
    <Logo />
    <!-- request recovery email step -->
    <div v-show="step === 1">
      <p class="text-lg">Recover your account.</p>
      <p class="text-gray-500">Enter your email address below and we'll send you an email with a recovery code.</p>
      <div class="input-field flex w-full">
        <input
          v-model="v$.email.$model"
          label="Email address"
          type="email"
          autocomplete="off"
          class="border border-gray flex-1 px-3 py-2 text-lg rounded-md focus:outline-none max-w-full"
          placeholder="Enter your email address"
          @keypress.enter=requestEmail
        />
      </div>
      <!-- error message  -->
      <ValidationError :errors="v$.email.$errors" />
      <div v-if="errors.email" class="flex items-center errorMessage mt-1">
        <ExclamationIcon class="w-3.5 h-3.5" />
        <span class="errorMessage__text">{{ errors.email }}</span>
      </div>
      <!-- buttons -->
      <div class="flex flex-col mt-6">
        <button
          class="text-sm button button--success mb-2"
          @click.prevent="requestEmail"
          :disabled="this.v$.email.$invalid || isLoading"
        >
          <div v-if="isLoading" class="flex flex-row">
            <span>Sending Email</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Send Recovery Email</span>
        </button>
        <button
          @click.prevent="continueToAccount"
          class="button button--solid"
          >
          <span>Cancel</span>
        </button>
      </div>
    </div>

    <!-- confirm code step -->
    <div v-show="step === 2">
      <p class="text-lg">Recover your account.</p>
      <!-- email sent message -->
      <div class="flex mb-2 items-center">
        <div>
          <BadgeCheckIcon class="h-5 text-green" />
        </div>
        <span class="ml-1 text-green">Recovery email sent to {{ email }}</span>
      </div>
      <p class="text-gray-500">
        Check your emails - we've sent you a code which you can enter below to recover your account number.
      </p>
      <!-- resend email button and feedback -->
      <p class="text-gray-500 mb-1">
        Haven't received the email?
        <span v-if="emailCooldown === 0"><span @click="reRequestEmail" class="underline cursor-pointer hover:text-green">Click here</span> to resend it.</span>
        <span v-else>Please wait {{ emailCooldown }} seconds.</span>
      </p>
      <!-- confirmation code and button -->
      <div class="mt-4">
        <AuthCodeInput
          :error="errors.recoveryCode"
          :isCodeValid="isRecoveryCodeValid"
          :onComplete="onUpdateRecoveryCode"
          :resetErrors="resetRecoveryCodeError"
        />
      </div>
      <!-- return to sign in button -->
      <div class="flex flex-col mt-6">
        <button
          @click.prevent="continueToAccount"
          class="button button--solid"
          >
          <span>Cancel</span>
        </button>
      </div>
    </div>

    <!-- display account number step -->
    <div v-show="step === 3">
      <p class="text-lg">Recover your account.</p>
      <!-- account number display -->
      <label class="label">Account number:</label>
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
      <!-- remember account number warning -->
      <div class="mt-3 flex flex-col">
        <span class="font-medium text-black">Write down your account number!</span>
        <span class="mt-1 text-gray-500">
          It’s all you need to access the Edge Network. No email, no username. Just anonymity.
        </span>
      </div>
      <!-- return to sign in button -->
      <div class="flex flex-col mt-6">
        <button
          @click.prevent="continueToAccount"
          class="button button--success"
          >
          <span>Continue to Your Account</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as api from '@/account-utils/index'
import * as validation from '@/utils/validation'
import AuthCodeInput from '@/components/AuthCodeInput'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { DuplicateIcon, ExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'RecoverAccount',
  title() {
    return 'Edge Account Portal » Recover Account'
  },
  components: {
    AuthCodeInput,
    BadgeCheckIcon,
    DuplicateIcon,
    ExclamationIcon,
    LoadingSpinner,
    Logo,
    ValidationError
  },
  data() {
    return {
      accountNumber: '',
      copied: false,
      email: '',
      emailCooldown: 0,
      errors: {
        email: '',
        recoveryCode: ''
      },
      iEmailCooldown: null,
      isLoading: false,
      isRecoveryCodeValid: false,
      recoveryCode: null,
      step: 1
    }
  },
  validations() {
    return {
      email: [
        validation.email,
        validation.required
      ]
    }
  },
  computed: {
    canSignIn() {
      return !this.v$.accountNumberInput.$invalid && !this.errors.accountNumberInput
    },
    formattedAccountNumber() {
      return format.accountNumber(this.accountNumber)
    }
  },
  methods: {
    async copyToClipboard () {
      await navigator.clipboard.writeText(this.accountNumber)
      this.copied = true

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    onUpdateRecoveryCode(newCode) {
      this.recoveryCode = newCode
      this.verifyCode()
    },
    resetRecoveryCodeError() {
      this.errors.recoveryCode = ''
    },
    continueToAccount() {
      this.$router.push({ name: 'Index' })
    },
    async reRequestEmail() {
      try {
        await this.requestEmail()
        this.showRecoveryEmailResent = true
        setTimeout(() => {
          this.showRecoveryEmailResent = false
        }, 5000)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.email = 'Oops, something went wrong. Please try again.'
          this.isLoading = false
        }, 1000)
      }
    },
    async requestEmail() {
      if (this.v$.email.$invalid) return
      this.isLoading = true
      try {
        await api.accounts.recoverAccount(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.email
        )
        setTimeout(() => {
          // set 15s email cooldown timer
          this.emailCooldown = 15
          this.iEmailCooldown = setInterval(() => {
            this.emailCooldown = this.emailCooldown - 1
            if (this.emailCooldown === 0) clearInterval(this.iEmailCooldown)
          }, 1000)

          this.isLoading = false
          this.step = 2
        }, 500)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.email = 'We don\'t appear to have an account with this email address.'
          this.isLoading = false
        }, 1000)
      }
    },
    async verifyCode() {
      try {
        const { account, session } = await api.accounts.verifyRecoverAccount(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.email,
          this.recoveryCode
        )

        this.accountNumber = account._key
        const payload = { account, session }
        this.$store.dispatch('signIn', payload)

        this.isRecoveryCodeValid = true
        this.step = 3
      }
      catch (error) {
        this.errors.recoveryCode = 'Recovery code invalid'
      }
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    email() {
      this.errors.email = ''
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

@media (max-width: 350px) {
  .account-number {
    @apply text-lg p-3;
  }
}
</style>
