<template>
  <div
    class="mt-5 text-gray-500"
    :class="createAccount ? 'createAccount' : 'md:grid'">
    <ol>
      <li>Install the Google Authenticator app for
        <a class="underline text-green" target="_blank"
        href="https://itunes.apple.com/au/app/google-authenticator/id388497605?mt=8">iPhone</a>
        or
        <a class="underline text-green" target="_blank"
        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Android</a>.
      </li>
      <li>Using the app, scan the QR code.
        <figure
          v-show="totpAuthUrl"
          class="qrcode inflow"
        >
          <VueQrcode
            :value="totpAuthUrl"
            :options="{
              margin: 1,
              width: 150
            }"
          />
        </figure>
      </li>
      <li>Enter the verification code provided by Google Authenticator and click 'Enable 2FA'.</li>
      <li>You can disable two-factor at any time.</li>
    </ol>
    <figure v-show="totpAuthUrl && !createAccount" class="qrcode accountPage">
      <VueQrcode
        :value="totpAuthUrl"
        :options="{
          margin: 1,
          width: 150
        }"
      />
    </figure>
    <!-- confirmation code input and button-->
    <div class="input-field flex items-center w-full">
      <input
        v-model="v$.confirmationCode.$model"
        label="Confirmation code"
        autocomplete="off"
        class="text-center overflow-hidden flex-1 px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
        v-mask="'# # # # # #'"
        placeholder="1 2 3 4 5 6"
        @keypress="enableOnEnter"
      />
      <button
        class="rounded-l-none text-sm py-3 button button--success w-32"
        @click="enable2FA"
        :disabled="!canEnable"
      >
        <div v-if="isLoading" class="flex flex-row items-center">
          <span>Verifying</span>
          <span><LoadingSpinner /></span>
        </div>
        <span v-else >Enable 2FA</span>
      </button>
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
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import { ExclamationIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import speakeasy from 'speakeasy'
import useVuelidate from '@vuelidate/core'
import { mapActions, mapState } from 'vuex'

export default {
  props: ['confirmEnabled', 'createAccount'],
  components: {
    ExclamationIcon,
    LoadingSpinner,
    VueQrcode
  },
  data() {
    return {
      confirmationCode: null,
      errors: {
        confirmationCode: ''
      },
      isLoading: false,
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
    ...mapState(['account', 'session']),
    canEnable() {
      return !this.v$.confirmationCode.$invalid && !this.errors.confirmationCode && !this.isLoading
    },
    otp() {
      return this.confirmationCode.split(' ').join('')
    },
    totpAuthUrl() {
      return this.secret.otpauth_url
    }
  },
  methods: {
    ...mapActions(['updateAccount']),
    async enable2FA() {
      if (this.v$.confirmationCode.$invalid) return

      this.isLoading = true
      try {
        await utils.accounts.enable2FA(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          {
            otp: this.otp,
            secret: this.secret.base32
          }
        )
        await this.updateAccount()
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          this.errors.confirmationCode = 'Verification code invalid'
          this.isLoading = false
        }, 1000)
      }
    },
    enableOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.enable2FA()
    }
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
.qrcode {
  @apply justify-start items-start;
  height: max-content;
}
.qrcode.inflow {
  @apply mt-2 md:hidden
}
.createAccount .qrcode.inflow {
  @apply flex;
}
.qrcode.accountPage {
 @apply hidden md:flex md:col-start-2 ml-4;
}

.input-field {
  @apply w-full md:col-span-2;
  max-width: 548px;
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


</style>
