<template>
  <div class="landingPage__content">
    <div>
      <Logo class="mb-6" />
      <p class="pr-5 text-lg mb-6">
        <span>Recover your account.</span>
      </p>
      <p class="text-gray-500">Enter your email address below and we'll send you an email with a recovery code.</p>
      <p class="text-gray-500">If you never enabled a recovery email for your account, well daaammnn, there's nothing we can do. Sorry bud!</p>
      <div class="input-field flex w-full">
        <input
          v-model="v$.email.$model"
          label="Email address"
          type="email"
          autocomplete="off"
          class="border border-gray flex-1 px-3 py-2 text-lg rounded-md focus:outline-none"
          placeholder="Enter your email address"
          @keypress="requestEmailOnEnter"
        />
      </div>
      <!-- error message  -->
      <div class="flex items-center errorMessage mt-2" v-for="error of v$.email.$errors" :key="error.$uid">
        <ExclamationIcon class="w-3.5 h-3.5" />
        <span class="errorMessage__text">{{ error.$message }}</span>
      </div>
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
            <span><LoadingSpinner /></span>
          </div>
          <span v-else>Recover Account</span>
        </button>
        <button
          @click.prevent="returnToSignIn"
          class="button button--solid"
          >
          <span>Cancel</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import { ExclamationIcon } from '@heroicons/vue/outline'
import AuthCodeInput from '@/components/AuthCodeInput'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import useVuelidate from '@vuelidate/core'

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

export default {
  name: 'RecoverAccount',
  title() {
    return 'Edge Account Portal » Recover Account'
  },
  components: {
    AuthCodeInput,
    ExclamationIcon,
    LoadingSpinner,
    Logo,
  },
  data() {
    return {
      email: '',
      errors: {
        email: '',
        otpSecret: ''
      },
      isLoading: false,
      otpSecret: '',
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
    accountNumber() {
      return this.accountNumberInput.split(' ').join('')
    },
    canSignIn() {
      return !this.v$.accountNumberInput.$invalid && !this.errors.accountNumberInput
    }
  },
  methods: {
    onUpdateOtp(newCode) {
      this.otpSecret = newCode
      this.signIn()
    },
    returnToSignIn() {
      this.$router.push({ name: 'Sign In' })
    },
    requestEmail() {

    },
    requestEmailOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.sendEmail()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
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
</style>
