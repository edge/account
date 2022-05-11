<template>
  <div class="landingPage__content">
    <div>
      <Logo class="mb-6" />
      <p class="pr-5 text-lg mb-6">
        <span>Recover your account.</span>
      </p>
      <p class="text-gray-500">Enter your email address below and we'll send you an email with a recovery code.</p>
      <p class="text-gray-500">If you never enabled a recovery email for your account, well daaammnn, there's nothing we can do. Sorry bud!</p>
      <div class="input-field flex items-center w-full">
        <input
          v-model="v$.email.$model"
          label="Email address"
          type="email"
          autocomplete="off"
          class="border border-gray flex-1 px-3 py-2 text-lg rounded-md focus:outline-none"
          placeholder="Enter your email address"
          @keypress="enableOnEnter"
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
      <!-- button -->
      <div class="flex flex-col mt-6">
        <button
          class="text-sm button button--success mb-2"
          @click.prevent="enableRecovery"
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
import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/vue/outline'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import AuthCodeInput from '@/components/AuthCodeInput'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import Tooltip from '@/components/Tooltip'
import UserMenu from '@/components/UserMenu'
import useVuelidate from '@vuelidate/core'

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

export default {
  name: 'SignIn',
  title() {
    return 'Edge Account Portal » Sign In'
  },
  components: {
    AuthCodeInput,
    ExclamationIcon,
    InformationCircleIcon,
    LoadingSpinner,
    Logo,
    ShieldExclamationIcon,
    Tooltip,
    UserMenu
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
    async signIn() {
      if (this.v$.accountNumberInput.$invalid) return

      this.isLoading = true

      try {
        const session = await utils.sessions.createSession(ACCOUNT_API_URL, this.accountNumber, this.otpSecret)
        if (session._key) {
          const account = await utils.accounts.getAccount(ACCOUNT_API_URL, session._key)
          this.is2faAuthed = true
          this.$store.commit('setAccount', account)
          this.$store.commit('setSession', session)
          this.$store.commit('setIsAuthed', true)
          localStorage.setItem('session', session._key)

          setTimeout(() => {
            this.$router.push('/servers')
          }, 800);
        }
      } catch (error) {
        if (this.requires2fa) this.errors.otpSecret = 'Verification code invalid'
        if (error.response) {
          if (error.response && error.response.status === 401) {
            this.requires2fa = true
            this.isLoading = false
          }
          else this.errors.accountNumberInput = 'No account found'
        }
      }
      setTimeout(() => {
        this.isLoading = false
      }, 1000)
    },
    signInOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.signIn()
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
