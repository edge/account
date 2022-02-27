<template>
  <div>
    <div v-if="!user.totp">
      <a :href="twofactorUrl">
        <img :src="twofactorQR">
      </a>
      
      <ol>
        <li>Install the Google Authenticator app for <a href="https://itunes.apple.com/au/app/google-authenticator/id388497605?mt=8">iPhone</a> or <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Android</a>.</li>
        <li>Scan the QR code on this page.</li>
        <li>Save the single-use backup codes in case you lose access to your device. Note, you will still need your username and password.</li>
        <li>Enter the verification code provided by Google Authenticator and click 'Enable two-factor'.</li>
        <li>You can disable two-factor at any time.</li>
      </ol>
      
      <input
        v-model="totpToken"
        label="Two-factor code"
        type="text"
        autocomplete="off"
      />
      <span class="flex-1 order-1 text-red md:order-2" v-if="errors.totpToken">{{errors.totpToken}}</span>

      <div class="py-5">
        <button
          class="order-2 w-full mt-3 md:max-w-xs md:mt-0 button button--success md:order-1"
          @click="enable2fa"
          :disabled="errors.totpToken || !totpToken"
        >Enable two-factor</button>
      </div>
    </div>
    <div v-else>
      <div class="py-5">
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

        await this['auth/enable2fa'](body)
      }
    }
  }

</script>