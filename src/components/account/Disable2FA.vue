<template>
  <div class="flex flex-col text-gray-500 space-y-2">
    <div class="flex items-center">
      <div><BadgeCheckIcon class="h-5 mr-1 text-green" /></div>
      <span>Two-factor authentication is enabled ({{ account.totps }} connected).</span>
    </div>
    <span>To disable two-factor authentication, please enter
      <span v-if="useBackupCode">one of your backup codes to disable 2FA. This backup code will become invalid after use.</span>
      <span v-else>the TOTP code in your authenticator app to disable 2FA.</span>
    </span>

    <!-- backup code/otp toggle button -->
    <p v-if="useBackupCode" class="text-gray-500">Alternatively, go back to <button @click="toggleUseBackupCode" class="underline hover:text-green">use your 2FA device</button>.</p>
    <p v-else class="text-gray-500">Lost your authenticator device? You can <button @click="toggleUseBackupCode" class="underline hover:text-green">enter a backup code</button> instead.</p>

    <!-- confirmation code and button -->
    <div class="input-field flex items-center w-full pt-2">
      <input
        v-if="useBackupCode"
        v-model="v$.backupCode.$model"
        label="Confirmation code"
        autocomplete="off"
        class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
        v-mask="'NNNNNNNN'"
        placeholder="1a2bc34d"
        @keypress.enter=disable2FA
      />
      <input
        v-else
        v-model="v$.confirmationCode.$model"
        label="Confirmation code"
        autocomplete="off"
        class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
        v-mask="'# # # # # #'"
        placeholder="1 2 3 4 5 6"
        @keypress.enter=disable2FA
      />
      <button
        class="order-2 rounded-l-none text-sm py-3 button button--error py-2 w-32"
        @click.prevent="disable2FA"
        :disabled="!canDisable"
      >
        <div v-if="isLoading" class="flex flex-row items-center">
          <span>Disabling</span>
          <span class="ml-2"><LoadingSpinner /></span>
        </div>
        <span v-else>Disable</span>
      </button>
    </div>
    <!-- error message  -->
    <div v-if="useBackupCode"><ValidationError :errors="v$.backupCode.$errors"/></div>
    <ValidationError v-else :errors="v$.confirmationCode.$errors"/>
    <HttpError :error=httpError />
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import * as validation from '@/utils/validation'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    BadgeCheckIcon,
    HttpError,
    LoadingSpinner,
    ValidationError
  },
  data() {
    return {
      confirmationCode: '',
      httpError: '',
      isLoading: false,
      backupCode: '',
      useBackupCode: false
    }
  },
  validations() {
    return {
      confirmationCode: [
        validation.confirmationCode
      ],
      backupCode : [
        validation.backupCode
      ]
    }
  },
  computed: {
    ...mapState(['account', 'session']),
    canDisable() {
      if (this.isLoading) return false
      if (this.useBackupCode) return !this.v$.backupCode.$invalid
      return !this.v$.confirmationCode.$invalid
    },
    codeModel() {
      return this.useBackupCode ? this.v$.confirmationCode.$model : this.v$.confirmationCode.$model
    },
    otp() {
      return format.removeSpaces(this.confirmationCode)
    }
  },
  methods: {
    ...mapActions(['updateAccount']),
    async disable2FA() {
      this.isLoading = true
      try {
        await utils.removeAccountTOTP(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          account: this.account._key,
          backupCode: this.useBackupCode ? this.backupCode : undefined,
          otp: this.useBackupCode ? undefined : this.otp
        })
        setTimeout(async () => {
          this.isLoading = false
          this.confirmationCode = ''
          this.backupCode = ''
          this.v$.$reset()
          await this.updateAccount()
        }, 500)
      }
      catch (error) {
        setTimeout(async () => {
          this.httpError = error
          this.isLoading = false
        }, 500)
      }
    },
    async toggleUseBackupCode() {
      this.backupCode = ''
      this.confirmationCode = ''
      await this.v$.$reset()
      this.useBackupCode = !this.useBackupCode
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    confirmationCode() {
      this.httpError = ''
    },
    backupCode() {
      this.httpError = ''
    }
  }
}
</script>

<style scoped>
.qrcode {
  @apply flex justify-center items-center mt-2;
}

.input-field {
  max-width: 548px;
}

@media (max-width: 450px) {
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
