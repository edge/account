<template>
  <div class="landingPage__content mt-14">
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

          <div class="step-content" v-if="step === 2">
            <div class="my-4">
              <button
                @click.prevent="toggleShow2fa"
                class="w-full button button--solid"
              >
                <span>Enable Two-factor Authentication (2FA)</span>
                <div class="absolute right-3">
                  <ChevronDownIcon v-if="show2fa" class="chevron-icon" />
                  <ChevronRightIcon v-else class="chevron-icon" />
                </div>
              </button>
              <div v-show="show2fa">
                <div class="input-group mt-2">
                  <GoogleAuthEnable v-if="!is2faEnabled" :confirmEnabled="onEnable2fa" />
                  <div v-else class="my-4 flex items-center">
                    <div>
                      <CheckCircleIcon class="w-5 text-green" />
                    </div>
                    <span class="ml-2">Two-factor authentication successfully enabled</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mb-4">
              <button
                @click.prevent="toggleShowRecovery"
                class="w-full button button--solid"
              >
                <span>Add Recovery Email</span>
                <div class="absolute right-3">
                  <ChevronDownIcon v-if="showRecovery" class="chevron-icon" />
                  <ChevronRightIcon v-else class="chevron-icon" />
                </div>
              </button>
              <div v-show="showRecovery">
                <div class="input-group mt-2">
                  <RecoveryEmail v-if="!isRecoveryEnabled" :confirmEnabled="onEnableRecovery" />
                  <div v-else class="my-2 flex items-center">
                    <div>
                      <CheckCircleIcon class="w-5 text-green" />
                    </div>
                    <span class="ml-2">Recovery email successfully added</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- skip step button -->
            <button
              @click.prevent="step = 3"
              class="w-full text-sm text-center text-gray-500 underline hover:text-green"
            >
              Skip for now
            </button>
          </div>
          <div class="step-content" v-else-if="step > 2">
            <div class="my-4">
              <div class="flex items-center mb-4">
                <div>
                  <CheckCircleIcon v-if="is2faEnabled" class="w-5 text-green" />
                  <MinusCircleIcon v-else class="w-5 text-gray" />
                </div>
                <span class="ml-2">Two-factor authentication {{ is2faEnabled ? 'successfully' : 'not' }} enabled</span>
              </div>
              <div class="flex items-center">
                <div>
                  <CheckCircleIcon v-if="isRecoveryEnabled" class="w-5 text-green" />
                  <MinusCircleIcon v-else class="w-5 text-gray" />
                </div>
                <span class="ml-2">Recovery email {{ isRecoveryEnabled ? 'successfully' : 'not' }} added</span>
              </div>
            </div>
          </div>
        </div>

        <div class="step" :class="step < 3 ? 'inactive' : ''" >
          <div class="step-title" @click="changeStep(3)">
            <CurrencyDollarIcon class="step-icon" />
            <span>Add credit to your account</span>
          </div>

          <div class="step-content" v-if="step === 3 || isAccountSecured">
            <div class="grid grid-cols-3 grid-rows-2 gap-3 my-4">
              <span class="credit-item">
                <CubeTransparentIcon class="credit-item-icon" />
                <span class="text-sm">XE</span>
              </span>
              <span class="credit-item">
                <CurrencyYenIcon class="credit-item-icon" />
                <span class="text-sm">EDGE</span>
              </span>
              <span class="credit-item">
                <CreditCardIcon class="credit-item-icon" />
                <span class="text-sm">Credit/Debit</span>
              </span>
              <span class="credit-item">
                <CurrencyBangladeshiIcon class="credit-item-icon" />
                <span class="text-sm">BTC</span>
              </span>
              <span class="credit-item">
                <CurrencyEuroIcon class="credit-item-icon" />
                <span class="text-sm">ETH</span>
              </span>
              <span class="credit-item">
                <CurrencyRupeeIcon class="credit-item-icon" />
                <span class="text-sm">xHaven</span>
              </span>
            </div>

            <!-- skip step button -->
            <button @click.prevent="goToAccount" class="w-full mt-2 text-sm text-center text-gray-500 underline hover:text-green">Skip for now</button>
          </div>
        </div>

        <div >
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
import * as utils from '../../account-utils/index'
import {
  CurrencyDollarIcon,
  DuplicateIcon,
  ExclamationIcon,
  FingerPrintIcon,
  KeyIcon,
  MinusCircleIcon
} from '@heroicons/vue/outline'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,

  // temporary icons for add credit section
  CubeTransparentIcon,
  CurrencyBangladeshiIcon,
  CurrencyEuroIcon,
  CurrencyRupeeIcon,
  CurrencyYenIcon,

  InformationCircleIcon,
} from '@heroicons/vue/solid'
import GoogleAuthEnable from "@/components/account/GoogleAuthEnable"
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Logo from '@/components/Logo'
import RecoveryEmail from "@/components/account/RecoveryEmail"
import Tooltip from '@/components/Tooltip'
import UserMenu from '@/components/UserMenu'

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

export default {
  name: 'CreateAccount',
  title() {
    return 'Edge Account Portal » Create Account'
  },
  components: {
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CreditCardIcon,
    CurrencyDollarIcon,

    // temporary icons for add credit section
    CurrencyBangladeshiIcon,
    CurrencyEuroIcon,
    CurrencyRupeeIcon,
    CurrencyYenIcon,
    CubeTransparentIcon,

    DuplicateIcon,
    ExclamationIcon,
    FingerPrintIcon,
    GoogleAuthEnable,
    InformationCircleIcon,
    KeyIcon,
    LoadingSpinner,
    Logo,
    MinusCircleIcon,
    RecoveryEmail,
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
      is2faEnabled: false,
      isRecoveryEnabled: false,
      show2fa: false,
      showRecovery: false,
      step: 1,
      totpSecret: null,
      totpToken: null
    }
  },
  computed: {
    isAccountGenerated() {
      return this.accountNumber && !this.isGeneratingAccount
    },
    isAccountSecured() {
      return this.is2faEnabled && this.isRecoveryEnabled
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
          const res = await utils.accounts.createAccount(ACCOUNT_API_URL)
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
    onEnable2fa() {
      this.is2faEnabled = true
    },
    onEnableRecovery() {
      this.isRecoveryEnabled = true
    },
    toggleShow2fa() {
      this.show2fa = !this.show2fa
      if (this.show2fa) this.showRecovery = false
    },
    toggleShowRecovery() {
      this.showRecovery = !this.showRecovery
      if(this.showRecovery) this.show2fa = false
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
    @apply flex flex-col border border-gray rounded-md p-1 items-center justify-center cursor-pointer hover:border-green text-gray hover:text-green;
  }

  .credit-item-icon {
    @apply h-10;
  }

  .chevron-icon {
    @apply h-4 text-white;
  }
</style>
