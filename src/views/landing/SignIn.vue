<template>
  <div class="landingPage__content">
    <Logo/>

    <form class="">
      <p class="pr-5 text-lg">
        <span>Welcome back. Enter your account number to sign into the Edge Network.</span>
      </p>

      <div class="landingPage__form">
        <!-- input group -->
        <!-- apply input-group__error class for error styles -->
        <div class="input-group">
          <label for="accountNumber" class="label">Account number</label>
          <input
            id="accountNumber"
            class="input input--floating"
            v-mask="'#### #### #### ####'"
            v-model="v$.accountNumberInput.$model"
            placeholder="1234 5678 9012 3456"
          />
        </div>
        <!-- error message  -->
        <div class="flex items-center errorMessage" v-for="error of v$.accountNumberInput.$errors" :key="error.$uid">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{error.$message}}</span>
        </div>
        <div v-if="errors.accountNumberInput" class="flex items-center errorMessage">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{errors.accountNumberInput}}</span>
        </div>

        <div v-show="requires2fa">
          <div class="relative input-group">
            <div class="flex items-center space-x-1">
              <label for="twoFactorCode" class="label">Verification Code</label>
              <Tooltip
                class="icon-grey"
                position="right"
                :wide="true"
                theme="light"
                text="Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Sed posuere consectetur est at lobortis.">
                <InformationCircleIcon class="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <input
              id="twoFactorCode"
              v-model="totpToken"
              label="Two-factor code"
              type="text"
              autocomplete="off"
              class="flex-1 input input--floating"
              placeholder="Enter your authentication code"
            />
            <span class="absolute top-0 right-0 flex-1 text-xs text-red" v-if="errors.totpToken">{{errors.totpToken}}</span>
          </div>
          <button
            class="w-full mt-6 button button--success"
            @click.prevent="verify2fa"
            :disabled="isVerifying"
          >
            {{ isVerifying ? 'Verifying' : 'Verify' }}
            <span v-if="isVerifying">
              <LoadingSpinner />
            </span>
          </button>
        </div>

        <!-- buttons -->
        <div class="flex flex-col" :class="requires2fa ? 'transform -translate-y-4' : ''">
          <button
            @click.prevent="signIn"
            class="mb-2 button button--success"
            :disabled="isSigningIn || !canSignIn"
            v-show="!requires2fa"
          >
            <div v-if="isSigningIn" class="flex flex-row">
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
    </form>
  </div>
</template>

<script>
import * as validation from '../../utils/validation'
import { ExclamationIcon } from '@heroicons/vue/outline'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import Tooltip from '@/components/Tooltip'
import UserMenu from '@/components/UserMenu'
import useVuelidate from '@vuelidate/core'

import { createSession, getAccount } from '@/utils/account-utils'

export default {
  name: 'Sign In',
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
      errors: {
        accountNumberInput: ''
      },
      isSigningIn: false,
      isVerifying: false,
      requires2fa: false,
      totpSecret: null,
      totpToken: null
    }
  },
  validations() {
    return {
      accountNumberInput: [
        validation.accountNumberInput
     ]
    }
  },
  computed: {
    accountNumber() {
      return this.accountNumberInput.split(' ').join('')
    },
    canSignIn() {
      return !this.v$.$invalid && !this.errors.accountNumberInput
    }
  },
  methods: {
    goToCreateAccount () {
      this.$router.push({ name: 'Create Account' })
    },
    async signIn() {
      if (!await this.v$.$validate()) return

      this.isSigningIn = true

      try {
        const session = await createSession(this.accountNumber)

        setTimeout(async () => {
          if (session._key) {
            const account = await getAccount(session.account, session._key)
            this.$store.commit('setAccount', account)
            this.$store.commit('setSession', session)

            this.$router.push('/servers')
          }
        }, 1000)
      } catch (error) {
        setTimeout(() => {
          this.isSigningIn = false
          this.errors.accountNumberInput = 'No account found'
        }, 1000)
      }

      const session = await createSession(this.accountNumber)

      setTimeout(async () => {
        if (session._key) {
          const account = await getAccount(session.account, session._key)
          this.$store.commit('setAccount', account)
          this.$store.commit('setSession', session)

          this.$router.push('/servers')
        }

        // TEMPORARY - handle unauthorised log in attempt
        else if (!loginResponse) {
          this.isSigningIn = false
          this.errors.accountNumber = 'No account found'
        }

        else {
          if (loginResponse.requires2fa) {
            this.requires2fa = true
            this.totpSecret = loginResponse.totpSecret
          } else {
            this.isSigningIn = false
            this.errors.accountNumber = 'No account found'
          }
        }
      }, 1000)
    },
    async verify2fa() {
      this.isVerifying  = true
      // Check form is valid.
      if (!this.totpToken) {
        this.errors.totpToken = 'Please enter the code from your device'
        this.isVerifying  = false
      } else {
        this.errors.totpToken = ''
      }

      const body = {
        accountNumber: this.accountNumber,
        totpSecret: this.totpSecret,
        totpToken: this.totpToken
      }

      // The action sets the userAccount in state, so we can check for
      // this.user and redirect to the account.
      await this['auth/verifyToken'](body)

      setTimeout(() => {
        this.isVerifying  = false
        if (this.user) {
          this.$router.push('/')
        } else {
          this.isSigningIn = false
          this.errors.totpToken = 'Invalid 2FA token'
        }
      }, 2000)
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
