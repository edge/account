<template>
  <div class="landingPage__content">
    <Logo/>

    <div class="" v-if="!requires2fa" >
      <p class="pr-5 text-lg mb-2">
        <span>Welcome back. Enter your account number to sign into the Edge Network.</span>
      </p>
      <div class="landingPage__form">
        <div class="input-group">
          <label for="accountNumber" class="label">Account number</label>
          <input
            id="accountNumber"
            class="border border-gray rounded-md flex-1 px-3 py-2 text-center text-lg focus:outline-none"
            v-mask="'#### #### #### ####'"
            v-model="v$.accountNumberInput.$model"
            placeholder="1234 5678 9012 3456"
            @keypress="signInOnEnter"
          />
        </div>
        <!-- error message  -->
        <div class="flex items-center errorMessage mt-2" v-for="error of v$.accountNumberInput.$errors" :key="error.$uid">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ error.$message }}</span>
        </div>
        <div v-if="errors.accountNumberInput" class="flex items-center errorMessage mt-2">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ errors.accountNumberInput }}</span>
        </div>

        <!-- buttons -->
        <div class="flex flex-col mt-6" :class="requires2fa ? 'transform -translate-y-4' : ''">
          <button
            @click.prevent="signIn"
            class="mb-2 button button--success"
            :disabled="isLoading || !canSignIn"
            v-show="!requires2fa"
          >
            <div v-if="isLoading" class="flex flex-row">
              <span>Signing in</span>
              <span><LoadingSpinner /></span>
            </div>
            <span v-else>Sign in</span>
          </button>

          <a href="#" class="w-full text-sm text-center text-gray-500 underline hover:text-green">I lost my account number</a>

          <div class="flex items-center w-full my-6 space-x-2">
            <div class="flex-1 h-px bg-gray-400" />
            <span class="inline-block tracking-wider text-black">OR</span>
            <div class="flex-1 h-px bg-gray-400" />
          </div>

          <button
            @click.prevent="goToCreateAccount"
            class="button button--solid"
          >
            <span>Create new account</span>
          </button>
        </div>

      </div>
    </div>

    <div class="flex flex-col" v-else>
      <span class="text-lg mb-2">Authenticate your account.</span>
      <span class="text-gray">Please enter the 6-digit code from your two factor authentication app:</span>

      <div class="landingPage__form mt-4">
        <div class="input-group">
          <input
            v-model="v$.confirmationCode.$model"
            label="Confirmation code"
            autocomplete="off"
            class="border border-gray  text-center text-lg flex-1 px-3 py-2 rounded-md focus:outline-none "
            v-mask="'# # # # # #'"
            placeholder="1 2 3 4 5 6"
          />
        </div>
        <!-- error message  -->
        <div class="flex items-center errorMessage mt-2" v-for="error of v$.confirmationCode.$errors" :key="error.$uid">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ error.$message }}</span>
        </div>
        <div v-if="errors.confirmationCode" class="flex items-center errorMessage mt-2">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ errors.confirmationCode }}</span>
        </div>

        <div class="flex flex-col mt-6">
          <button
            @click.prevent="signIn"
            class="button button--success my-4"
            :disabled="!canVerify"
            >
            <span>Verify my account</span>
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
  </div>
</template>

<script>
import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import { ExclamationIcon } from '@heroicons/vue/outline'
import { InformationCircleIcon } from '@heroicons/vue/solid'
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
    ExclamationIcon,
    InformationCircleIcon,
    LoadingSpinner,
    Logo,
    Tooltip,
    UserMenu
  },
  data() {
    return {
      accountNumberInput: '',
      confirmationCode: '',
      errors: {
        accountNumberInput: '',
        confirmationCode: ''
      },
      isLoading: false,
      requires2fa: false
    }
  },
  validations() {
    return {
      accountNumberInput: [
        validation.accountNumberInput
      ],
      confirmationCode: [
        validation.confirmationCode
      ]
    }
  },
  computed: {
    accountNumber() {
      return this.accountNumberInput.split(' ').join('')
    },
    canSignIn() {
      return !this.v$.accountNumberInput.$invalid && !this.errors.accountNumberInput
    },
    canVerify() {
      return !this.v$.confirmationCode.$invalid && !this.errors.confirmationCode
    },
    otpSecret() {
      return this.confirmationCode ? this.confirmationCode.split(' ').join('') : null
    }
  },
  methods: {
    goToCreateAccount () {
      this.$router.push({ name: 'Create Account' })
    },
    returnToSignIn() {
      this.accountNumberInput = ''
      this.confirmationCode = ''
      this.requires2fa = false
    },
    async signIn() {
      if (this.v$.accountNumberInput.$invalid) return

      this.isLoading = true

      try {
        const session = await utils.sessions.createSession(ACCOUNT_API_URL, this.accountNumber, this.otpSecret)
        if (session._key) {
          const account = await utils.accounts.getAccount(ACCOUNT_API_URL, session._key)
          this.$store.commit('setAccount', account)
          this.$store.commit('setSession', session)

          this.$router.push('/servers')
        }
      } catch (error) {
        if (this.requires2fa) this.errors.confirmationCode = 'Verification code invalid'
        if (error.response) {
          if (error.response && error.response.status === 401) this.requires2fa = true
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
  },
  watch: {
    accountNumberInput() {
      // reset account number error (i.e. invalid account) when input is changed
      this.errors.accountNumberInput = ''
    },
    confirmationCode() {
      // reset account number error (i.e. invalid account) when input is changed
      this.errors.confirmationCode = ''
    }
  }
}
</script>
<style scoped>
  .accountNumber {
    @apply flex items-center justify-between relative p-3 mt-2 bg-gray-100 border border-gray-300;
  }
  .copied {
    @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
    @apply transition-opacity duration-200 ease-in;
  }
  .copied.visible {
    @apply opacity-100;
  }
</style>
