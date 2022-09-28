<template>
  <div>
    <!-- add recovery email address step -->
    <div v-show="step === 1" class="my-2">
      <p class="text-gray-500">
        Add an email address to your account so that it may be recovered in the event that you lose your account number.
      </p>
      <!-- email input and button -->
      <div class="input-field flex items-center w-full">
        <input
          v-model="v$.email.$model"
          label="Email address"
          type="email"
          autocomplete="off"
          class="overflow-hidden flex-1 px-3 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
          :class="createAccount ? 'smaller-font' : 'text-lg py-2'"
          placeholder="Enter email address"
          @keypress.enter=enableRecovery
        />
        <button
          class="rounded-l-none text-sm py-3 button button--success w-32"
          @click.prevent="enableRecovery"
          :disabled="!canEnable"
        >
          <div v-if="isLoading" class="flex flex-row items-center">
            <span>Adding</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Add</span>
        </button>
      </div>
      <!-- error message  -->
      <ValidationError :errors="v$.email.$errors" />
      <div class="mt-2" v-if="errors.email">
        <HttpError :error="errors.email" />
      </div>
    </div>

    <!-- verify recovery email step -->
    <div v-show="step === 2" class="my-2">
      <!-- email sent message -->
      <div class="flex mb-2 items-center">
        <div>
          <BadgeCheckIcon class="h-5 text-green" />
        </div>
        <span class="ml-1 text-green">Confirmation email sent to {{ email }}</span>
      </div>
      <!-- instructions -->
      <span class="text-gray-500">
        Not quite there yet.
        Check your emails and enter the confirmation code below to verify your recovery email address.
      </span>
      <!-- resend email button and feedback -->
      <p class="text-gray-500 my-2">
        Haven't received the email?
        <!-- eslint-disable-next-line max-len -->
        <span v-if="emailCooldown === 0"><span @click="returnToEnable" class="underline cursor-pointer hover:text-green">Click here</span> to change your recovery email address.</span>
        <span v-else>Please wait {{ emailCooldown }} seconds.</span>
      </p>
      <!-- confirmation code and button -->
      <div class="input-field flex items-center w-full">
        <input
          v-model="v$.confirmationCode.$model"
          label="Confirmation code"
          autocomplete="off"
          class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
          v-mask="'# # # # # #'"
          placeholder="1 2 3 4 5 6"
          @keypress.enter=verifyRecovery
        />
        <button
          class="order-2 rounded-l-none text-sm py-3 button button--success py-2 w-32"
          @click.prevent="verifyRecovery"
          :disabled="!canVerify"
        >
          <div v-if="isLoading" class="flex flex-row items-center">
            <span>Verifying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Verify</span>
        </button>
      </div>
      <!-- error message  -->
      <ValidationError :errors="v$.confirmationCode.$errors" />
      <div v-if="errors.confirmationCode" class="flex items-center errorMessage mt-1">
        <ExclamationIcon class="w-3.5 h-3.5" />
        <span class="errorMessage__text">{{ errors.confirmationCode }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@/account-utils/index'
import * as validation from '@/utils/validation'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    BadgeCheckIcon,
    ExclamationIcon,
    HttpError,
    LoadingSpinner,
    ValidationError
  },
  data() {
    return {
      confirmationCode: '',
      email: '',
      emailCooldown: 0,
      errors: {
        confirmationCode: '',
        email: ''
      },
      httpError: {response: {body: {message: 'test'}}},
      isLoading: false,
      step: 1
    }
  },
  validations() {
    return {
      email: [
        validation.email,
        validation.required
      ],
      confirmationCode: [
        validation.confirmationCode
      ]
    }
  },
  props: ['createAccount'],
  computed: {
    ...mapState(['account', 'session']),
    canEnable() {
      return !this.v$.email.$invalid && !this.errors.email && !this.isLoading
    },
    canVerify() {
      return !this.v$.confirmationCode.$invalid && !this.errors.confirmationCode && !this.isLoading
    },
    recoverySecret() {
      return format.removeSpaces(this.confirmationCode)
    }
  },
  mounted() {
    if (this.account && this.account.email) {
      this.email = this.account.email
    }
  },
  methods: {
    ...mapActions(['updateAccount']),
    async enableRecovery() {
      if (this.v$.email.$invalid) return
      this.isLoading = true

      try {
        await utils.accounts.enableRecovery(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.email
        )
        await this.updateAccount()

        setTimeout(async () => {
          // set 15s email cooldown timer
          this.emailCooldown = 15
          this.iEmailCooldown = setInterval(() => {
            this.emailCooldown = this.emailCooldown - 1
            if (this.emailCooldown === 0) clearInterval(this.iEmailCooldown)
          }, 1000)

          this.isLoading = false
          this.step = 2
        }, 500)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.email = error
          this.isLoading = false
        }, 1000)
      }
    },
    returnToEnable() {
      this.email = ''
      this.step = 1
    },
    async verifyRecovery() {
      if (this.v$.confirmationCode.$invalid) return
      this.isLoading = true
      try {
        await utils.accounts.verifyRecovery(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.recoverySecret
        )
        setTimeout(async () => {
          await this.updateAccount()
          this.isLoading = false
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.confirmationCode = 'Verification code invalid'
          this.isLoading = false
        }, 1000)
      }
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    confirmationCode() {
      this.errors.confirmationCode = ''
    },
    email() {
      this.errors.email = ''
    }
  }
}
</script>

<style scoped>
.input-field {
  max-width: 548px;
}

@media (max-width: 450px) {
  /* split input and button into two rows */
  .input-field {
    @apply w-full flex-col;
  }

  .input-field input {
    @apply w-full border-r rounded-r-md mb-2 text-md;
  }

  .input-field .button {
    @apply w-full rounded-l-md;
  }
}

.input-field .smaller-font {
  @apply text-md;
  padding-top: calc(0.75rem - 1px);
  padding-block: calc(0.75rem - 1px);
}
</style>
