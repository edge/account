<template>
  <div class="mt-4">
    <div
      v-if="!backupCodes"
      class="text-gray-500"
      :class="createAccount ? 'createAccount' : 'md:grid'"
    >
      <ol>
        <li>Install the Google Authenticator app for
          <a class="underline text-green hover:text-green-600" target="_blank"
          href="https://itunes.apple.com/au/app/google-authenticator/id388497605?mt=8">iPhone</a>
          or
          <a class="underline text-green hover:text-green-600" target="_blank"
          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Android</a>.
        </li>
        <li>
          <span v-if="manualEntry">Using the app, enter the secret below.</span>
          <span v-else>Using the app, scan the QR code.</span>

          <div class="qrcode inflow">
            <div v-if="manualEntry" class="manualEntry pt-2">
              <span>Secret:</span>
              <div class="relative flex items-center">
                <span class="secret monospace">{{ secret.base32 }}</span>
                <button
                  @click.prevent="copyToClipboard"
                  class="text-gray-400 hover:text-green"
                >
                  <DuplicateIcon class="ml-1 w-5 h-5" />
                </button>
                <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
              </div>
              <button class="manualEntry__toggle text-left" @click="toggleManual">Use QR code</button>
            </div>
            <div v-else>
              <figure v-show="totpAuthUrl">
                <VueQrcode
                  :value="totpAuthUrl"
                  :options="{
                    margin: 1,
                    width: 150
                  }"
                />
              </figure>
              <span class="mt-1 block text-left">QR code not working?
                <button class="manualEntry__toggle" @click="toggleManual">Try manual entry</button>
              </span>
            </div>
          </div>
        </li>
        <li>Enter the verification code provided by Google Authenticator and click 'Enable 2FA'.</li>
        <li>You can disable 2FA at any time by entering your verification code.</li>
        <!-- confirmation code input and button-->
        <div class="input-field flex items-center w-full">
          <input
            v-model="v$.confirmationCode.$model"
            label="Confirmation code"
            autocomplete="off"
            class="text-center overflow-hidden flex-1 px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
            v-mask="'# # # # # #'"
            placeholder="1 2 3 4 5 6"
            @keypress.enter=enable2FA
          />
          <button
            class="rounded-l-none text-sm py-3 button button--success w-32"
            @click="enable2FA"
            :disabled="!canEnable"
          >
            <div v-if="isLoading" class="flex flex-row items-center">
              <span>Verifying</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else >Enable 2FA</span>
          </button>
        </div>
      </ol>
      <!-- error message  -->
      <ValidationError :errors="v$.confirmationCode.$errors" />
      <div v-if="errors.confirmationCode" class="flex items-center errorMessage">
        <ExclamationIcon class="w-3.5 h-3.5" />
        <span class="errorMessage__text">{{ errors.confirmationCode }}</span>
      </div>
    </div>

    <div v-else class="flex flex-col space-y-2"
      :class="createAccount ? 'createAccount' : 'md:grid'"
    >
      <div class="flex items-center mb-2">
        <div><BadgeCheckIcon class="h-5 mr-1 text-green" /></div>
        <span>Two-factor authentication enabled.</span>
      </div>
      <span>If you lose your authenticator device, you can use these backup codes to access your account. Each code can only be used once.</span>
      <span>Store your codes in a safe place. <strong>They will no longer be visible after you close the page or confirm you have stored them</strong>.</span>
      <div class="backupCodes__grid text-center grid grid-cols-2 sm:grid-cols-5 gap-y-2 gap-x-2 py-4">
        <span v-for="code in backupCodes" :key="code"
          class="monospace text-lg rounded bg-gray-300 p-1"
        >{{ code }}</span>
      </div>
      <button @click="confirmStoredCodes" class="button button--success mt-4">
        <span>I confirm have stored my backup codes in a safe place</span>
      </button>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import * as format from '@/utils/format'
import * as validation from '@/utils/validation'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ValidationError from '@/components/ValidationError.vue'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import speakeasy from 'speakeasy'
import useVuelidate from '@vuelidate/core'
import { DuplicateIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { mapActions, mapState } from 'vuex'

export default {
  props: ['confirmEnabled', 'createAccount'],
  components: {
    BadgeCheckIcon,
    DuplicateIcon,
    ExclamationIcon,
    LoadingSpinner,
    ValidationError,
    VueQrcode
  },
  data() {
    return {
      confirmationCode: null,
      copied: false,
      errors: {
        confirmationCode: ''
      },
      isLoading: false,
      manualEntry: false,
      secret: speakeasy.generateSecret()
    }
  },
  validations() {
    return {
      confirmationCode: [
        validation.confirmationCode
      ]
    }
  },
  computed: {
    ...mapState(['account', 'backupCodes', 'session']),
    canEnable() {
      return !this.v$.confirmationCode.$invalid && !this.errors.confirmationCode && !this.isLoading
    },
    otp() {
      return format.removeSpaces(this.confirmationCode)
    },
    totpAuthUrl() {
      return speakeasy.otpauthURL({
        secret: this.secret.ascii,
        label: `Edge Accounts (— — — ${this.account._key.slice(-4)})`,
        algorithm: 'sha1'
      })
    }
  },
  methods: {
    ...mapActions(['updateAccount']),
    confirmStoredCodes() {
      this.$store.dispatch('removeBackupCodes')
    },
    async copyToClipboard () {
      await navigator.clipboard.writeText(this.secret.base32)
      this.copied = true

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    async enable2FA() {
      if (this.v$.confirmationCode.$invalid) return

      this.isLoading = true
      try {
        const { totp } = await api.accounts.addTOTP(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
            otp: this.otp,
            secret: this.secret.base32
          }
        )
        this.$store.commit('setBackupCodes', totp.backupCodes)
        await this.updateAccount()
        this.$emit('enable2FA')
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          this.errors.confirmationCode = 'Verification code invalid'
          this.isLoading = false
        }, 1000)
      }
    },
    toggleManual() {
      this.manualEntry = !this.manualEntry
    }
  },
  unmounted() {
    this.$store.dispatch('removeBackupCodes')
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    confirmationCode() {
      // reset confirmation code error (i.e. invalid) when input is changed
      this.errors.confirmationCode = ''
    }
  }
}
</script>

<style scoped>
ol:not([class]) {
  @apply mb-0;
}

.qrcode {
  @apply justify-start items-start;
  height: max-content;
}
.qrcode.inflow {
  @apply mt-2
}
.createAccount .qrcode.inflow {
  @apply flex;
}
.qrcode.accountPage {
 @apply hidden md:flex md:col-start-2 ml-4;
}

.createAccount .backupCodes__grid {
  @apply grid-cols-2;
}

.input-field {
  @apply w-full md:col-span-2;
  max-width: 548px;
}

.manualEntry {
  @apply block break-words flex flex-col space-y-2;
  width: 152px;
}
.inflow .manualEntry {
  @apply w-max max-w-full;
}
.manual {
  @apply block;
  width: 150px
}
.manualEntry__toggle {
  @apply text-green underline hover:text-green-600;
}
.secret {
  @apply break-words;
  max-width: calc(100% - 30px);
}
@media (min-width: 560px) {
  .secret {
    max-width: 100%;
  }
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.createAccount .copied {
  @apply bg-gray-200;
}
.copied.visible {
  @apply opacity-100;
}

@media (max-width: 450px) {
  /* split input and button into two rows on small screens*/
  .input-field {
    @apply flex-col;
  }

  .input-field input {
    @apply w-full border-r rounded-r-md mb-2;
  }

  .input-field .button {
    @apply w-full rounded-l-md;
  }
}

@media (max-width: 350px) {
  .createAccount .backupCodes__grid .code {
  @apply text-sm;
}
}

</style>
