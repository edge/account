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

              <!-- error message  -->
              <div v-if="errors.accountNumber" class="flex items-center errorMessage mt-2">
                <ExclamationIcon class="w-3.5 h-3.5" />
                <span class="errorMessage__text">{{ errors.accountNumber }}</span>
              </div>
            </div>

            <div class="accountNumber" v-show="isAccountGenerated || isGeneratingAccount">
              <span class="text-2xl text-green monospace">{{ formattedAccountNumber }}</span>
              <button
                v-show="isAccountGenerated"
                @click.prevent="copyToClipboard"
                class="text-gray-400 hover:text-green"
              >
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
            <!-- skip step button -->
            <button @click.prevent="step = 3" class="w-full text-sm text-center text-gray-500 underline hover:text-green">Skip for now</button>
          </div>
        </div>

        <div class="step" :class="step < 3 ? 'inactive' : ''" >
          <div class="step-title" @click="changeStep(3)">
            <CurrencyDollarIcon class="step-icon" />
            <span>Add credit to your account</span>
          </div>

          <div class="step-content" v-show="step === 3">
            <div class="grid grid-cols-3 grid-rows-2 gap-3 my-4">
              <span class="credit-item">
                <CurrencyDollarIcon class="credit-item-icon" />
                <span class="text-sm">XE</span>
              </span>
              <span class="credit-item">
                <CurrencyDollarIcon class="credit-item-icon" />
                <span class="text-sm">EDGE</span>
              </span>
              <span class="credit-item">
                <CreditCardIcon class="credit-item-icon" />
                <span class="text-sm">Credit/Debit</span>
              </span>
              <span class="credit-item">
                <CurrencyDollarIcon class="credit-item-icon" />
                <span class="text-sm">BTC</span>
              </span>
              <span class="credit-item">
                <CurrencyDollarIcon class="credit-item-icon" />
                <span class="text-sm">ETH</span>
              </span>
              <span class="credit-item">
                <CurrencyDollarIcon class="credit-item-icon" />
                <span class="text-sm">xHaven</span>
              </span>
            </div>

            <!-- skip step button -->
            <button @click.prevent="goToAccount" class="w-full mt-2 text-sm text-center text-gray-500 underline hover:text-green">Skip for now</button>
          </div>
        </div>

        <div class="step" >
          <!-- buttons -->
          <div class="mt-6">
            <button
              v-if="step > 1"
              @click.prevent="goToAccount"
              class="w-full button button--solid button--success"
            >
              <span>Go directly to my account</span>
            </button>
            <router-link v-else
              :to="{ name: 'Sign In' }"
              class="w-full block mt-2 text-sm text-center text-gray-500 underline hover:text-green"
            >I already have an account</router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { CurrencyDollarIcon, DuplicateIcon, FingerPrintIcon, ExclamationIcon, KeyIcon } from '@heroicons/vue/outline'
import { CreditCardIcon, InformationCircleIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import Tooltip from '@/components/Tooltip'
import UserMenu from '@/components/UserMenu'
import { createAccount } from '@/utils/account-utils'

export default {
  name: 'CreateAccount',
  title() {
    return 'Edge Account Portal » Create Account'
  },
  components: {
    CreditCardIcon,
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
  computed: {
    isAccountGenerated() {
      return this.accountNumber && !this.isGeneratingAccount
    },
    formattedAccountNumber() {
      // add space every 4 characters
      return this.accountNumber.toString().replace(/.{4}/g, '$& ')
    }
  },
  methods: {
    changeStep (newStep) {
      if (!this.isAccountGenerated) return
      this.step = newStep
    },
    async copyToClipboard () {
      await navigator.clipboard.writeText(this.accountNumber)
      this.copied = true

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    async generateAccount() {
      this.isGeneratingAccount = true
      this.errors.accountNumber = ''
      this.accountNumber = this.generateRandomAccountNumber()
      const numGeneratorId = setInterval(() => {
        this.accountNumber = this.generateRandomAccountNumber()
      }, 100)

      setTimeout(async () => {
        try {
          const res = await createAccount()
          // finish number generator on newly generated account number and dispatch to store
          clearInterval(numGeneratorId)
          this.accountNumber = res.account._key
          this.$store.commit('setAccount', res.account)
          this.$store.commit('setSession', res.session)

          this.isGeneratingAccount = false
          this.changeStep(2)
        }
        catch (error) {
          clearInterval(numGeneratorId)
          this.isGeneratingAccount = false
          this.accountNumber = ''
          this.errors.accountNumber = 'Oops, something went wrong. Please try again.'
        }
      }, 1000)
    },
    generateRandomAccountNumber() {
      return Math.floor(Math.random() * 1e16)
    },
    async goToAccount() {
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

  .credit-item {
    @apply flex flex-col border-2 border-gray rounded-md items-center justify-center cursor-pointer hover:border-green text-gray hover:text-green;
  }

  .credit-item-icon {
    @apply h-10;
  }
</style>
