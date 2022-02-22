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

            <!-- buttons -->
            <div class="flex flex-col">
              <button
                @click.prevent="signIn()"
                class="button button--success"
                :disabled="isSigningIn || errors.accountNumber"
              >
                <span v-if="isSigningIn">Signing in</span>
                <span v-else>Sign in</span>
                <span v-if="isSigningIn">
                  <svg class="w-4 ml-2 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <line x1="12" y1="6" x2="12" y2="3" />
                    <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
                    <line x1="18" y1="12" x2="21" y2="12" />
                    <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
                    <line x1="12" y1="18" x2="12" y2="21" />
                    <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
                    <line x1="6" y1="12" x2="3" y2="12" />
                    <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
                  </svg>
                </span>
              </button>
              <a href="#" class="w-full mt-2 text-sm text-center text-gray-500 underline hover:text-green">I lost my account number</a>
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
                <span>Create new account</span>
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
                @click.prevent="register()"
                class="w-full button button--solid"
                :disabled="isCreatingAccount"
              >
                <span v-if="isCreatingAccount">Creating your account</span>
                <span v-else>Finish creating my account</span>
                <span v-if="isCreatingAccount">
                  <svg class="w-4 ml-2 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <line x1="12" y1="6" x2="12" y2="3" />
                    <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
                    <line x1="18" y1="12" x2="21" y2="12" />
                    <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
                    <line x1="12" y1="18" x2="12" y2="21" />
                    <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
                    <line x1="6" y1="12" x2="3" y2="12" />
                    <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
                  </svg>
                </span>
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
import Logo from '@/components/Logo'
import SideNavigation from '@/components/SideNavigation'
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
    Logo,
    SideNavigation,
    UserMenu,
  },
  data() {
    return {
      accountNumber: '',
      errors: {
        accountNumber: ''
      },
      isCreatingAccount: false,
      isSigningIn: false,
      activePanel: 'signIn',
      copied: false,
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/StateUser'
    })
  },
  methods: {
    ...mapActions(['auth/login', 'auth/register']),
    async copyToClipboard () {
      this.copied = true
      await navigator.clipboard.writeText(this.accountNumber)
      
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    async generateAccount() {
      this.activePanel = 'createAccount'
      const newAccountNumber = await generateAccountNumber()
      this.accountNumber = newAccountNumber.accountNumber
    },
    async register() {
      this.isCreatingAccount = true

      await this['auth/register'](this.accountNumber)
      
      setTimeout(() => {
        this.$router.push('/')
      }, 2000)
    },
    async signIn() {
      this.isSigningIn = true

      await this['auth/login'](this.accountNumber)

      setTimeout(() => {
        if (this.user) {
          this.$router.push('/')
        } else {
          this.isSigningIn = false
          this.errors.accountNumber = 'No account found'
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
