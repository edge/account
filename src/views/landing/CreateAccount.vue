<template>
  <div class="landingPage__content">
    <Logo/>

    <div>
      <p class="pr-5 text-lg">
        <span>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</span>
      </p>

      <div>
        <div class="step">
          <div class="step-title">
            <KeyIcon class="step-icon" />
            <span>Create an account</span>
          </div>

          <div class="step-content">
            <!-- generate account button -->
            <div class="my-4" v-show="!isAccountGenerated && !isGeneratingAccount">
              <button
                @click.prevent="generateAccount"
                class="w-full button button--solid button--success"
                :disabled="isGeneratingAccount"
              >
                <span>Generate Account</span>
              </button>
            </div>

            <div class="accountNumber" v-show="isAccountGenerated || isGeneratingAccount">
              <span class="text-2xl text-green monospace">{{formattedAccountNumber}}</span>
              <button v-show="isAccountGenerated" @click.prevent="copyToClipboard" class="text-gray-400 hover:text-green">
                <DuplicateIcon class="w-6 h-6" />
              </button>
              <div
                class="copied"
                :class="copied ? 'visible' : ''"
              >
                Copied!
              </div>
            </div>

            <div class="mt-3" v-show="isGeneratingAccount">
              <span class="text-gray-500">Generating your account number.</span>
            </div>

            <div class="mt-3 flex flex-col" v-show="isAccountGenerated">
              <span class="font-medium text-black">Write down your account number!</span>
              <span class="mt-1 text-gray-500">It’s all you need to access the Edge Network. No email, no username. Just anonymity.</span>
            </div>
          </div>

        </div>

        <div class="step" :class="step < 2 ? 'inactive' : ''" >
          <div class="step-title" @click="changeStep(2)">
            <FingerPrintIcon class="step-icon"/>
            <span>Secure your account</span>
          </div>

          <div class="step-content" v-show="step === 2">
            <!-- generate account button -->
            <div class="my-4">
              <button
                @click.prevent="generateAccount"
                class="my-2 w-full button button--solid"
              >
                <span>Enable Two-factor Authentication (2FA)</span>
              </button>
              <button
                @click.prevent="generateAccount"
                class="my-2 w-full button button--solid"
              >
                <span>Add Recovery Email</span>
              </button>
            </div>
            <!-- buttons -->
            <div>
              <button @click.prevent="step = 3" class="w-full text-sm text-center text-gray-500 underline hover:text-green">Skip for now</button>
            </div>
          </div>
        </div>

        <div class="step" :class="step < 3 ? 'inactive' : ''" >
          <div class="step-title" @click="changeStep(3)">
            <CurrencyDollarIcon class="step-icon" />
            <span>Add credit to your account</span>
          </div>

          <div class="step-content" v-show="step === 3">
            <span class="text-md self-center mt-3">SOME CONTENT WILL GO HERE</span>
            <!-- buttons -->
            <div class="mt-8">
              <button @click.prevent="finish" class="w-full mt-2 text-sm text-center text-gray-500 underline hover:text-green">Skip for now</button>
            </div>
          </div>
        </div>

        <div class="step" >
          <!-- buttons -->
          <div class="mt-6">
            <button
              v-if="step > 1"
              @click.prevent="finish"
              class="w-full button button--solid button--success"
            >
              <span>Go directly to my account</span>
            </button>
            <button v-else @click.prevent="finish" class="w-full mt-2 text-sm text-center text-gray-500 underline hover:text-green">I already have an account</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import * as validation from '../../utils/validation'
import { CurrencyDollarIcon, DuplicateIcon, FingerPrintIcon, ExclamationIcon, KeyIcon } from '@heroicons/vue/outline'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import Tooltip from '@/components/Tooltip'
import UserMenu from '@/components/UserMenu'
import { mapActions, mapGetters } from 'vuex'
import { generateAccountNumber } from '../../utils/api'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'Sign In',
  title() {
    return 'Edge Account Portal » Sign In'
  },
  components: {
    CurrencyDollarIcon,
    DuplicateIcon,
    ExclamationIcon,
    FingerPrintIcon,
    InformationCircleIcon,
    KeyIcon,
    LoadingSpinner,
    Logo,
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
      isGeneratingAccount: false,
      isVerifying: false,
      requires2fa: false,
      step: 1,
      totpSecret: null,
      totpToken: null
    }
  },
  validations() {
    return {
      accountNumber: [
        validation.accountNumber
     ]
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/StateUser'
    }),
    isAccountGenerated() {
      return this.accountNumber && !this.isGeneratingAccount
    },
    formattedAccountNumber() {
      // TEMPORARY, UNTIL API IS UPDATED
      if (this.accountNumber.length > 16) return this.accountNumber

      // add space every 4 characters
      return this.accountNumber.toString().replace(/.{4}/g, '$& ')
    }
  },
  methods: {
    ...mapActions(['auth/login', 'auth/register', 'auth/verifyToken']),
    changeStep (newStep) {
      if (!this.isAccountGenerated) return
      this.step = newStep
    },
    async copyToClipboard () {
      if (this.isGeneratingAccount || !this.accountNumber) return
      this.copied = true
      await navigator.clipboard.writeText(this.accountNumber)

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    async generateAccount() {
      this.isGeneratingAccount = true

      const newAccountNumber = await generateAccountNumber()

      this.accountNumber = this.generateRandomAccountNumber()
      const numGeneratorId = setInterval(() => {
        this.accountNumber = this.generateRandomAccountNumber()
      }, 200)

      setTimeout(async () => {
        clearInterval(numGeneratorId)
        // this.accountNumber = newAccountNumber.accountNumber
        // await this['auth/register'](this.accountNumber)

        // TEMPORARY, UNTIL API IS UPDATED
        this.accountNumber = "0142 9991 9226 0627"
        await this['auth/login']("0142 9991 9226 0627")

        this.isGeneratingAccount = false
        this.step = 2
      }, 5000)
    },
    generateRandomAccountNumber() {
      return Math.floor(Math.random() * 1e16)
    },
    async finish() {
      this.$router.push('/')
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
    accountNumber() {
      // reset account number error (i.e. invalid account) when input is changed
      this.errors.accountNumber = ''
    }
  }
}
</script>
<style scoped>
  .accountNumber {
    @apply flex items-center justify-between relative py-3 pr-3;
  }
  .copied {
    @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
    @apply transition-opacity duration-200 ease-in;
  }
  .copied.visible {
    @apply opacity-100;
  }

  .step {
    @apply flex flex-col mb-6;
  }

  .step-title {
    @apply relative flex flex-row items-center text-lg cursor-pointer;
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
</style>
