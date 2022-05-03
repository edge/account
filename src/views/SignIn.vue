<template>
  <div class="signIn">
    <div class="signIn__left">
      <div class="signIn__content">
        <Logo/>

        <form class="">
          <p class="pr-5 text-lg">
            <span v-if="activePanel === 'signIn'">Welcome back. Enter your account number to sign into the Edge Network.</span>
            <span v-else>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</span>
          </p>

          <!-- SIGN IN PANEL -->
          <div v-if="activePanel === 'signIn'" class="signIn__form">
            <!-- input group -->
            <!-- apply input-group__error class for error styles -->
            <div class="input-group">
              <label for="accountNumber" class="label">Account number</label>
              <input
                id="accountNumber"
                class="input input--floating"
                v-mask="'#### #### #### ####'"
                v-model="accountNumber"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <!-- error message  -->
            <div class="flex items-center errorMessage" v-show="errors.accountNumber">
              <ExclamationIcon class="w-3.5 h-3.5" />
              <span class="errorMessage__text">{{errors.accountNumber}}</span>
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
                @click.prevent="signIn()"
                class="mb-2 button button--success"
                :disabled="isSigningIn || errors.accountNumber"
                v-show="!requires2fa"
              >
                <span v-if="isSigningIn">Signing in</span>
                <span v-else>Sign in</span>
                <span v-if="isSigningIn">
                  <LoadingSpinner />
                </span>
              </button>
              <a href="#" class="w-full text-sm text-center text-gray-500 underline hover:text-green">I lost my account number</a>
              <div class="flex items-center w-full my-6 space-x-2">
                <div class="flex-1 h-px bg-gray-400" />
                <span class="inline-block tracking-wider text-black">OR</span>
                <div class="flex-1 h-px bg-gray-400" />
              </div>
              <button
                @click="generateAccount"
                class="button button--solid"
                :disabled="isCreatingAccount"
              >
                <span v-if="isCreatingAccount">Creating your account</span>
                <span v-else>Create new account</span>
                <span v-if="isCreatingAccount">
                  <LoadingSpinner />
                </span>
              </button>
            </div>
          </div>

          <!-- CREATE ACCOUNT PANEL -->
          <div v-else class="flex flex-col mt-6">
            <span class="text-xs font-medium tracking-wider uppercase text-green">My new account number:</span>
            <div class="accountNumber">
              <input
                readonly
                class="absolute opacity-0 focus:outline-none"
                :value="accountNumber"
              />
              <span class="text-3xl">{{accountNumber}}</span>
              <button @click.prevent="copyToClipboard" class="text-gray-400 hover:text-green">
                <DuplicateIcon class="w-6 h-6" />  
              </button>
              <div
                class="copied"
                :class="copied ? 'visible' : ''"
              >
                Copied!
              </div>
            </div>
            <span class="mt-6 font-medium text-black">Write down your account number!</span>
            <span class="mt-1 text-gray-500">It’s all you need to access the Edge Network. No email, no username. Just anonymity.</span>

            <!-- buttons -->
            <div class="mt-8">
              <button
                class="w-full mb-2 button button--solid"
              >
                <router-link to='/account'>Set up recovery email</router-link>
              </button>
              <button
                @click.prevent="finish()"
                class="w-full button button--solid button--success"
                :disabled="isCreatingAccount"
              >
                <span>Go to my account</span>
              </button>
              <button @click.prevent="this.activePanel = 'signIn'" class="w-full mt-2 text-sm text-center text-gray-500 underline hover:text-green">I already have an account</button>
            </div>
          </div>
        </form>

      </div>
    </div>
    <div class="signIn__right">
      <img class="object-cover w-full h-full" src="https://images.unsplash.com/photo-1614777735430-7b46df56b404?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=664&q=80" />
    </div>
  </div>
</template>

<script>
import { DuplicateIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import SideNavigation from '@/components/SideNavigation'
import Tooltip from '@/components/Tooltip'
import UserMenu from '@/components/UserMenu'
import { mapActions, mapGetters } from 'vuex'
import { generateAccountNumber } from '../utils/api'

export default {
  name: 'Sign In',
  title() {
    return 'Edge Account Portal » Sign In'
  },
  components: {
    DuplicateIcon,
    ExclamationIcon,
    InformationCircleIcon,
    LoadingSpinner,
    Logo,
    SideNavigation,
    Tooltip,
    UserMenu,
  },
  data() {
    return {
      accountNumber: '',
      activePanel: 'signIn',
      copied: false,
      errors: {
        accountNumber: ''
      },
      isCreatingAccount: false,
      isSigningIn: false,
      isVerifying: false,
      requires2fa: false,
      totpSecret: null,
      totpToken: null
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/StateUser'
    })
  },
  methods: {
    ...mapActions(['auth/login', 'auth/register', 'auth/verifyToken']),
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.accountNumber)
      
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    async generateAccount() {
      this.isCreatingAccount = true
      const newAccountNumber = await generateAccountNumber()

      setTimeout(async () => {
        this.accountNumber = newAccountNumber.accountNumber
        await this['auth/register'](this.accountNumber)
        this.activePanel = 'createAccount'
        this.isCreatingAccount = false
      }, 2000)
    },
    async finish() {
      this.$router.push('/')
    },
    async signIn() {
      this.isSigningIn = true

      const loginResponse = await this['auth/login'](this.accountNumber)

      setTimeout(() => {
        if (this.user) {
          this.$router.push('/servers')
        } else {
          if (loginResponse.requires2fa) {
            this.requires2fa = true
            this.totpSecret = loginResponse.totpSecret
          } else {
            this.isSigningIn = false
            this.errors.accountNumber = 'No account found'
          }
        }
      }, 2000)
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
    },
    validateAccountNumber(value) {
      const regex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/

      if (regex.test(value)) {
        this.errors['accountNumber'] = null
      } else {
        this.errors['accountNumber'] = 'Your account number is 16 digits'
      }
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    accountNumber(value) {
      this.validateAccountNumber(value)
    }
  }
}
</script>
<style scoped>
  .signIn {
    @apply flex w-screen h-screen bg-white;
  }
  .signIn__left {
    @apply flex justify-center w-full h-full px-5 lg:w-1/2;
  }
  .signIn__right {
    @apply hidden w-1/2 h-full lg:block;
  }
  .signIn__content {
    @apply flex flex-col w-full my-auto space-y-8 py-10 sm:max-w-md;
  }
  .signIn__form {
    @apply flex flex-col space-y-6;
  }
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
