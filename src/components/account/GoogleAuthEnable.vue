<template>
  <div>
    <div
      class="my-2"
      :class="fullScreen ? 'grid lg:grid-cols-2' : ''"
    >
      <div class="order-2 mt-5 text-gray-500 lg:mt-0 lg:order-1">
        <ol>
          <li>Install the Google Authenticator app for <a class="underline text-green" target="_blank" href="https://itunes.apple.com/au/app/google-authenticator/id388497605?mt=8">iPhone</a> or <a class="underline text-green" target="_blank" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Android</a>.</li>
          <li>Scan the QR code.
            <figure v-show="totpAuthUrl" class="qrcode">
              <VueQrcode
                :value="totpAuthUrl"
                :options="{
                  margin: 1,
                  width: fullScreen ? 300 : 150
                }"
              />
            </figure>
          </li>
          <li>Enter the verification code provided by Google Authenticator and click 'Enable two-factor'.</li>
          <li>You can disable two-factor at any time.</li>
        </ol>

        <div class="input-field flex items-center w-full">
          <input
            v-model="v$.confirmationCode.$model"
            label="Confirmation code"
            autocomplete="off"
            class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none "
            :class="fullScreen ? '' : 'border border-gray border-r-0'"
            v-mask="'# # # # # #'"
            placeholder="1 2 3 4 5 6"
            @keypress="verifyOnEnter"
          />
          <button
            class="order-2 rounded-l-none text-sm py-3 button button--success py-2 lg:order-1"
            @click="verify2fa"
            :disabled="v$.confirmationCode.$invalid || isLoading"
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
    </div>

    <!-- <div v-else>
      <div class="">
        <p class="text-gray-500">Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum.</p>
        <button
          class="order-2 w-full mt-3 md:max-w-xs md:mt-0 button button--success md:order-1"
          @click="disable2fa"
        >Disable 2FA</button>
      </div>
    </div> -->
  </div>
</template>

<script>
import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import { CheckCircleIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import useVuelidate from '@vuelidate/core'
import VueQrcode from '@chenfengyuan/vue-qrcode'

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

export default {
  props: ['confirmEnabled', 'fullScreen'],
  components: {
    CheckCircleIcon,
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
      totpAuthUrl: null,
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
    otpSecret() {
      return this.confirmationCode.split(' ').join('')
    }
  },
  methods: {
    async enable2fa() {
      const res = await utils.accounts.enable2fa(ACCOUNT_API_URL, this.session._key)
      this.totpAuthUrl = res.url
    },
    async updateAccount() {
      const account = await utils.accounts.getAccount(ACCOUNT_API_URL, this.session._key)
      this.$store.commit('setAccount', account)
    },
    async verify2fa() {
      if (this.v$.confirmationCode.$invalid) return
      this.isLoading = true
      try {
        await utils.accounts.verify2fa(ACCOUNT_API_URL, this.session._key, this.otpSecret)
        await this.updateAccount()
        this.confirmEnabled()
        this.isLoading = false

      } catch (error) {
        setTimeout(() => {
          this.confirmationCode = ''
          this.errors.confirmationCode = 'Verification code invalid'
          this.isLoading = false
        }, 1000)
      }
    },
    verifyOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.verify2fa()
    }
  },
  mounted() {
    this.enable2fa()
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
  @apply flex justify-center items-center mt-2;
}

@media (max-width: 400px) {
  /* split input and button into two rows */
  .input-field {
    @apply flex-col;
  }

  .input-field input {
    @apply w-full border-r rounded-r-md mb-2;
  }

  .input-field .button {
    @apply w-full rounded-l-md;
  }

  .qrcode {
    @apply justify-start items-start;
  }
}
</style>