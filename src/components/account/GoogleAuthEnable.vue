<template>
  <div>
    <div v-if="!user.totp">
      <div class="grid pb-10 lg:grid-cols-2">
        <div class="flex order-1 lg:justify-center lg:order-2">
          <a :href="twofactorUrl || user.twofactorUrl" class="w-1/3 lg:w-auto">
            <img class="w-full lg:w-60" :src="twofactorQR || user.twofactorQR">
          </a>
        </div>

        <div class="order-2 mt-5 text-gray-500 lg:mt-0 lg:order-1">
          <ol>
            <li>Install the Google Authenticator app for <a class="underline text-green" target="_blank" href="https://itunes.apple.com/au/app/google-authenticator/id388497605?mt=8">iPhone</a> or <a class="underline text-green" target="_blank" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Android</a>.</li>
            <li>Scan the QR code on this page.</li>
            <!-- <li>Save the single-use backup codes in case you lose access to your device. Note, you will still need your username and password.</li> -->
            <li>Enter the verification code provided by Google Authenticator and click 'Enable two-factor'.</li>
            <li>You can disable two-factor at any time.</li>
          </ol>

          <span class="flex-1 order-1 text-red lg:order-2" v-if="errors.totpToken">{{errors.totpToken}}</span>

          <div class="flex items-center w-full py-5">
            <input
              v-model="totpToken"
              label="Two-factor code"
              type="text"
              autocomplete="off"
              class="flex-1 w-full px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none"
              placeholder="Enter your authentication code"
            />
            <button
              class="order-2 rounded-l-none button button--success lg:order-1"
              @click="enable2fa"
              :disabled="!totpToken"
            >Enable two-factor</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="">
        <p class="text-gray-500">Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum.</p>
        <button
          class="order-2 w-full mt-3 md:max-w-xs md:mt-0 button button--success md:order-1"
          @click="disable2fa"
        >Disable two-factor</button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    props: ['user', 'twofactorQR', 'twofactorUrl'],
    data() {
      return {
        errors: {},
        totpToken: ''
      }
    },
    methods: {
      ...mapActions(['auth/enable2fa', 'auth/disable2fa']),
      async disable2fa() {
        const body = {
          accountNumber: this.user.accountNumber
        }

        await this['auth/disable2fa'](body)
      },
      async enable2fa() {
        // Check form is valid.
        if (!this.totpToken) {
          this.errors.totpToken = 'Please enter the code from your device'
        } else {
          this.errors.totpToken = ''
        }

        const body = {
          accountNumber: this.user.accountNumber,
          totpToken: this.totpToken,
          totpSecret: this.user.totpSecretTemp
        }

        const response = await this['auth/enable2fa'](body)

        if (!response) {
          this.errors.totpToken = 'Invalid code'
        }

        this.totpToken = ''
      }
    }
  }

</script>